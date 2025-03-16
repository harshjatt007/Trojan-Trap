import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const SlideTabsExample = () => {
  const location = useLocation();
  
  return (
    <div className="bg-white py-6 w-full flex items-center justify-center">
      <div className="max-w-4xl w-full px-4">
        <nav className="relative mx-auto flex w-fit rounded-full border-2 border-green-500 bg-white p-1">
          <NavItem to="/" isActive={location.pathname === "/"}>HOME</NavItem>
          <NavItem to="/scanner" isActive={location.pathname === "/scanner"}>SCANNER</NavItem>
          <NavItem to="/report" isActive={location.pathname === "/report"}>REPORT</NavItem>
          <NavItem to="/docs" isActive={location.pathname === "/docs"}>DOCS</NavItem>
          <NavItem to="/live-updates" isActive={location.pathname === "/live-updates"}>
            LIVE UPDATES
            <span className="relative ml-1">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
          </NavItem>
          
          {/* Active background indicator */}
          {location.pathname && (
            <div 
              className="absolute top-1 left-0 h-8 bg-black rounded-full transition-all duration-300 z-0"
              style={{
                left: getTabPosition(location.pathname),
                width: getTabWidth(location.pathname),
              }}
            />
          )}
        </nav>
      </div>
    </div>
  );
};

const NavItem = ({ children, to, isActive }) => {
  return (
    <Link
      to={to}
      className={`relative z-10 block px-4 py-2 text-xs font-medium uppercase transition-colors duration-300 ${
        isActive ? 'text-white' : 'text-black hover:text-green-600'
      }`}
    >
      {children}
    </Link>
  );
};

// Helper functions to calculate position and width for the active tab indicator
function getTabPosition(pathname) {
  switch (pathname) {
    case '/':
      return '1px';
    case '/scanner':
      return '70px';
    case '/report':
      return '160px';
    case '/docs':
      return '240px';
    case '/live-updates':
      return '310px';
    default:
      return '1px';
  }
}

function getTabWidth(pathname) {
  switch (pathname) {
    case '/':
      return '65px';
    case '/scanner':
      return '85px';
    case '/report':
      return '75px';
    case '/docs':
      return '65px';
    case '/live-updates':
      return '120px';
    default:
      return '65px';
  }
}

export default SlideTabsExample;

