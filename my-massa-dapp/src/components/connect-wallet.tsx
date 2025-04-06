"use client"

import { ConnectMassaWallet, useAccountStore } from "@massalabs/react-ui-kit"
import { useEffect, useState } from "react"

interface ConnectWalletProps {
  onConnect?: (address: any) => void
}

export function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const { connectedAccount } = useAccountStore()
  const [hasConnected, setHasConnected] = useState(false)

  useEffect(() => {
    if (connectedAccount && !hasConnected) {
      console.log("Wallet connected:", connectedAccount)
      setHasConnected(true)
      // Pass the connectedAccount directly without type conversion
      if (onConnect) {
        onConnect(connectedAccount)
      }
    } else if (!connectedAccount && hasConnected) {
      console.log("Wallet disconnected")
      setHasConnected(false)
    }
  }, [connectedAccount, onConnect, hasConnected])

  return (
    <div className="w-full">
      <ConnectMassaWallet />
      {connectedAccount && (
        <div className="mt-2 text-xs text-center text-green-500">
          Connected: {connectedAccount.toString().substring(0, 8)}...
        </div>
      )}
    </div>
  )
}

