"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  CloudUpload,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  Download,
  Shield,
  Loader,
  RefreshCw,
  AlertTriangle,
  Zap,
} from "lucide-react"
import { analyzeFile, getRecommendation, getThreatLevelColor } from "../libs/scanUtils"
import { uploadFile, apiCall, API_ENDPOINTS, createPaymentIntent } from "../config/api"
import PaymentModal from "./PaymentModal"
import * as crypto from "crypto-js"

// Function to calculate file hash (SHA-256)
const calculateFileHash = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const wordArray = crypto.lib.WordArray.create(event.target.result)
      const hash = crypto.SHA256(wordArray).toString()
      resolve(hash)
    }
    reader.readAsArrayBuffer(file)
  })
}

// Function to check if file requires payment before upload
const checkFileRequirements = (file) => {
  const fileSizeMB = file.size / (1024 * 1024);
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const dangerousExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'msi', 'dmg', 'app'];
  
  const isLargeFile = fileSizeMB > 50; // Files larger than 50MB require payment
  const isPotentiallyDangerous = dangerousExtensions.includes(fileExtension);
  
  let requiresPayment = false;
  let paymentReason = null;
  let scanType = "basic";
  
  if (isLargeFile) {
    requiresPayment = true;
    paymentReason = `Large file (${fileSizeMB.toFixed(1)}MB) - Premium scan required`;
    scanType = "premium";
  } else if (isPotentiallyDangerous) {
    requiresPayment = true;
    paymentReason = `Potentially dangerous file type (.${fileExtension}) - Advanced scan required`;
    scanType = "premium";
  }
  
  return {
    requiresPayment,
    paymentReason,
    scanType,
    fileSizeMB: fileSizeMB.toFixed(1),
    fileType: fileExtension,
    isPotentiallyDangerous
  };
};

