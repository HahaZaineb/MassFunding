import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Menu, X } from "lucide-react"
import MassaLogo from "./MassaLogo"
import { ConnectMassaWallet, useAccountStore } from "@massalabs/react-ui-kit"

type NavigationPage = "home" | "request" | "fund" | "about" | "projects"

interface NavbarProps {
  currentPage: NavigationPage
  onNavigate: (page: NavigationPage) => void
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { connectedAccount } = useAccountStore()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="w-full bg-[#181f36] border-b border-[#23243a] py-2 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-extrabold text-[#00ff9d] tracking-tight">MassFunding</span>
      </div>
      <div className="flex-1 flex justify-center">
        <ul className="flex gap-8">
          <li>
            <button
              className={`text-lg font-medium transition-colors duration-200 ${currentPage === "fund" ? "text-[#00ff9d]" : "text-white hover:text-[#00ff9d]"}`}
              onClick={() => onNavigate("fund")}
            >
              Explore Projects
            </button>
          </li>
          <li>
            <button
              className={`text-lg font-medium transition-colors duration-200 ${currentPage === "request" ? "text-[#00ff9d]" : "text-white hover:text-[#00ff9d]"}`}
              onClick={() => onNavigate("request")}
            >
              Request Funding
            </button>
          </li>
          <li>
            <button
              className={`text-lg font-medium transition-colors duration-200 ${currentPage === "about" ? "text-[#00ff9d]" : "text-white hover:text-[#00ff9d]"}`}
              onClick={() => onNavigate("about")}
            >
              How It Works
            </button>
          </li>
        </ul>
      </div>
      <div className="flex items-center gap-2">
        <div className="theme-dark">
          <ConnectMassaWallet />
        </div>
      </div>
    </nav>
  )
}
