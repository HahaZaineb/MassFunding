"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"
import { defaultNetworkConfig } from "../config"

interface NetworkConfig {
  chainId: string
  nodeUrl: string
  explorerUrl: string
}

interface NetworkConfigContextType {
  networkConfig: NetworkConfig
  setNetworkConfig: (config: NetworkConfig) => void
}

const NetworkConfigContext = createContext<NetworkConfigContextType | undefined>(undefined)

export const NetworkConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>(defaultNetworkConfig)

  return (
    <NetworkConfigContext.Provider value={{ networkConfig, setNetworkConfig }}>
      {children}
    </NetworkConfigContext.Provider>
  )
}

export const useNetworkConfig = (): NetworkConfigContextType => {
  const context = useContext(NetworkConfigContext)
  if (context === undefined) {
    throw new Error("useNetworkConfig must be used within a NetworkConfigProvider")
  }
  return context
}
