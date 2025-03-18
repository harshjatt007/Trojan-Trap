"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { CloudUpload, AlertCircle, CheckCircle, FileText, Clock, Download } from "lucide-react"

const Scanner = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [report, setReport] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const navigate = useNavigate()

  // Function to generate a unique ID without using crypto
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setSelectedFile(file)
    setIsUploading(true)
    setErrorMessage("")
    setReport(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      // Use the correct API URL based on environment
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000"

      const response = await axios.post(`${apiUrl}/scan-file`, formData)

      if (response.data.success) {
        // Store scan ID and payment intent ID
        const { scanId, paymentIntentId } = response.data

        // For development, automatically process the payment
        setIsScanning(true)
        await processPayment(scanId, paymentIntentId)
      }
    } catch (error) {
      console.error("Upload error:", error)
      setErrorMessage(error.response?.data?.error || "Upload failed. Try again.")
      setIsUploading(false)
    }
  }

  const processPayment = async (scanId, paymentIntentId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000"

      const response = await axios.post(`${apiUrl}/verify-payment`, {
        scanId,
        paymentIntentId,
      })

      if (response.data.success && response.data.report) {
        setReport(response.data.report)

        // Store the report in localStorage for the Report page
        localStorage.setItem("scanReport", JSON.stringify(response.data.report))
        if (response.data.reportId) {
          localStorage.setItem("reportId", response.data.reportId)
        }
      } else {
        setErrorMessage("Failed to verify payment. Please try again.")
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      setErrorMessage("Failed to fetch report. Contact support.")
    } finally {
      setIsUploading(false)
      setIsScanning(false)
    }
  }

  const handleViewFullReport = () => {
    navigate("/report")
  }

  const formatReport = (report) => {
    const { fileName, fileSize, fileHash, scannedAt, isMalicious, details } = report

    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Scan Report</h2>
          <div
            className={`px-3 py-1 rounded-full text-white text-sm font-medium ${isMalicious ? "bg-red-500" : "bg-green-500"}`}
          >
            {isMalicious ? "Malicious" : "Safe"}
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

        <div className="border-t pt-4">
          <h3 className="font-bold text-lg mb-2">Analysis Result</h3>
          <div className={`flex items-start p-4 rounded-md ${isMalicious ? "bg-red-50" : "bg-green-50"}`}>
            {isMalicious ? (
              <AlertCircle className="w-6 h-6 mr-3 text-red-500 flex-shrink-0 mt-1" />
            ) : (
              <CheckCircle className="w-6 h-6 mr-3 text-green-500 flex-shrink-0 mt-1" />
            )}
            <div>
              <p className="font-medium">{details.description}</p>
              <p className="mt-2 text-sm text-gray-600">{details.recommendation}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleViewFullReport}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            View Full Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">File Scanner</h1>

      {!selectedFile && !isUploading && !report && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <CloudUpload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-lg mb-6 text-gray-600">Drag and drop your file here or click to browse</p>
          <label className="bg-green-500 hover:bg-red-500 text-white py-3 px-6 rounded-md cursor-pointer transition-all duration-300 inline-block font-medium">
            Select File
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {selectedFile && !report && (
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="font-medium mb-2">Selected File:</p>
          <p className="text-gray-600 mb-4">{selectedFile.name}</p>
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="loader-circle mb-4"></div>
              <p>{isScanning ? "Scanning file..." : "Uploading file..."}</p>
            </div>
          ) : (
            <p className="text-green-600 font-medium">File uploaded successfully!</p>
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
    </div>
  )
}

export default Scanner

