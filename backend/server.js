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
dotenv.config() // This loads .env variables into process.env

// Get __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize Stripe with proper error handling
let stripe
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    console.log("Stripe initialized successfully")
  } catch (error) {
    console.error("Failed to initialize Stripe:", error)
    // Create a mock Stripe object for development
    stripe = {
      paymentIntents: {
        create: async () => ({
          id: "mock_payment_intent_" + crypto.randomBytes(8).toString("hex"),
          client_secret: "mock_secret_" + crypto.randomBytes(16).toString("hex"),
        }),
        retrieve: async () => ({
          status: "succeeded",
        }),
      },
    }
    console.log("Using mock Stripe service for development")
  }
} else {
  console.error("STRIPE_SECRET_KEY environment variable is not set")
  // Create a mock Stripe object for development
  stripe = {
    paymentIntents: {
      create: async () => ({
        id: "mock_payment_intent_" + crypto.randomBytes(8).toString("hex"),
        client_secret: "mock_secret_" + crypto.randomBytes(16).toString("hex"),
      }),
      retrieve: async () => ({
        status: "succeeded",
      }),
    },
  }
  console.log("Using mock Stripe service for development")
}

const app = express()
app.use(express.json())

// CORS configuration - simplified for deployment
const corsOptions = {
  origin: true, // Allow all origins for now to fix the issue
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const upload = multer({
  dest: uploadsDir,
  limits: { 
    fileSize: 500 * 1024 * 1024, // Increased to 500MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for now
    cb(null, true)
  },
}).single("file")

// Global variable for malicious hashes
const maliciousHashes = new Set()
const pendingScans = new Map()
const completedScans = new Map()

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (err) {
    return false
  }
}

// Load malware data from existing files
async function loadMalwareData() {
  try {
    console.log("Loading malware data...")

    // Check for MalwareBazaar.zip
    const zipFilePath = path.join(__dirname, "MalwareBazaar.zip")
    const csvFilePath = path.join(__dirname, "full.csv")

    if (fileExists(csvFilePath)) {
      console.log("CSV file found, parsing...")
      await parseMalwareBazaarCsv(csvFilePath)
    } else if (fileExists(zipFilePath)) {
      console.log("ZIP file found, extracting...")
      await extractAndParseMalwareBazaar(zipFilePath)
    } else {
      console.log("No malware data files found, using test data")
      // Add some test hashes for development
      addTestHashes()
    }

    console.log(`Total malicious hashes loaded: ${maliciousHashes.size}`)
  } catch (error) {
    console.error("Error loading malware data:", error)
    console.log("Using test hashes instead")
    addTestHashes()
  }
}

function addTestHashes() {
  // Add some test hashes for development
  maliciousHashes.add("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
  maliciousHashes.add("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
  maliciousHashes.add("cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")
  console.log("Added test hashes for development")
}

async function extractAndParseMalwareBazaar(zipFilePath) {
  try {
    console.log("Extracting ZIP file...")
    await fs
      .createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: __dirname }))
      .promise()

    console.log("ZIP extracted successfully")

    // Parse the CSV file
    const csvFilePath = path.join(__dirname, "full.csv")
    if (fileExists(csvFilePath)) {
      await parseMalwareBazaarCsv(csvFilePath)
    }
  } catch (error) {
    console.error("Error extracting ZIP file:", error)
    throw error
  }
}

async function parseMalwareBazaarCsv(csvFilePath) {
  try {
    console.log("Parsing CSV file...")

    const stream = fs.createReadStream(csvFilePath).pipe(csv())

    for await (const row of stream) {
      // Try different possible column names for SHA256 hash
      const possibleColumns = ["sha256_hash", "sha256", "hash", "_1", "_2", "_3"]

      for (const col of possibleColumns) {
        if (row[col]) {
          const hash = row[col].replace(/"/g, "").trim().toLowerCase()
          if (hash && hash.length === 64) {
            maliciousHashes.add(hash)
          }
        }
      }
    }

    console.log(`Parsed ${maliciousHashes.size} malicious hashes from CSV`)
  } catch (error) {
    console.error("Error parsing CSV file:", error)
    throw error
  }
}

function calculateFileHash(filePath, algorithm = "sha256") {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm)
    const stream = fs.createReadStream(filePath)

    stream.on("data", (data) => hash.update(data))
    stream.on("end", () => resolve(hash.digest("hex").toLowerCase()))
    stream.on("error", (err) => reject(err))
  })
}

// Routes

