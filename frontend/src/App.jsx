import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./components/Home"
import Report from "./components/Report"
import Docs from "./components/Docs"
import LiveUpdates from "./components/LiveUpdates"
import "./App.css"

const App = () => {
  return (
    <Router>
      <div className="main bg-white w-full min-h-screen">
        {/* Navbar is always visible */}
        <Navbar />

        {/* Routes ensure only one component is displayed at a time */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<Report />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/live-updates" element={<LiveUpdates />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App

