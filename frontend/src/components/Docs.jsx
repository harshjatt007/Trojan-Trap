"use client"
import { motion } from "framer-motion"
import { Upload, Shield, Zap } from "lucide-react"

const Docs = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    show: { opacity: 1, y: 0, scale: 1 },
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.h1
        className="text-5xl font-bold mb-12 text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Overview
      </motion.h1>

      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xl leading-relaxed">
          Welcome to <span className="text-green-500 font-semibold">Trojan Trap</span>, your trusted solution for
          detecting and eliminating hidden threats like viruses, malware, and trojans. With advanced technology and
          real-time analysis, Trojan Trap ensures secure, seamless, and accurate file scanning to keep your system safe.
        </p>
        <p className="text-xl mt-8 font-semibold">
          Stay protected with Trojan Trap—your first line of defense in the digital world.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200" variants={itemVariants}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-center mb-4">Upload files securely for analysis.</h3>
          <p className="text-gray-600 text-center">
            Our secure upload system ensures your files are handled with care and privacy.
          </p>
        </motion.div>

        <motion.div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200" variants={itemVariants}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-center mb-4">Get accurate and instant results on file safety.</h3>
          <p className="text-gray-600 text-center">
            Advanced scanning algorithms provide quick and reliable threat detection.
          </p>
        </motion.div>

        <motion.div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200" variants={itemVariants}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-center mb-4">Protect your system from potential threats.</h3>
          <p className="text-gray-600 text-center">
            Stay one step ahead of malware with our proactive protection system.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Docs