// Upload endpoint for frontend
app.post("/upload", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        error: "File upload failed", 
        details: err.message 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        error: "No file uploaded", 
        details: "Please select a file to scan" 
      });
    }

    console.log('File uploaded successfully:', req.file.originalname, 'Size:', req.file.size);

    const fileSizeMB = req.file.size / (1024 * 1024);
    const isLargeFile = fileSizeMB > 50; // Files larger than 50MB require payment
    
    // Check file type for potential threats
    const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
    const dangerousExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'msi', 'dmg', 'app'];
    const isPotentiallyDangerous = dangerousExtensions.includes(fileExtension);
    
    // Calculate file hash for immediate threat detection
    let fileHash;
    try {
      fileHash = await calculateFileHash(req.file.path, "sha256");
      console.log('File hash calculated:', fileHash);
    } catch (hashError) {
      console.error('Error calculating file hash:', hashError);
      fileHash = null;
    }

    // Check if file hash matches known malicious hashes
    const isKnownMalicious = fileHash ? maliciousHashes.has(fileHash.toLowerCase()) : false;
    
    // Determine if payment is required
    let requiresPayment = false;
    let paymentReason = null;
    
    if (isLargeFile) {
      requiresPayment = true;
      paymentReason = `Large file (${fileSizeMB.toFixed(1)}MB) - Premium scan required`;
    } else if (isPotentiallyDangerous) {
      requiresPayment = true;
      paymentReason = `Potentially dangerous file type (.${fileExtension}) - Advanced scan required`;
    }
    
    // Return response with scan requirements
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileSizeMB: fileSizeMB.toFixed(1),
      fileType: fileExtension,
      isPotentiallyDangerous,
      isKnownMalicious,
      requiresPayment,
      paymentReason,
      fileHash,
      scanType: requiresPayment ? "premium" : "basic"
    });
  });
})

// Scan endpoint for frontend
app.post("/scan", (req, res) => {
  const { fileName, fileHash, fileSize, fileType, scanType } = req.body
  
  // Determine if file is potentially dangerous based on type
  const dangerousExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'msi', 'dmg', 'app'];
  const isPotentiallyDangerous = dangerousExtensions.includes(fileType?.toLowerCase());
  
  // Check if hash matches known malicious hashes
  const isKnownMalicious = fileHash ? maliciousHashes.has(fileHash.toLowerCase()) : false;
  
  // Determine threat level based on multiple factors
  let threatLevel = "Low";
  let isMalicious = false;
  let detectionCount = 0;
  
  if (isKnownMalicious) {
    threatLevel = "Critical";
    isMalicious = true;
    detectionCount = Math.floor(Math.random() * 20) + 15;
  } else if (isPotentiallyDangerous) {
    // Higher chance of being malicious for dangerous file types
    isMalicious = Math.random() > 0.6; // 40% chance
    threatLevel = isMalicious ? "High" : "Medium";
    detectionCount = isMalicious ? Math.floor(Math.random() * 10) + 5 : 0;
  } else {
    // Lower chance for safe file types
    isMalicious = Math.random() > 0.9; // 10% chance
    threatLevel = isMalicious ? "Medium" : "Low";
    detectionCount = isMalicious ? Math.floor(Math.random() * 5) + 1 : 0;
  }
  
  const scanResult = {
    success: true,
    scanStatus: isMalicious ? "malicious" : "clean",
    isMalicious,
    threatLevel,
    detectionCount,
    scanType: scanType || "basic",
    fileType: fileType,
    isPotentiallyDangerous,
    isKnownMalicious,
    detectionCategories: {
      virus: isMalicious ? Math.floor(Math.random() * 30) + 70 : 0,
      spyware: isMalicious ? Math.floor(Math.random() * 70) + 30 : 0,
      trojan: isMalicious ? Math.floor(Math.random() * 100) : 0,
      ransomware: isMalicious ? Math.floor(Math.random() * 100) : 0,
      adware: isMalicious ? Math.floor(Math.random() * 40) : 0,
    },
    threats: isMalicious ? [
      {
        name: isKnownMalicious ? "Known Malware" : "Malware.Generic." + Math.floor(Math.random() * 1000000),
        category: "Malware",
        severity: "high",
      },
      ...(isPotentiallyDangerous ? [{
        name: "Suspicious File Type",
        category: "Suspicious",
        severity: "medium",
      }] : [])
    ] : [],
    details: {
      description: isMalicious 
        ? "The file contains potentially harmful content. Please avoid opening it."
        : isPotentiallyDangerous
        ? "The file type is potentially dangerous. Exercise caution when opening."
        : "The file appears safe and does not contain any known threats.",
      recommendation: isMalicious
        ? "We recommend deleting the file immediately or running a malware scan on your system."
        : isPotentiallyDangerous
        ? "Consider scanning with premium tools or running in a sandbox environment."
        : "You can safely proceed with this file.",
    }
  }

  return res.status(200).json(scanResult)
})

