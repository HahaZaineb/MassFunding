"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Wallet } from "lucide-react"
import { walletService } from "../massa/wallet-service"
import { WalletName, type WalletInfo } from "../massa/wallet-types"

interface ConnectMassaWalletProps {
  onConnect?: (walletInfo: WalletInfo) => void
}

export function ConnectMassaWallet({ onConnect }: ConnectMassaWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      const isConnected = await walletService.isWalletConnected()
      if (isConnected) {
        const info = await walletService.getWalletInfo()
        if (info) {
          setWalletInfo(info)
          if (onConnect) onConnect(info)
        }
      }
    }

    checkConnection()
  }, [onConnect])

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // For demo purposes, we'll use MassaStation
      const info = await walletService.connectWallet(WalletName.MassaStation)
      if (info) {
        setWalletInfo(info)
        if (onConnect) onConnect(info)
      } else {
        setError("Failed to connect wallet")
      }
    } catch (err) {
      console.error("Error connecting wallet:", err)
      setError("Error connecting wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await walletService.disconnectWallet()
      setWalletInfo(null)
    } catch (err) {
      console.error("Error disconnecting wallet:", err)
    }
  }

  if (walletInfo?.isConnected) {
    return (
      <div className="w-full">
        <Button variant="outline" className="w-full bg-slate-700 border-slate-600 text-slate-200">
          <Wallet className="h-4 w-4 mr-2" />
          Connected: {walletInfo.address.substring(0, 6)}...
          {walletInfo.address.substring(walletInfo.address.length - 4)}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          className="mt-2 text-xs text-slate-400 hover:text-slate-300 w-full"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Button
        variant="outline"
        className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600"
        onClick={handleConnect}
        disabled={isConnecting}
      >
        <Wallet className="h-4 w-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Massa Wallet"}
      </Button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default ConnectMassaWallet
