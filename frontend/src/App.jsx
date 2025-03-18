"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./components/Home"
import Scanner from "./components/Scanner"
import Report from "./components/Report"
import Docs from "./components/Docs"
import LiveUpdates from "./components/LiveUpdates"
import { motion } from "framer-motion"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <motion.main
          className="flex-grow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/report" element={<Report />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/live-updates" element={<LiveUpdates />} />
          </Routes>
        </motion.main>
        <footer className="py-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Trojan Trap. All rights reserved.</p>
          <p className="mt-1">Protecting your digital world, one scan at a time.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App

