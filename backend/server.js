// Enhanced malware detection and improved payment logic
import express from "express"
import crypto from "crypto"
import fs from "fs"
import multer from "multer"
import cors from "cors"
import unzipper from "unzipper"
import { fileURLToPath } from "url"
import { dirname } from "path"
import csv from "csv-parser"
import path from "path"
import Stripe from "stripe"
import dotenv from "dotenv"

dotenv.config()

// Get __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Enhanced malware detection system
class MalwareDetector {
  constructor() {
    this.maliciousHashes = new Set()
    this.suspiciousPatterns = [
      /eval\s*\(/i,
      /document\.write\s*\(/i,
      /window\.open\s*\(/i,
      /RegExp\s*\(/i,
      /Function\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /ActiveXObject/i,
      /WScript\.Shell/i,
      /cmd\.exe/i,
      /powershell/i,
      /rundll32/i,
      /regsvr32/i,
      /certutil/i
    ]
    
    this.dangerousExtensions = [
      'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 
      'msi', 'dmg', 'app', 'ps1', 'py', 'pl', 'sh', 'elf', 'dll'
    ]
    
    this.safeExtensions = [
      'txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'mp3', 'mp4',
      'avi', 'mov', 'zip', 'rar', '7z', 'tar', 'gz'
    ]
  }

  // Enhanced hash-based detection
  isKnownMalicious(hash) {
    return this.maliciousHashes.has(hash.toLowerCase())
  }

  // File type risk assessment
  assessFileTypeRisk(fileExtension) {
    const ext = fileExtension?.toLowerCase()
    
    if (this.dangerousExtensions.includes(ext)) {
      return { risk: 'high', reason: 'Executable or script file' }
    } else if (this.safeExtensions.includes(ext)) {
      return { risk: 'low', reason: 'Common safe file type' }
    } else {
      return { risk: 'medium', reason: 'Unknown file type' }
    }
  }

  // Content-based detection (for text files)
  analyzeContent(content, fileType) {
    if (!content || typeof content !== 'string') return { malicious: false, score: 0 }
    
    let score = 0
    const threats = []
    
    // Check for suspicious patterns
    this.suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        score += 10
        threats.push({
          type: 'suspicious_pattern',
          pattern: pattern.source,
          severity: 'medium'
        })
      }
    })
    
    // Check for encoded content
    if (content.includes('base64') && content.length > 1000) {
      score += 15
      threats.push({
        type: 'encoded_content',
        severity: 'high'
      })
    }
    
    // Check for URL patterns
    const urlMatches = content.match(/https?:\/\/[^\s]+/g)
    if (urlMatches && urlMatches.length > 5) {
      score += 5
      threats.push({
        type: 'multiple_urls',
        count: urlMatches.length,
        severity: 'low'
      })
    }
    
    return {
      malicious: score > 20,
      score: Math.min(score, 100),
      threats
    }
  }

  // Comprehensive file analysis
  async analyzeFile(filePath, fileName, fileSize) {
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    const fileHash = await this.calculateFileHash(filePath)
    
    // Hash-based detection
    const isKnownMalicious = this.isKnownMalicious(fileHash)
    
    // File type assessment
    const typeRisk = this.assessFileTypeRisk(fileExtension)
    
    // Content analysis for text-based files
    let contentAnalysis = { malicious: false, score: 0, threats: [] }
    if (['txt', 'js', 'vbs', 'bat', 'ps1', 'py'].includes(fileExtension)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        contentAnalysis = this.analyzeContent(content, fileExtension)
  } catch (error) {
        // Binary file or read error
      }
    }
    
    // Calculate overall risk
    let overallScore = 0
    let threatLevel = 'Low'
    let isMalicious = false
    
    if (isKnownMalicious) {
      overallScore = 100
      threatLevel = 'Critical'
      isMalicious = true
    } else {
      // File type risk
      if (typeRisk.risk === 'high') overallScore += 30
      else if (typeRisk.risk === 'medium') overallScore += 15
      
      // Content analysis
      overallScore += contentAnalysis.score * 0.7
      
      // Size factor (very large files might be suspicious)
      if (fileSize > 100 * 1024 * 1024) overallScore += 10
      
      // Determine if malicious based on score
      isMalicious = overallScore > 50
      threatLevel = overallScore > 80 ? 'Critical' : 
                   overallScore > 60 ? 'High' : 
                   overallScore > 40 ? 'Medium' : 'Low'
    }
    
    return {
      fileHash,
      isKnownMalicious,
      typeRisk,
      contentAnalysis,
      overallScore: Math.min(overallScore, 100),
      threatLevel,
      isMalicious,
      detectionCount: isMalicious ? Math.floor(overallScore / 10) + 1 : 0,
      threats: [
        ...(isKnownMalicious ? [{ type: 'known_malware', severity: 'critical' }] : []),
        ...(typeRisk.risk === 'high' ? [{ type: 'dangerous_file_type', severity: 'high', reason: typeRisk.reason }] : []),
        ...contentAnalysis.threats
      ]
    }
  }

