"use client"

import { Link, useLocation } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

const Navbar = () => {
  const location = useLocation()
  const [activeIndicator, setActiveIndicator] = useState({ left: 0, width: 0, opacity: 0 })
  const navRefs = useRef([])

  useEffect(() => {
    // Calculate positions for the active indicator
    const updateIndicator = () => {
      const currentPath = location.pathname
      const activeIndex = ["/", "/report", "/docs", "/live-updates"].indexOf(currentPath)

      if (activeIndex >= 0 && navRefs.current[activeIndex]) {
        const activeItem = navRefs.current[activeIndex]
        const rect = activeItem.getBoundingClientRect()
        const parentRect = activeItem.parentElement.getBoundingClientRect()

        setActiveIndicator({
          left: rect.left - parentRect.left,
          width: rect.width,
          opacity: 1,
        })
      }
    }

    // Initial calculation
    updateIndicator()

    // Recalculate on window resize
    window.addEventListener("resize", updateIndicator)
    return () => window.removeEventListener("resize", updateIndicator)
  }, [location])

  return (
    <div className="py-10 w-full flex items-center justify-center">
      <ul className="navbar_main relative flex rounded-full border-2 border-green-500">
        <li
          className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-5 md:py-3 md:text-base"
          ref={(el) => (navRefs.current[0] = el)}
        >
          <Link className="no-underline text-inherit" to="/">
            Home
          </Link>
        </li>
        <li
          className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-5 md:py-3 md:text-base"
          ref={(el) => (navRefs.current[1] = el)}
        >
          <Link className="no-underline text-inherit" to="/report">
            Report
          </Link>
        </li>
        <li
          className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-5 md:py-3 md:text-base"
          ref={(el) => (navRefs.current[2] = el)}
        >
          <Link className="no-underline text-inherit" to="/docs">
            Docs
          </Link>
        </li>
        <li
          className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-5 md:py-3 md:text-base"
          ref={(el) => (navRefs.current[3] = el)}
        >
          <Link className="no-underline text-inherit" to="/live-updates">
            <span className="absolute inline-flex top-[42.4%] left-[91%] items-center">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-pink-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500"></span>
            </span>
            LIVE UPDATES
          </Link>
        </li>
        <li
          className="absolute z-0 h-7 rounded-full bg-black md:h-12"
          style={{
            left: `${activeIndicator.left}px`,
            width: `${activeIndicator.width}px`,
            opacity: activeIndicator.opacity,
            transition: "all 0.3s ease",
          }}
        ></li>
      </ul>
    </div>
  )
}

export default Navbar

