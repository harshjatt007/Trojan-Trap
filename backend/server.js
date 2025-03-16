import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import multer from 'multer';
import axios from 'axios';
import cors from 'cors';
import unzipper from 'unzipper';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import csv from 'csv-parser';
import path from 'path';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();  // This loads .env variables into process.env

// Get __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let stripe;
try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://trojan-trap-seven.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    cb(null, true); // Accept all 
  },
}).single('file');

// Global variable for malicious hashes
let maliciousHashes = new Set();
const pendingScans = new Map();

async function downloadAndExtractMalwareBazaar() {
  const zipFilePath = path.join(__dirname, 'MalwareBazaar.zip');
  const csvFilePath = path.join(__dirname, 'full.csv');

  try {
    console.log('Downloading data...');
    const response = await axios.get('https://bazaar.abuse.ch/export/csv/full/', { responseType: 'stream' });
    const writer = fs.createWriteStream(zipFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log('Extracting data...');
    await fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: __dirname }))
      .promise();

    console.log('Zip extracted successfully.');
  } catch (error) {
    console.error('Error downloading or extracting MalwareBazaar:', error);
    throw error;
  }
}

async function parseMalwareBazaarCsv() {
  try {
    console.log('Parsing CSV...');
    const csvFilePath = path.join(__dirname, 'full.csv');
    const stream = fs.createReadStream(csvFilePath).pipe(csv());

    for await (const row of stream) {
      const hashColumns = ['_1', '_2', '_3']; // Adjust according to your CSV columns
      for (const col of hashColumns) {
        if (row[col]) {
          const hash = row[col].replace(/"/g, '').trim().toLowerCase();
          if (hash && hash.length === 64) {
            maliciousHashes.add(hash);
          }
        }
      }
    }

    console.log(`Parsed ${maliciousHashes.size} malicious hashes.`);
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
}

async function loadMaliciousHashes() {
  try {
    console.log('Loading malicious hashes into memory...');
    if (fs.existsSync('malicious_hashes.txt')) {
      const data = fs.readFileSync('malicious_hashes.txt', 'utf-8');
      maliciousHashes = new Set(data.split('\n').map(hash => hash.trim().toLowerCase()));
    }

    console.log(`Total malicious hashes loaded: ${maliciousHashes.size}`);
  } catch (error) {
    console.error('Error loading malicious hashes:', error);
    throw error;
  }
}

function calculateFileHash(filePath, algorithm = 'sha256') {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex').toLowerCase()));  // Make sure the hash is lowercase
    stream.on('error', (err) => reject(err));
  });
}

// Routes

app.post('/scan-file', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ error: 'File upload failed', details: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded', details: 'Please select a file to scan' });
    }

    try {
      const filePath = req.file.path;
      const fileStats = fs.statSync(filePath);
      const fileHash = await calculateFileHash(filePath, 'sha256');

      const scanId = crypto.randomBytes(16).toString('hex');
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 500, 
        currency: 'inr', 
        description: 'File scan service for export transactions', 
        shipping: {
          name: 'Customer Name',
          address: {
            line1: '123 Example Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'IN', 
            postal_code: '400001',
          },
        },
        metadata: { scanId },
      });

      const scanResult = {
        fileName: req.file.originalname,
        fileSize: `${(fileStats.size / 1024).toFixed(2)} KB`,
        fileHash,
        scannedAt: new Date().toISOString(),
        paymentIntentId: paymentIntent.id, 
      };

      pendingScans.set(scanId, scanResult);
      

      return res.status(200).json({
        success: true,
        scanId,
        clientSecret: paymentIntent.client_secret, 
        paymentIntentId: paymentIntent.id, 
      });
    } catch (error) {
      console.error('Scan error:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file during error handling:', unlinkError);
        }
      }
      return res.status(500).json({ error: 'Failed to initiate scan', details: error.message });
    }
  });
});

// Verify the payment and return the scan result
app.post('/verify-payment', async (req, res) => {
  const { paymentIntentId, scanId } = req.body;

  if (!paymentIntentId || !scanId) {
    return res.status(400).json({ error: 'Missing payment intent ID or scan ID' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(402).json({ error: 'Payment not completed', paymentStatus: paymentIntent.status });
    }

    const scanResult = pendingScans.get(scanId);
    if (!scanResult) {
      return res.status(404).json({ error: 'Scan results not found' });
    }

    // Ensure the file hash is being checked
    const isMalicious = maliciousHashes.has(scanResult.fileHash.toLowerCase());

    const scanStatus = isMalicious ? 'Malicious' : 'Safe';
    const matchedHashes = isMalicious ? Array.from(maliciousHashes).filter(hash => hash === scanResult.fileHash.toLowerCase()) : [];

    const formattedReport = {
      fileName: scanResult.fileName,
      fileSize: scanResult.fileSize,
      fileHash: scanResult.fileHash,
      scannedAt: scanResult.scannedAt,
      scanStatus: scanStatus,
      fileType: 'ZIP',
      paymentStatus: paymentIntent.status,
      isMalicious: isMalicious,
      matchedHashes: matchedHashes, // Include matched hashes for malicious files
      details: {
        description: isMalicious
          ? 'The file contains potentially harmful content. Please avoid opening it.'
          : 'The file appears safe and does not contain any known threats.',
        recommendation: isMalicious
          ? 'We recommend deleting the file immediately or running a malware scan on your system.'
          : 'You can safely proceed with this file.',
      },
    };

    pendingScans.delete(scanId);
    return res.status(200).json({ success: true, report: formattedReport });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ error: 'An error occurred while verifying payment', details: error.message });
  }
});


// Server setup
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    console.log('Preparing server...');
    await downloadAndExtractMalwareBazaar()
    await parseMalwareBazaarCsv();
    await loadMaliciousHashes();
    

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
})();
