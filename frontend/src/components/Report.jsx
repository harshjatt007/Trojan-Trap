"use client"
import { motion } from "framer-motion"

const Report = () => {
  const exampleReport = {
    fileName: "example-file.zip",
    fileSize: "1.24 MB",
    fileHash: "b8c3c8f5e56453e0f4e2dc4eb8ef8b60e72acb354bbf6504c61d927a6a15cd67",
    scanDate: "2024-12-18 14:32:45",
    threatLevel: "Safe",
  }

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center">
      <motion.h1
        className="text-3xl font-bold mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Scan Report Example
      </motion.h1>

      <motion.div
        className="w-full max-w-2xl bg-white rounded-lg border-2 border-gray-200 p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="font-bold">File Name:</span>
            <span>{exampleReport.fileName}</span>
          </div>

          <div className="flex flex-col">
            <span className="font-bold">File Size:</span>
            <span>{exampleReport.fileSize}</span>
          </div>

          <div className="flex flex-col">
            <span className="font-bold">File Hash:</span>
            <span className="font-mono text-sm break-all">{exampleReport.fileHash}</span>
          </div>

          <div className="flex flex-col">
            <span className="font-bold">Scan Date:</span>
            <span>{exampleReport.scanDate}</span>
          </div>

          <div className="flex flex-col">
            <span className="font-bold">Threat Level:</span>
            <span className="text-green-500 font-bold">{exampleReport.threatLevel}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Report

