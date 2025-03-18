"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Shield, FileText, AlertTriangle, CheckCircle } from "lucide-react"

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
  const navigate = useNavigate()

  // Feature section visibility based on scroll
  const featureOneOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 1, 0])
  const featureTwoOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTagline(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleUploadClick = () => {
    navigate("/scanner")
  }

  return (
    <div className="w-full min-h-[200vh] flex flex-col items-center">
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-4">
        {/* Main Title with enhanced animation */}
        <motion.div
          className="heading text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-mono text-7xl md:text-8xl tracking-wider">
            <TextScramble />
          </h1>
        </motion.div>

        {/* Upload Button with enhanced styling */}
        <motion.button
          onClick={handleUploadClick}
          className="w-full max-w-md py-4 px-8 bg-green-500 hover:bg-red-600 text-white rounded-full text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          Upload to Scan
        </motion.button>

        {/* Tagline with enhanced animation */}
        <motion.div
          className="mt-4 mb-16 text-xl text-gray-700 font-medium h-8 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {showTagline && <TypeWriter text="Protection Made Easy!" />}
        </motion.div>
      </div>

      {/* Enhanced Scrolling Features Section */}
      <div className="w-full" ref={containerRef}>
        <motion.div
          className="Cards sticky top-[10vh] md:top-[15vh] text-center w-[90%] md:w-[27vw] flex flex-col items-center gap-5 px-[20px] md:px-[30px] py-[5vh] md:py-[10vh] rounded-lg mx-auto bg-white shadow-lg"
          style={{ opacity: featureOneOpacity }}
        >
          <motion.img
            className="w-[100px] md:w-[150px]"
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_upload-0UwIsf1txV9Nj3GHzjboGBdqAUAEEo.webp"
            alt="File Upload"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          />
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800">File Upload and Storage</h1>
          <p className="text-sm md:text-base text-gray-600">Handles file uploads and temporary storage.</p>
        </motion.div>

        <motion.div
          className="Cards sticky top-[10vh] md:top-[15vh] text-center w-[90%] md:w-[27vw] flex flex-col items-center gap-5 px-[20px] md:px-[30px] py-[5vh] md:py-[10vh] rounded-lg mx-auto bg-white shadow-lg"
          style={{ opacity: featureTwoOpacity }}
        >
          <motion.img
            className="w-[100px] md:w-[150px]"
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.png-WVsBA8a5hC9B4mWyYpTbCI78xIMFda.webp"
            alt="SHA 256"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ duration: 0.3 }}
          />
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800">SHA 256 Algorithm</h1>
          <p className="text-sm md:text-base text-gray-600">Computes a unique fingerprint for files.</p>
        </motion.div>
      </div>

      {/* Additional Feature Section */}
      <div className="w-full py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Trojan Trap?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
              whileHover={{
                y: -10,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Advanced Threat Detection</h3>
              <p className="text-gray-600 text-center">
                Our system uses cutting-edge algorithms to detect even the most sophisticated threats.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
              whileHover={{
                y: -10,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Real-time Alerts</h3>
              <p className="text-gray-600 text-center">
                Get instant notifications about potential threats to your system.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
              whileHover={{
                y: -10,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Comprehensive Reports</h3>
              <p className="text-gray-600 text-center">
                Get detailed analysis reports with actionable recommendations for each scan.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="w-full py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center"
              whileHover={{ y: -5, boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Upload File</h3>
              <p className="text-gray-600 text-sm">Upload any file you want to scan for potential threats.</p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center"
              whileHover={{ y: -5, boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Analyze Hash</h3>
              <p className="text-gray-600 text-sm">We calculate a unique SHA-256 hash for your file.</p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center"
              whileHover={{ y: -5, boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Check Database</h3>
              <p className="text-gray-600 text-sm">We compare the hash against our database of known threats.</p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center"
              whileHover={{ y: -5, boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">4</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Get Results</h3>
              <p className="text-gray-600 text-sm">Receive a detailed report with analysis and recommendations.</p>
            </motion.div>
          </div>

          <div className="mt-12 text-center">
            <motion.button
              onClick={handleUploadClick}
              className="py-3 px-8 bg-green-500 hover:bg-green-600 text-white rounded-full text-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Try It Now
            </motion.button>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="w-full py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Users Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-blue-600">J</span>
                </div>
                <div>
                  <h3 className="font-bold">John D.</h3>
                  <p className="text-sm text-gray-500">IT Security Specialist</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Trojan Trap has become an essential tool in our security arsenal. The detailed reports help us identify
                and mitigate threats quickly."
              </p>
              <div className="mt-4 flex">
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-yellow-500" />
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-green-600">S</span>
                </div>
                <div>
                  <h3 className="font-bold">Sarah M.</h3>
                  <p className="text-sm text-gray-500">Software Developer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "I use Trojan Trap to check all third-party libraries before integrating them into our projects. It's
                fast, reliable, and gives me peace of mind."
              </p>
              <div className="mt-4 flex">
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-yellow-500" />
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-purple-600">R</span>
                </div>
                <div>
                  <h3 className="font-bold">Robert K.</h3>
                  <p className="text-sm text-gray-500">Small Business Owner</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "After a ransomware scare, we now scan all email attachments with Trojan Trap. The interface is simple
                enough for all our employees to use."
              </p>
              <div className="mt-4 flex">
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-gray-300" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