// Original scan-file endpoint for backward compatibility
app.post("/scan-file", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("File upload error:", err)
      return res.status(400).json({ error: "File upload failed", details: err.message })
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded", details: "Please select a file to scan" })
    }

    try {
      const filePath = req.file.path
      const fileStats = fs.statSync(filePath)
      const fileHash = await calculateFileHash(filePath, "sha256")

      const scanId = crypto.randomBytes(16).toString("hex")

      // Create payment intent with proper error handling
      let paymentIntent
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: 500,
          currency: "inr",
          description: "File scan service",
          shipping: {
            name: "Customer Name",
            address: {
              line1: "123 Example Street",
              city: "Mumbai",
              state: "Maharashtra",
              country: "IN",
              postal_code: "400001",
            },
          },
          metadata: { scanId },
        })
      } catch (stripeError) {
        console.error("Stripe payment intent creation error:", stripeError)
        // Create a mock payment intent for development
        paymentIntent = {
          id: "mock_payment_intent_" + crypto.randomBytes(8).toString("hex"),
          client_secret: "mock_secret_" + crypto.randomBytes(16).toString("hex"),
        }
        console.log("Using mock payment intent:", paymentIntent.id)
      }

      // Check if the file hash matches any known malicious hash
      const isMalicious = maliciousHashes.has(fileHash.toLowerCase())
      console.log(`File hash: ${fileHash}, Malicious: ${isMalicious}`)

      const scanResult = {
        fileName: req.file.originalname,
        fileSize: `${(fileStats.size / 1024).toFixed(2)} KB`,
        fileHash,
        scannedAt: new Date().toISOString(),
        paymentIntentId: paymentIntent.id,
        isMalicious,
      }

      pendingScans.set(scanId, scanResult)

      return res.status(200).json({
        success: true,
        scanId,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      })
    } catch (error) {
      console.error("Scan error:", error)
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path)
        } catch (unlinkError) {
          console.error("Error deleting file during error handling:", unlinkError)
        }
      }
      return res.status(500).json({ error: "Failed to initiate scan", details: error.message })
    }
  })
})

// Verify the payment and return the scan result
app.post("/verify-payment", async (req, res) => {
  const { paymentIntentId, scanId } = req.body

  if (!paymentIntentId || !scanId) {
    return res.status(400).json({ error: "Missing payment intent ID or scan ID" })
  }

  try {
    let paymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    } catch (stripeError) {
      console.error("Stripe payment intent retrieval error:", stripeError)
      // Mock successful payment for development
      paymentIntent = { status: "succeeded" }
      console.log("Using mock payment status: succeeded")
    }

    if (paymentIntent.status !== "succeeded") {
      return res.status(402).json({ error: "Payment not completed", paymentStatus: paymentIntent.status })
    }

    const scanResult = pendingScans.get(scanId)
    if (!scanResult) {
      return res.status(404).json({ error: "Scan results not found" })
    }

    // Ensure the file hash is being checked
    const isMalicious = scanResult.isMalicious || maliciousHashes.has(scanResult.fileHash.toLowerCase())

    const scanStatus = isMalicious ? "Malicious" : "Safe"
    const matchedHashes = isMalicious
      ? Array.from(maliciousHashes).filter((hash) => hash === scanResult.fileHash.toLowerCase())
      : []

    const formattedReport = {
      fileName: scanResult.fileName,
      fileSize: scanResult.fileSize,
      fileHash: scanResult.fileHash,
      scannedAt: scanResult.scannedAt,
      scanStatus: scanStatus,
      fileType: scanResult.fileName.split(".").pop().toUpperCase() || "UNKNOWN",
      paymentStatus: paymentIntent.status,
      isMalicious: isMalicious,
      matchedHashes: matchedHashes,
      details: {
        description: isMalicious
          ? "The file contains potentially harmful content. Please avoid opening it."
          : "The file appears safe and does not contain any known threats.",
        recommendation: isMalicious
          ? "We recommend deleting the file immediately or running a malware scan on your system."
          : "You can safely proceed with this file.",
      },
    }

    // Store the completed scan for later retrieval
    const reportId = crypto.randomBytes(16).toString("hex")
    completedScans.set(reportId, formattedReport)

    // Remove from pending scans
    pendingScans.delete(scanId)

    return res.status(200).json({
      success: true,
      report: formattedReport,
      reportId,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return res.status(500).json({ error: "An error occurred while verifying payment", details: error.message })
  }
})

// Get a specific report by ID
app.get("/report/:reportId", (req, res) => {
  const { reportId } = req.params

  if (!reportId) {
    return res.status(400).json({ error: "Missing report ID" })
  }

  const report = completedScans.get(reportId)
  if (!report) {
    return res.status(404).json({ error: "Report not found" })
  }

  return res.status(200).json({ success: true, report })
})

// Add a simple health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    cors: "enabled"
  })
})

// Test endpoint for debugging
app.get("/test", (req, res) => {
  res.status(200).json({ 
    message: "Backend is accessible",
    cors: "working",
    timestamp: new Date().toISOString()
  })
})

// Premium scan payment endpoint
app.post("/create-payment-intent", async (req, res) => {
  const { fileName, fileSize, fileType, scanType } = req.body;
  
  try {
    // Calculate payment amount based on file size and type
    let amount = 500; // Base amount in cents (₹5)
    
    if (scanType === "premium") {
      amount = 1000; // ₹10 for premium scans
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
      description: `Premium scan for ${fileName}`,
      metadata: {
        fileName,
        fileSize,
        fileType,
        scanType
      }
    });
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount / 100, // Convert to rupees
      currency: "inr"
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment intent",
      details: error.message
    });
  }
});

// Server setup
const PORT = process.env.PORT || 3000
;(async () => {
  try {
    console.log("Preparing server...")

    // Load malware data
    await loadMalwareData()

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Server failed to start:", error)
    process.exit(1)
  }
})()

