import { Link, useLocation } from "react-router-dom"

const Navbar = () => {
  const location = useLocation()

  return (
    <nav className="w-full flex justify-center py-4">
      <div className="max-w-4xl w-full px-4">
        <ul className="flex justify-center items-center border-2 border-green-500 rounded-full p-1">
          <NavItem to="/" isActive={location.pathname === "/"}>
            HOME
          </NavItem>
          <NavItem to="/report" isActive={location.pathname === "/report"}>
            REPORT
          </NavItem>
          <NavItem to="/docs" isActive={location.pathname === "/docs"}>
            DOCS
          </NavItem>
          <NavItem to="/live-updates" isActive={location.pathname === "/live-updates"}>
            <span>LIVE UPDATES</span>
            <span className="absolute inline-flex top-[42.4%] left-[91%] items-center">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-pink-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500"></span>
            </span>
          </NavItem>
        </ul>
      </div>
    </nav>
  )
}

const NavItem = ({ children, to, isActive }) => {
  return (
    <li className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-black hover:text-white hover:bg-black hover:rounded-full md:px-5 md:py-3 md:text-base">
      <Link to={to} className="no-underline text-inherit mix-blend-difference">
        {children}
      </Link>
    </li>
  )
}

export default Navbar