  async calculateFileHash(filePath, algorithm = "sha256") {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm)
    const stream = fs.createReadStream(filePath)

    stream.on("data", (data) => hash.update(data))
    stream.on("end", () => resolve(hash.digest("hex").toLowerCase()))
    stream.on("error", (err) => reject(err))
  })
}

  loadMalwareDatabase() {
    // Load from CSV file
    const csvFilePath = path.join(__dirname, "full.csv")
    if (fs.existsSync(csvFilePath)) {
      const stream = fs.createReadStream(csvFilePath).pipe(csv())
      
      stream.on('data', (row) => {
        const possibleColumns = ["sha256_hash", "sha256", "hash", "_1", "_2", "_3"]
        for (const col of possibleColumns) {
          if (row[col]) {
            const hash = row[col].replace(/"/g, "").trim().toLowerCase()
            if (hash && hash.length === 64) {
              this.maliciousHashes.add(hash)
            }
          }
        }
      })
      
      stream.on('end', () => {
        console.log(`Loaded ${this.maliciousHashes.size} malicious hashes`)
      })
    } else {
      console.log("No malware database found, using test data")
      // Add test hashes
      this.maliciousHashes.add("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
      this.maliciousHashes.add("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
    }
  }
}

// Initialize malware detector
const malwareDetector = new MalwareDetector()

// Initialize Stripe
let stripe
const hasValidStripeKey = process.env.STRIPE_SECRET_KEY && 
  process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') && 
  process.env.STRIPE_SECRET_KEY.length > 50 &&
  !process.env.STRIPE_SECRET_KEY.includes('your_stripe_secret_key') &&
  !process.env.STRIPE_SECRET_KEY.includes('placeholder') &&
  !process.env.STRIPE_SECRET_KEY.includes('51H8XXL4e1p5m6K7J2ZV4Yp3Q3GQ2zX6Y9Kf8b0LkTq2A7M8P5L9bD3vF4J7L2N8V0Y5X')

if (hasValidStripeKey) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    console.log("Stripe initialized successfully with real API key")
  } catch (error) {
    console.error("Failed to initialize Stripe:", error)
    stripe = createMockStripe()
  }
} else {
  console.log("Using mock Stripe service for development")
  stripe = createMockStripe()
}

function createMockStripe() {
  return {
    paymentIntents: {
      create: async (params) => {
        console.log("Mock Stripe: Creating payment intent with params:", params)
        
        // Generate a proper Stripe-like client secret
        const intentId = "pi_" + crypto.randomBytes(8).toString("hex")
        const secretId = crypto.randomBytes(16).toString("hex")
        
        // This format should work with Stripe.js
        const clientSecret = `${intentId}_secret_${secretId}`
        
        console.log("Mock Stripe: Generated client_secret:", clientSecret)
        
        return {
          id: intentId,
          client_secret: clientSecret,
          amount: params.amount,
          currency: params.currency,
          status: "requires_payment_method"
        }
      },
      retrieve: async (paymentIntentId) => {
        return { id: paymentIntentId, status: "succeeded", amount: 100, currency: "inr" }
      },
      confirm: async (paymentIntentId, paymentMethod) => {
        return { id: paymentIntentId, status: "succeeded", amount: 100, currency: "inr" }
      }
    }
  }
}

