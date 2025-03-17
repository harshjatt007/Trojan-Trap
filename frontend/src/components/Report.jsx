"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Download, FileText, Clock, AlertCircle, CheckCircle } from "lucide-react"
import axios from "axios"

const Report = () => {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Example report for when no scan has been made
  const exampleReport = {
    fileName: "example-file.zip",
    fileSize: "1.24 MB",
    fileHash: "b8c3c8f5e56453e0f4e2dc4eb8ef8b60e72acb354bbf6504c61d927a6a15cd67",
    scannedAt: "2024-12-18 14:32:45",
    isMalicious: false,
    scanStatus: "Safe",
    details: {
      description: "The file appears safe and does not contain any known threats.",
      recommendation: "You can safely proceed with this file.",
    },
  }

  useEffect(() => {
    // Check if there's a report in localStorage
    const storedReport = localStorage.getItem("scanReport")
    const reportId = localStorage.getItem("reportId")

    if (storedReport) {
      try {
        setReport(JSON.parse(storedReport))
      } catch (error) {
        console.error("Error parsing stored report:", error)
      }
    } else if (reportId) {
      // If we have a reportId but no report, fetch it from the server
      fetchReport(reportId)
    }
  }, [])

  const fetchReport = async (reportId) => {
    setLoading(true)
    setError(null)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000"
      const response = await axios.get(`${apiUrl}/report/${reportId}`)

      if (response.data.success && response.data.report) {
        setReport(response.data.report)
        localStorage.setItem("scanReport", JSON.stringify(response.data.report))
      }
    } catch (error) {
      console.error("Error fetching report:", error)
      setError("Failed to fetch report. It may have expired or been removed.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = () => {
    const reportData = report || exampleReport
    const reportText = `
Scan Report
===========

File Name: ${reportData.fileName}
File Size: ${reportData.fileSize}
SHA-256 Hash: ${reportData.fileHash}
Scan Date: ${reportData.scannedAt}
Threat Level: ${reportData.isMalicious ? "Malicious" : "Safe"}

Analysis Result:
${reportData.details.description}

Recommendation:
${reportData.details.recommendation}
    `

    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `scan-report-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const reportData = report || exampleReport

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center">
      <motion.h1
        className="text-3xl font-bold mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {report ? "Your Scan Report" : "Scan Report Example"}
      </motion.h1>

      {loading ? (
        <div className="flex flex-col items-center">
          <div className="loader-circle mb-4"></div>
          <p>Loading report...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded w-full max-w-2xl">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <motion.div
          className="w-full max-w-2xl bg-white rounded-lg border-2 border-gray-200 p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Scan Details</h2>
            <div
              className={`px-3 py-1 rounded-full text-white text-sm font-medium ${reportData.isMalicious ? "bg-red-500" : "bg-green-500"}`}
            >
              {reportData.isMalicious ? "Malicious" : "Safe"}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                <span className="font-bold">File Name:</span>
                <span className="ml-2">{reportData.fileName}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-bold">File Size:</span>
              <span>{reportData.fileSize}</span>
            </div>

            <div className="flex flex-col">
              <span className="font-bold">File Hash:</span>
              <span className="font-mono text-sm break-all">{reportData.fileHash}</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-500" />
                <span className="font-bold">Scan Date:</span>
                <span className="ml-2">{new Date(reportData.scannedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-bold text-lg mb-2">Analysis Result</h3>
              <div
                className={`flex items-start p-4 rounded-md ${reportData.isMalicious ? "bg-red-50" : "bg-green-50"}`}
              >
                {reportData.isMalicious ? (
                  <AlertCircle className="w-6 h-6 mr-3 text-red-500 flex-shrink-0 mt-1" />
                ) : (
                  <CheckCircle className="w-6 h-6 mr-3 text-green-500 flex-shrink-0 mt-1" />
                )}
                <div>
                  <p className="font-medium">{reportData.details.description}</p>
                  <p className="mt-2 text-sm text-gray-600">{reportData.details.recommendation}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleDownloadReport}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Report
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Report

