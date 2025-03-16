"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const malwareData = [
  {
    name: "LockBit Ransomware",
    type: "Ransomware",
    date: "December 14, 2024",
    threatLevel: "High",
    description:
      "LockBit is a ransomware-as-a-service (RaaS) malware that encrypts files on infected systems and demands payment in cryptocurrency. It targets businesses and critical infrastructure.",
  },
  {
    name: "Agent Tesla",
    type: "Keylogger/Infostealer",
    date: "December 12, 2024",
    threatLevel: "Medium",
    description:
      "Agent Tesla is a malware that captures keystrokes, screenshots, and clipboard data, stealing sensitive information like login credentials and financial data.",
  },
  {
    name: "Emotet",
    type: "Trojan",
    date: "December 10, 2024",
    threatLevel: "High",
    description:
      "Emotet is a banking Trojan designed to steal sensitive information such as financial details and login credentials. It spreads through phishing emails with malicious attachments or links.",
  },
  {
    name: "Qbot",
    type: "Trojan",
    date: "December 15, 2024",
    threatLevel: "Medium",
    description:
      "Qbot is a banking Trojan that steals sensitive information, including banking details and login credentials. It is often delivered through phishing campaigns.",
  },
]

const LiveUpdates = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const itemsPerPage = 1
  const totalPages = Math.ceil(malwareData.length / itemsPerPage)

  // Auto-cycle through news items
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
    }, 5000)

    return () => clearInterval(interval)
  }, [totalPages])

  // Animation for the window
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setIsAnimating((prev) => !prev)
    }, 3000)

    return () => clearInterval(animationInterval)
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-12">
        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        <h1 className="text-4xl font-bold">Live Updates!</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Left side animation */}
        <div className="md:w-1/2 flex justify-center">
          <motion.div
            animate={{
              rotateY: isAnimating ? 0 : 180,
              transition: { duration: 1.5 },
            }}
            className="w-full max-w-md"
          >
            <WindowAnimation />
          </motion.div>
        </div>

        {/* Right side content */}
        <div className="md:w-1/2">
          <div className="carousel-item h-full w-full lg:w-[85%] my-8 flex justify-center items-center">
            <div className="lg:w-[90%] w-[100%] sm:text-xl px-3 p-8 rounded-2xl shadow-2xl bg-white text-black h-fit flex flex-col gap-4 font-semibold border-2 border-black">
              <div className="flex gap-2 border-b-2 border-black">
                <p className="font-semibold text-green-600">Malware Name : </p>
                <p>{malwareData[currentPage].name}</p>
              </div>
              <div className="flex gap-2 border-b-2 border-black">
                <p className="font-semibold text-green-600">Type : </p>
                <p>{malwareData[currentPage].type}</p>
              </div>
              <div className="flex gap-2 border-b-2 border-black">
                <p className="font-semibold text-green-600">Date : </p>
                <p>{malwareData[currentPage].date}</p>
              </div>
              <div className="flex gap-2 border-b-2 border-black">
                <p className="font-semibold text-green-600">Threat Level: </p>
                <p className={malwareData[currentPage].threatLevel === "High" ? "text-red-600" : "text-orange-500"}>
                  {malwareData[currentPage].threatLevel}
                </p>
              </div>
              <div className="flex lg:gap-2 xl:flex-row flex-col border-b-2 border-black">
                <p className="font-semibold text-green-600">Description: </p>
                <p>{malwareData[currentPage].description}</p>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentPage === index ? "bg-green-500 w-6" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const WindowAnimation = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <g transform="rotate(-15 400 300)">
        <rect x="100" y="50" width="400" height="300" rx="10" fill="#f0f0f0" stroke="#000" strokeWidth="2" />
        <rect x="150" y="100" width="300" height="200" rx="5" fill="#fff" stroke="#000" strokeWidth="2" />
        <circle cx="120" cy="70" r="5" fill="#ff6b6b" />
        <circle cx="140" cy="70" r="5" fill="#ffd93d" />
        <circle cx="160" cy="70" r="5" fill="#6bff6b" />
      </g>
      <g transform="translate(50 50)">
        <rect x="200" y="100" width="400" height="300" rx="10" fill="#f0f0f0" stroke="#000" strokeWidth="2" />
        <rect x="250" y="150" width="300" height="200" rx="5" fill="#fff" stroke="#000" strokeWidth="2" />
        <circle cx="220" cy="120" r="5" fill="#ff6b6b" />
        <circle cx="240" cy="120" r="5" fill="#ffd93d" />
        <circle cx="260" cy="120" r="5" fill="#6bff6b" />
        <text x="300" y="200" fontFamily="monospace" fontSize="20" fill="#000">
          &lt;/&gt;
        </text>
      </g>
    </svg>
  )
}

export default LiveUpdates