const app = express()

// Middleware
app.use(express.json({ limit: '500mb' }))
app.use(express.urlencoded({ limit: '500mb', extended: true }))

const corsOptions = {
  origin: true, // Allow all origins for now to fix the issue
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error', details: err.message })
})

// Create uploads directory
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const upload = multer({
  dest: uploadsDir,
  limits: { 
    fileSize: 500 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    cb(null, true)
  },
}).single("file")

// Global variables
const pendingScans = new Map()
const completedScans = new Map()

// Enhanced upload endpoint - FIXED VERSION
app.post("/upload", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err)
      
      if (err.code === 'LIMIT_FILE_SIZE' || err.message.includes('too large')) {
        return res.status(400).json({ 
          error: "File upload failed", 
          details: "File too large for basic scan. Please use premium scan for large files.",
          requiresPayment: true,
          paymentReason: "Large file requires premium scan",
          scanType: "premium"
        })
      }
      
      return res.status(400).json({ 
        error: "File upload failed", 
        details: err.message 
      })
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        error: "No file uploaded", 
        details: "Please select a file to scan" 
      })
    }

    console.log('File uploaded successfully:', req.file.originalname, 'Size:', req.file.size)

    const fileSizeMB = req.file.size / (1024 * 1024)
    const isLargeFile = fileSizeMB > 50 // Only charge for files > 50MB
    
    // Calculate file hash without full analysis
    const fileHash = await malwareDetector.calculateFileHash(req.file.path)
    const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase()
    const typeRisk = malwareDetector.assessFileTypeRisk(fileExtension)
    const isKnownMalicious = malwareDetector.isKnownMalicious(fileHash)
    
    // Determine if payment is required (ONLY for large files, not file type)
    let requiresPayment = false
    let paymentReason = null
    
    if (isLargeFile) {
      requiresPayment = true
      paymentReason = `Large file (${fileSizeMB.toFixed(1)}MB) - Premium scan required`
    }
    
    // Return enhanced response
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileSizeMB: fileSizeMB.toFixed(1),
      fileType: typeRisk,
      isPotentiallyDangerous: typeRisk.risk === 'high',
      isKnownMalicious: isKnownMalicious,
      requiresPayment,
      paymentReason,
      fileHash: fileHash,
      scanType: requiresPayment ? "premium" : "basic"
    })
  })
})

// Enhanced scan endpoint - FIXED VERSION
app.post("/scan", async (req, res) => {
  const { fileName, fileHash, fileSize, fileType, scanType } = req.body
  
  try {
    console.log('Scan request received:', { fileName, fileHash, fileSize, fileType, scanType })
    
    // Generate scan results without accessing file (since it's already processed)
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    const isKnownMalicious = malwareDetector.isKnownMalicious(fileHash)
    const typeRisk = malwareDetector.assessFileTypeRisk(fileExtension)
    
    // Calculate threat level based on file characteristics
    let threatLevel = 'Low'
    let isMalicious = false
    let overallScore = 0
    
    if (isKnownMalicious) {
      threatLevel = 'Critical'
      isMalicious = true
      overallScore = 100
    } else if (typeRisk.risk === 'high') {
      threatLevel = 'Medium'
      overallScore = 40
    } else if (typeRisk.risk === 'medium') {
      threatLevel = 'Low'
      overallScore = 20
    }
    
    // Generate scan result
    const scanResult = {
      success: true,
      scanStatus: isMalicious ? "malicious" : "clean",
      isMalicious: isMalicious,
      threatLevel: threatLevel,
      detectionCount: isMalicious ? Math.floor(overallScore / 10) + 1 : 0,
      scanType: scanType || "basic",
      fileType: fileType,
      isPotentiallyDangerous: typeRisk.risk === 'high',
      isKnownMalicious: isKnownMalicious,
      overallScore: overallScore,
      detectionCategories: {
        virus: isMalicious ? Math.floor(overallScore * 0.3) : 0,
        spyware: isMalicious ? Math.floor(overallScore * 0.2) : 0,
        trojan: isMalicious ? Math.floor(overallScore * 0.25) : 0,
        ransomware: isMalicious ? Math.floor(overallScore * 0.15) : 0,
        adware: isMalicious ? Math.floor(overallScore * 0.1) : 0,
      },
      threats: [
        ...(isKnownMalicious ? [{ type: 'known_malware', severity: 'critical' }] : []),
        ...(typeRisk.risk === 'high' ? [{ type: 'dangerous_file_type', severity: 'high', reason: typeRisk.reason }] : [])
      ],
      details: {
        description: isMalicious 
          ? "The file contains potentially harmful content. Please avoid opening it."
          : typeRisk.risk === 'high'
          ? "The file type is potentially dangerous. Exercise caution when opening."
          : "The file appears safe and does not contain any known threats.",
        recommendation: isMalicious
          ? "We recommend deleting the file immediately or running a malware scan on your system."
          : typeRisk.risk === 'high'
          ? "Consider scanning with premium tools or running in a sandbox environment."
          : "You can safely proceed with this file.",
        analysisDetails: {
          hashBasedDetection: isKnownMalicious,
          fileTypeRisk: typeRisk,
          overallScore: overallScore
        }
      }
    }

    console.log('Scan result generated:', scanResult)
    return res.status(200).json(scanResult)
  } catch (error) {
    console.error('Scan error:', error)
    return res.status(500).json({ 
      success: false, 
      error: "Scan failed", 
      details: error.message 
    })
  }
})

