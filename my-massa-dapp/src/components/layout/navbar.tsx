import { useState } from "react"
import { Button } from "../ui/button"
import { Menu, X } from "lucide-react"
import MassaLogo from "./MassaLogo"
import { ConnectMassaWallet, useAccountStore } from "@massalabs/react-ui-kit"

type NavigationPage = "home" | "request" | "fund" | "about" | "projects"

interface NavbarProps {
  currentPage: NavigationPage
  onNavigate: (page: NavigationPage) => void
}

function shortenAddress(addr: string) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { connectedAccount } = useAccountStore()
  const [showWalletModal, setShowWalletModal] = useState(false)

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
      <div>
        <button
          className={`px-4 py-2 rounded font-bold shadow flex items-center transition-colors duration-200 ${connectedAccount ? 'bg-[#00ff9d] text-[#181f36]' : 'bg-[#23243a] text-white border border-[#00ff9d]'}`}
          onClick={() => setShowWalletModal(true)}
        >
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${connectedAccount ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {connectedAccount ? shortenAddress(connectedAccount.toString()) : 'Connect Wallet'}
        </button>
        {showWalletModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-[#181f36] rounded-lg p-6 shadow-lg relative min-w-[350px] border border-[#00ff9d]">
              <button
                className="absolute top-2 right-2 text-xl text-[#00ff9d] hover:text-white"
                onClick={() => setShowWalletModal(false)}
              >
                ×
              </button>
              <ConnectMassaWallet />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}