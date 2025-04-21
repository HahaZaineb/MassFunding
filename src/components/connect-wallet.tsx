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

    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress =
        "AU12" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      setWalletAddress(mockAddress)
      setIsConnected(true)
      setIsConnecting(false)
      if (onConnect) onConnect()
    }, 1500)
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