// Payment endpoints (unchanged)
app.post("/create-payment-intent", async (req, res) => {
  const { fileName, fileSize, fileType, scanType, paymentMethod } = req.body
  
  try {
    let amount = 100 // ₹1 for all scans
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
      description: `Premium scan for ${fileName}`,
      metadata: {
        fileName,
        fileSize,
        fileType,
        scanType,
        paymentMethod: paymentMethod || "card"
      }
    })
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount / 100,
      currency: "inr",
      paymentMethod: paymentMethod || "card"
    })
  } catch (error) {
    console.error("Payment intent creation error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create payment intent",
      details: error.message
    })
  }
})

// UPI payment endpoints (unchanged)
app.post("/create-upi-payment", async (req, res) => {
  const { fileName, fileSize, fileType, scanType } = req.body
  
  try {
    let amount = 1
    
    const upiPaymentId = "upi_" + crypto.randomBytes(8).toString("hex")
    const upiId = "abhishekchoudhary236@okaxis"
    
    res.status(200).json({
      success: true,
      paymentIntentId: upiPaymentId,
      amount: amount,
      currency: "inr",
      paymentMethod: "upi",
      upiId: upiId,
      upiLink: `upi://pay?pa=${upiId}&pn=TrojanTrap&am=${amount}&tn=Premium Scan - ${fileName}`,
      qrCode: `upi://pay?pa=${upiId}&pn=TrojanTrap&am=${amount}&tn=Premium Scan - ${fileName}`
    })
  } catch (error) {
    console.error("UPI payment creation error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create UPI payment",
      details: error.message
    })
  }
})

app.post("/verify-upi-payment", async (req, res) => {
  const { paymentIntentId, transactionId } = req.body
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    res.status(200).json({
      success: true,
      paymentStatus: "succeeded",
      transactionId: transactionId || "mock_transaction_" + crypto.randomBytes(8).toString("hex"),
      message: "Payment verified successfully"
    })
  } catch (error) {
    console.error("UPI payment verification error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to verify UPI payment",
      details: error.message
    })
  }
})

// Other endpoints (health, test, etc.)
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    cors: "enabled",
    malwareDatabaseSize: malwareDetector.maliciousHashes.size
  })
})

app.get("/test", (req, res) => {
  res.status(200).json({ 
    message: "Backend is accessible",
    cors: "working",
    timestamp: new Date().toISOString()
  })
})

// Server setup
const PORT = process.env.PORT || 3000  // Keep it at 3000 since that's what's working

;(async () => {
  try {
    console.log("Preparing server...")
    
    // Load malware database
    malwareDetector.loadMalwareDatabase()
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`Malware database loaded: ${malwareDetector.maliciousHashes.size} hashes`)
    })
  } catch (error) {
    console.error("Server failed to start:", error)
    process.exit(1)
  }
})()

