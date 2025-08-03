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

// CORS configuration - allow all origins for deployment flexibility
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://trojan-trap-seven.vercel.app",
      "https://trojan-trap.vercel.app",
      // Add your Vercel deployment URL here after deployment
      // Replace with your actual frontend URL when deployed
      process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []
    ].flat();
    
    // Check if the origin is in our allowed list or if it's undefined (for server-to-server requests)
    // In production, we check against the environment variable
    if (allowedOrigins.includes(origin) || !origin || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    cb(null, true) // Accept all
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
  res.status(200).json({ status: "ok", message: "Server is running" })
})

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

