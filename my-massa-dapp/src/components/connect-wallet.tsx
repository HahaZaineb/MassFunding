"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Wallet } from "lucide-react"

interface ConnectWalletProps {
  onConnect?: () => void
}

export function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      // Check if window.massa is available
      // @ts-ignore - window.massa might not be in TypeScript types
      if (typeof window !== "undefined" && window.massa) {
        try {
          // @ts-ignore
          const accounts = await window.massa.getAccounts()
          if (accounts && accounts.length > 0) {
            // Extract the address string from the account
            const address =
              typeof accounts[0] === "string" ? accounts[0] : accounts[0].address || accounts[0].toString()

            setWalletAddress(address)
            setIsConnected(true)
            if (onConnect) onConnect()
            console.log("Connected to wallet:", address)
          }
        } catch (err) {
          console.error("Error connecting to wallet:", err)
          // Fallback to mock wallet for development
          mockWalletConnect()
        }
      } else {
        // Fallback to mock wallet for development
        mockWalletConnect()
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      // Fallback to mock wallet for development
      mockWalletConnect()
    } finally {
      setIsConnecting(false)
    }
  }

  // Mock wallet connection for development/fallback
  const mockWalletConnect = () => {
    console.log("Using mock wallet connection")
    const mockAddress =
      "AU12" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setWalletAddress(mockAddress)
    setIsConnected(true)
    if (onConnect) onConnect()
  }

  if (isConnected) {
    return (
      <Button variant="outline" className="w-full bg-slate-700 border-slate-600 text-slate-200" disabled>
        <Wallet className="h-4 w-4 mr-2" />
        Connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600"
      onClick={handleConnect}
      disabled={isConnecting}
    >
      <Wallet className="h-4 w-4 mr-2" />
      {isConnecting ? "Connecting..." : "Connect Massa Wallet"}
    </Button>
  )
}

