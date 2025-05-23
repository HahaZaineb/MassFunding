"use client"

import { useEffect, useState } from "react"
import {
  ConnectMassaWallet,
  useAccountStore,
} from '@massalabs/react-ui-kit';

export function Connect() {
  const { connectedAccount } = useAccountStore()
  const [isWalletConnected, setIsWalletConnected] = useState(!!connectedAccount)
  
  useEffect(() => {
    setIsWalletConnected(!!connectedAccount)
    if (connectedAccount) {
      console.log("Wallet connected:", connectedAccount.toString())
    } else {
      console.log("Wallet not connected")
    }
  }, [connectedAccount])

  return (
    <div className="theme-dark">
      <ConnectMassaWallet />
    </div>
  )
}