const Scanner = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStep, setScanStep] = useState("initializing")
  const [errorMessage, setErrorMessage] = useState("")
  const [report, setReport] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileHash, setFileHash] = useState(null)
  const [scanId, setScanId] = useState(null)
  const [reportId, setReportId] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState(null)
  const [pendingUploadResult, setPendingUploadResult] = useState(null)
  const navigate = useNavigate()

  // Progress bar animation
  useEffect(() => {
    let interval
    if (isScanning && scanProgress < 100) {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          const increment = Math.random() * 15
          return Math.min(prev + increment, 100)
        })
      }, 500)
    }

    return () => clearInterval(interval)
  }, [isScanning, scanProgress])

  // Update scan step based on progress
  useEffect(() => {
    if (isScanning) {
      if (scanProgress < 20) {
        setScanStep("initializing")
      } else if (scanProgress < 40) {
        setScanStep("analyzing file structure")
      } else if (scanProgress < 60) {
        setScanStep("checking signatures")
      } else if (scanProgress < 80) {
        setScanStep("deep scanning")
      } else if (scanProgress < 95) {
        setScanStep("verifying results")
      } else {
        setScanStep("finalizing")
      }
    }
  }, [scanProgress, isScanning])

  // Process the scan
  const processScan = async (file, hash) => {
    try {
      setIsScanning(true)
      setScanProgress(0)

      // Generate a unique scan ID
      const scanIdValue = crypto.lib.WordArray.random(16).toString()
      setScanId(scanIdValue)

      // Pre-check file requirements before upload
      setScanStep("checking file requirements")
      setScanProgress(5)
      
      const fileRequirements = checkFileRequirements(file);
      
      // Check if payment is required BEFORE upload
      if (fileRequirements.requiresPayment) {
        setScanStep("payment required")
        setScanProgress(50)
        
        // Show payment requirement message
        setErrorMessage(`Premium scan required: ${fileRequirements.paymentReason}. Please proceed with payment.`)
        
        // Create payment intent
        const paymentData = {
          fileName: file.name,
          fileSize: file.size,
          fileType: fileRequirements.fileType,
          scanType: fileRequirements.scanType
        };
        
        const paymentIntentResult = await createPaymentIntent(paymentData);
        
        // Store payment info and show payment modal
        setPaymentIntent(paymentIntentResult);
        setPendingUploadResult(fileRequirements);
        setShowPaymentModal(true);
        
        return; // Stop here until payment is completed
      }

      // Upload file to backend (only for files that don't require payment)
      setScanStep("uploading file")
      setScanProgress(10)
      
      const uploadResult = await uploadFile(file)
      
      // Check if upload failed but requires payment
      if (!uploadResult.success) {
        if (uploadResult.requiresPayment) {
          setScanStep("payment required")
          setScanProgress(50)
          
          // Show payment requirement message
          setErrorMessage(`Premium scan required: ${uploadResult.paymentReason}. Please proceed with payment.`)
          
          // Create payment intent
          const paymentData = {
            fileName: file.name,
            fileSize: file.size,
            fileType: fileRequirements.fileType,
            scanType: uploadResult.scanType
          };
          
          const paymentIntentResult = await createPaymentIntent(paymentData);
          
          // Store payment info and show payment modal
          setPaymentIntent(paymentIntentResult);
          setPendingUploadResult(uploadResult);
          setShowPaymentModal(true);
          
          return; // Stop here until payment is completed
        }
        
        throw new Error(uploadResult.error || "File upload failed")
      }

      setScanProgress(30)
      setScanStep("analyzing file structure")

      // Start the scan process with enhanced data
      const scanResult = await apiCall(API_ENDPOINTS.SCAN_FILE, {
        method: 'POST',
        body: JSON.stringify({
          scanId: scanIdValue,
          fileName: file.name,
          fileHash: hash,
          fileSize: file.size,
          fileType: uploadResult.fileType,
          scanType: uploadResult.scanType || "basic"
        })
      })

      if (!scanResult.success) {
        throw new Error(scanResult.error || "Scan failed")
      }

      setScanProgress(70)
      setScanStep("verifying results")

      // Create the report with enhanced information
      const scanReport = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        fileHash: hash,
        scannedAt: new Date().toISOString(),
        scanStatus: scanResult.scanStatus || "completed",
        fileType: scanResult.fileType || file.name.split(".").pop().toUpperCase() || "UNKNOWN",
        isMalicious: scanResult.isMalicious || false,
        threatLevel: scanResult.threatLevel || "Low",
        detectionCount: scanResult.detectionCount || 0,
        detectionCategories: scanResult.detectionCategories || {},
        threats: scanResult.threats || [],
        isPotentiallyDangerous: scanResult.isPotentiallyDangerous || false,
        isKnownMalicious: scanResult.isKnownMalicious || false,
        scanType: scanResult.scanType || "basic",
        details: scanResult.details || {
          description: "Scan completed successfully.",
          recommendation: "Review the results below."
        },
        scanId: scanIdValue
      }

      // Generate a report ID
      const reportIdValue = crypto.lib.WordArray.random(16).toString()
      setReportId(reportIdValue)

      // Store the report
      setReport(scanReport)
      localStorage.setItem("scanReport", JSON.stringify(scanReport))
      localStorage.setItem("reportId", reportIdValue)

      // Complete the scan
      setScanProgress(100)
      setScanStep("finalizing")
    } catch (error) {
      console.error("Scan processing error:", error)
      setErrorMessage("An error occurred during scanning. Please try again.")
    } finally {
      setIsScanning(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setIsUploading(true)
    setErrorMessage("")
    setReport(null)
    setScanProgress(0)

    try {
      // Calculate file hash
      const hash = await calculateFileHash(file)
      setFileHash(hash)

      // Process the scan with the file and hash
      await processScan(file, hash)
    } catch (error) {
      console.error("File handling error:", error)
      setErrorMessage("File processing failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    setSelectedFile(file)
    setIsUploading(true)
    setErrorMessage("")
    setReport(null)
    setScanProgress(0)

    try {
      // Calculate file hash
      const hash = await calculateFileHash(file)
      setFileHash(hash)

      // Process the scan with the file and hash
      await processScan(file, hash)
    } catch (error) {
      console.error("File handling error:", error)
      setErrorMessage("File processing failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleViewFullReport = () => {
    navigate("/report")
  }

  const handleReset = () => {
    setSelectedFile(null)
    setFileHash(null)
    setReport(null)
    setScanProgress(0)
    setErrorMessage("")
    setShowPaymentModal(false)
    setPaymentIntent(null)
    setPendingUploadResult(null)
  }

  const handlePaymentSuccess = async (confirmedPaymentIntent) => {
    setShowPaymentModal(false);
    setErrorMessage("");
    
    // Continue with the scan after successful payment
    if (pendingUploadResult && selectedFile) {
      setScanStep("uploading file after payment");
      setScanProgress(60);
      
      try {
        // Upload the file after payment
        const uploadResult = await uploadFile(selectedFile);
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "File upload failed");
        }

        setScanProgress(70);
        setScanStep("processing premium scan");
        
        // Continue with the scan process
        const scanResult = await apiCall(API_ENDPOINTS.SCAN_FILE, {
          method: 'POST',
          body: JSON.stringify({
            scanId: scanId,
            fileName: selectedFile.name,
            fileHash: fileHash,
            fileSize: selectedFile.size,
            fileType: pendingUploadResult.fileType,
            scanType: "premium"
          })
        });

        if (!scanResult.success) {
          throw new Error(scanResult.error || "Scan failed");
        }

        setScanProgress(90);
        setScanStep("verifying results");

        // Create the premium report
        const scanReport = {
          fileName: selectedFile.name,
          fileSize: `${(selectedFile.size / 1024).toFixed(2)} KB`,
          fileHash: fileHash,
          scannedAt: new Date().toISOString(),
          scanStatus: scanResult.scanStatus || "completed",
          fileType: scanResult.fileType || selectedFile.name.split(".").pop().toUpperCase() || "UNKNOWN",
          isMalicious: scanResult.isMalicious || false,
          threatLevel: scanResult.threatLevel || "Low",
          detectionCount: scanResult.detectionCount || 0,
          detectionCategories: scanResult.detectionCategories || {},
          threats: scanResult.threats || [],
          isPotentiallyDangerous: scanResult.isPotentiallyDangerous || false,
          isKnownMalicious: scanResult.isKnownMalicious || false,
          scanType: "premium",
          paymentStatus: "completed",
          paymentIntentId: confirmedPaymentIntent.id,
          details: scanResult.details || {
            description: "Premium scan completed successfully.",
            recommendation: "Review the results below."
          },
          scanId: scanId
        };

        const reportIdValue = crypto.lib.WordArray.random(16).toString();
        setReportId(reportIdValue);

        setReport(scanReport);
        localStorage.setItem("scanReport", JSON.stringify(scanReport));
        localStorage.setItem("reportId", reportIdValue);

        setScanProgress(100);
        setScanStep("finalizing");
      } catch (error) {
        console.error("Premium scan error:", error);
        setErrorMessage("An error occurred during premium scanning. Please try again.");
      } finally {
        setIsScanning(false);
      }
    }
  };

  // Render threat categories as a bar chart
  const renderThreatCategories = (categories) => {
    if (!categories) return null

    const items = [
      { name: "Virus", value: categories.virus, color: "bg-red-500" },
      { name: "Spyware", value: categories.spyware, color: "bg-purple-500" },
      { name: "Trojan", value: categories.trojan, color: "bg-yellow-500" },
      { name: "Ransomware", value: categories.ransomware, color: "bg-blue-500" },
      { name: "Adware", value: categories.adware, color: "bg-green-500" },
    ].filter((item) => item.value > 0)

    return (
      <div className="mt-4 space-y-3">
        <h4 className="font-medium text-gray-700">Threat Analysis:</h4>
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.name}</span>
              <span>{item.value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${item.value}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const formatReport = (report) => {
    const {
      fileName,
      fileSize,
      fileHash,
      scannedAt,
      isMalicious,
      details,
      threatLevel,
      detectionCount,
      detectionCategories,
      threats,
    } = report

    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Scan Report</h2>
          <div
            className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
              isMalicious ? "bg-red-500" : report.scanStatus === "suspicious" ? "bg-yellow-500" : "bg-green-500"
            }`}
          >
            {isMalicious ? "Malicious" : report.scanStatus === "suspicious" ? "Suspicious" : "Safe"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              <span className="font-medium">File Name:</span>
              <span className="ml-2 text-gray-600">{fileName}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-500" />
              <span className="font-medium">Scan Date:</span>
              <span className="ml-2 text-gray-600">{new Date(scannedAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-medium">File Size:</span>
              <span className="ml-2 text-gray-600">{fileSize}</span>
            </div>
            <div>
              <span className="font-medium">SHA-256 Hash:</span>
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">{fileHash}</div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Shield className="w-5 h-5 mr-2 text-gray-500" />
            <span className="font-medium">Threat Level:</span>
            <span className={`ml-2 ${getThreatLevelColor(threatLevel)}`}>{threatLevel}</span>
          </div>

          {detectionCount > 0 && (
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 mr-2 text-gray-500" />
              <span className="font-medium">Detections:</span>
              <span className="ml-2 text-gray-600">{detectionCount} engines flagged this file</span>
            </div>
          )}
        </div>

        {/* Threat categories visualization */}
        {(report.scanStatus === "malicious" || report.scanStatus === "suspicious") &&
          renderThreatCategories(detectionCategories)}

        {/* Specific threats */}
        {threats && threats.length > 0 && (
          <div className="mt-4 mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Detected Threats:</h4>
            <div className="space-y-2">
              {threats.map((threat, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-medium">{threat.name}</span>
                    <span
                      className={`text-sm px-2 py-0.5 rounded-full ${
                        threat.severity === "critical"
                          ? "bg-red-100 text-red-800"
                          : threat.severity === "high"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {threat.severity.charAt(0).toUpperCase() + threat.severity.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Category: {threat.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h3 className="font-bold text-lg mb-2">Analysis Result</h3>
          <div
            className={`flex items-start p-4 rounded-md ${
              isMalicious ? "bg-red-50" : report.scanStatus === "suspicious" ? "bg-yellow-50" : "bg-green-50"
            }`}
          >
            {isMalicious ? (
              <AlertCircle className="w-6 h-6 mr-3 text-red-500 flex-shrink-0 mt-1" />
            ) : report.scanStatus === "suspicious" ? (
              <AlertTriangle className="w-6 h-6 mr-3 text-yellow-500 flex-shrink-0 mt-1" />
            ) : (
              <CheckCircle className="w-6 h-6 mr-3 text-green-500 flex-shrink-0 mt-1" />
            )}
            <div>
              <p className="font-medium">{details.description}</p>
              <p className="mt-2 text-sm text-gray-600">{details.recommendation}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handleViewFullReport}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            View Full Report
          </button>

          <button
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Scan Another File
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">File Scanner</h1>

      {!selectedFile && !isUploading && !report && (
        <div
          className={`border-2 border-dashed ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300"} rounded-lg p-12 text-center transition-colors duration-300`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CloudUpload className={`w-16 h-16 mx-auto ${isDragging ? "text-green-500" : "text-gray-400"} mb-4`} />
          <p className="text-lg mb-6 text-gray-600">Drag and drop your file here or click to browse</p>
          <label className="bg-green-500 hover:bg-red-500 text-white py-3 px-6 rounded-md cursor-pointer transition-all duration-300 inline-block font-medium">
            Select File
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="mt-8 flex items-center justify-center text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-2" />
            <p>Files are scanned securely with advanced threat detection</p>
          </div>
        </div>
      )}

      {selectedFile && !report && (
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <p className="font-medium mb-2">Selected File:</p>
          <p className="text-gray-600 mb-4">{selectedFile.name}</p>
          <p className="text-sm text-gray-500 mb-4">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>

          {isUploading || isScanning ? (
            <div className="flex flex-col items-center">
              {isUploading ? (
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              ) : (
                <div className="w-full mb-6">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-1 text-green-600" />
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                          {scanStep}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-green-600">
                          {Math.round(scanProgress)}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                      <div
                        style={{ width: `${scanProgress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Loader className="w-5 h-5 mr-2 animate-spin text-green-500" />
                    <span>Analyzing file for threats...</span>
                  </div>
                </div>
              )}
              <p>{isUploading ? "Uploading file..." : "Scanning with multiple detection engines..."}</p>
            </div>
          ) : (
            <button
              onClick={() => processScan(selectedFile, fileHash)}
              className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-md flex items-center justify-center w-full"
            >
              <Shield className="w-5 h-5 mr-2" />
              Start Scan
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-6">
          <p className="font-medium">Error</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Report */}
      {report && formatReport(report)}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentIntent={paymentIntent}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

export default Scanner
