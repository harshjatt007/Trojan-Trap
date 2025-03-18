// Common malware file extensions
export const suspiciousExtensions = [
    ".exe",
    ".dll",
    ".bat",
    ".cmd",
    ".scr",
    ".js",
    ".vbs",
    ".ps1",
    ".jar",
    ".py",
    ".com",
    ".msi",
    ".pif",
    ".hta",
    ".sh",
    ".app",
  ]
  
  // Common malicious patterns in filenames
  export const maliciousPatterns = [
    "virus",
    "malware",
    "trojan",
    "worm",
    "backdoor",
    "exploit",
    "spyware",
    "adware",
    "ransomware",
    "rootkit",
    "keylogger",
    "hack",
    "crack",
    "keygen",
    "patch",
    "test-virus",
    "payload",
    "inject",
  ]
  
  // Known malicious file hashes (simplified for demo)
  export const knownMaliciousHashes = [
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    "000000000000000000000000000000000000000000000000000000000000dead",
    "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  ]
  
  // Suspicious hash patterns
  export const suspiciousHashPatterns = [
    /^0{10,}/, // Files with hashes starting with many zeros
    /^deadbeef/, // Common test pattern that might be used in malware
    /^badc0de/, // Another common test pattern
    /^123456/, // Simple pattern for demo
    /^abcdef/, // Simple pattern for demo
  ]
  
  // Function to analyze file for malicious content
  export function analyzeFile(fileName, fileHash, fileSize) {
    const fileExt = fileName.substring(fileName.lastIndexOf(".")).toLowerCase()
  
    // Check if the file has a suspicious extension
    const hasSuspiciousExtension = suspiciousExtensions.includes(fileExt)
  
    // Check if file name contains any known malicious patterns
    const hasMaliciousPattern = maliciousPatterns.some((pattern) =>
      fileName.toLowerCase().includes(pattern.toLowerCase()),
    )
  
    // Check if hash is in known malicious hashes
    const isKnownMaliciousHash = knownMaliciousHashes.includes(fileHash.toLowerCase())
  
    // Check if hash matches suspicious patterns
    const hasSuspiciousHashPattern = suspiciousHashPatterns.some((pattern) => pattern.test(fileHash.toLowerCase()))
  
    // Check file size (some malware is very small)
    const isSuspiciousSize = fileSize < 1000 && hasSuspiciousExtension
  
    // Determine threat level and status
    let threatLevel = "Low"
    let status = "clean"
    let detectionCount = 0
    let detectionCategories = {
      virus: 0,
      spyware: 0,
      trojan: 0,
      ransomware: 0,
      adware: 0,
    }
  
    // Generate threats array
    const threats = []
  
    if (isKnownMaliciousHash || (hasMaliciousPattern && hasSuspiciousExtension)) {
      // High threat - malicious
      status = "malicious"
      threatLevel = "High"
      detectionCount = Math.floor(Math.random() * 15) + 10 // 10-25 detections
  
      // Randomly assign detection categories
      detectionCategories = {
        virus: Math.floor(Math.random() * 30) + 70,
        spyware: Math.floor(Math.random() * 70) + 30,
        trojan: Math.floor(Math.random() * 100),
        ransomware: Math.floor(Math.random() * 100),
        adware: Math.floor(Math.random() * 40),
      }
  
      // Add threats based on patterns
      if (fileName.toLowerCase().includes("trojan")) {
        threats.push({
          name: "Trojan.GenericKD." + Math.floor(Math.random() * 10000000),
          category: "Trojan",
          severity: "high",
        })
      } else if (fileName.toLowerCase().includes("ransomware")) {
        threats.push({
          name: "Ransom.Cryptolocker." + Math.floor(Math.random() * 1000000),
          category: "Ransomware",
          severity: "critical",
        })
      } else {
        threats.push({
          name: "Malware.Generic." + Math.floor(Math.random() * 1000000),
          category: "Malware",
          severity: "high",
        })
      }
  
      // Add a second threat for variety
      threats.push({
        name: "Win32.Backdoor.Agent",
        category: "Backdoor",
        severity: "critical",
      })
    } else if (hasSuspiciousHashPattern || hasSuspiciousExtension || isSuspiciousSize || hasMaliciousPattern) {
      // Medium threat - suspicious
      status = "suspicious"
      threatLevel = "Medium"
      detectionCount = Math.floor(Math.random() * 5) + 2 // 2-7 detections
  
      // Assign detection categories for suspicious files
      detectionCategories = {
        virus: Math.floor(Math.random() * 20),
        spyware: Math.floor(Math.random() * 40) + 20,
        trojan: Math.floor(Math.random() * 30),
        ransomware: Math.floor(Math.random() * 10),
        adware: Math.floor(Math.random() * 60) + 40,
      }
  
      // Add a suspicious threat
      threats.push({
        name: "PUP.Optional.GenericSuspicious",
        category: "Potentially Unwanted Program",
        severity: "medium",
      })
    }
  
    return {
      status,
      threatLevel,
      detectionCount,
      detectionCategories,
      threats,
    }
  }
  
  // Function to get recommendation based on scan result
  export function getRecommendation(status, threatLevel) {
    if (status === "malicious") {
      return {
        description: "This file contains malicious code that could harm your system.",
        recommendation: "Delete this file immediately and run a full system scan with an antivirus program.",
      }
    } else if (status === "suspicious") {
      return {
        description: "This file contains potentially unwanted programs or suspicious code.",
        recommendation: "We recommend not opening this file unless you're absolutely certain of its source and purpose.",
      }
    } else {
      return {
        description: "The file appears safe and does not contain any known threats.",
        recommendation: "You can safely proceed with this file.",
      }
    }
  }
  
  // Function to get color based on threat level
  export function getThreatLevelColor(threatLevel) {
    switch (threatLevel) {
      case "High":
        return "text-red-600"
      case "Medium":
        return "text-yellow-600"
      case "Low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }
  
  