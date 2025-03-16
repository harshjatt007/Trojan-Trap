"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"

// Text scramble effect
const TextScramble = () => {
  const [output, setOutput] = useState("")
  const finalText = "Trojan Trap"
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  useEffect(() => {
    let iteration = 0
    let interval = null

    clearInterval(interval)

    interval = setInterval(() => {
      let randomText = ""
      for (let i = 0; i < finalText.length; i++) {
        if (i < iteration) {
          randomText += finalText[i]
        } else {
          randomText += chars[Math.floor(Math.random() * chars.length)]
        }
      }

      setOutput(randomText)

      if (iteration >= finalText.length) {
        clearInterval(interval)
      }

      iteration += 1 / 3
    }, 30)

    return () => clearInterval(interval)
  }, [])

  return <span>{output}</span>
}

// Typewriter effect
const TypeWriter = ({ text }) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 100)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return <span>{displayText}</span>
}

const Home = () => {
  const [showTagline, setShowTagline] = useState(false)
  const { scrollYProgress } = useScroll()
  const containerRef = useRef(null)

  // Feature section visibility based on scroll
  const featureOneOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 1, 0])

  const featureTwoOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTagline(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full min-h-[200vh] flex flex-col items-center">
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-4">
        {/* Main Title */}
        <div className="heading text-center mb-16">
          <h1 className="font-mono text-7xl md:text-8xl tracking-wider">
            <TextScramble />
          </h1>
        </div>

        {/* Upload Button */}
        <Link to="/" className="w-full max-w-md">
          <button className="w-full py-4 px-8 bg-green-500 hover:bg-red-500 text-white rounded-full text-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
            Upload to Scan
          </button>
        </Link>

        {/* Tagline */}
        <div className="mt-4 mb-16 text-xl text-gray-700 font-medium h-8 overflow-hidden">
          {showTagline && <TypeWriter text="Protection Made Easy!" />}
        </div>
      </div>

      {/* Scrolling Features Section */}
      <div className="w-full" ref={containerRef}>
        <motion.div
          className="Cards sticky top-[10vh] md:top-[15vh] text-center w-[90%] md:w-[27vw] flex flex-col items-center gap-5 px-[20px] md:px-[30px] py-[5vh] md:py-[10vh] rounded-lg mx-auto"
          style={{ opacity: featureOneOpacity }}
        >
          <img className="w-[100px] md:w-[150px]" src="/cloud-upload.svg" alt="File Upload" />
          <h1 className="text-2xl md:text-4xl">File Upload and Storage</h1>
          <p className="text-sm md:text-base font-thin">Handles file uploads and temporary storage.</p>
        </motion.div>

        <motion.div
          className="Cards sticky top-[10vh] md:top-[15vh] text-center w-[90%] md:w-[27vw] flex flex-col items-center gap-5 px-[20px] md:px-[30px] py-[5vh] md:py-[10vh] rounded-lg mx-auto"
          style={{ opacity: featureTwoOpacity }}
        >
          <img className="w-[100px] md:w-[150px]" src="/magnifying-glass.svg" alt="SHA 256" />
          <h1 className="text-2xl md:text-4xl">SHA 256 Algorithm</h1>
          <p className="text-sm md:text-base font-thin">Computes a unique fingerprint for files.</p>
        </motion.div>
      </div>
    </div>
  )
}

export default Home

