import { WalletName, type WalletInfo, type WalletProvider } from "./wallet-types"

class MassaWalletService {
  private currentWallet: WalletInfo | null = null
  private selectedWallet: WalletName | null = null

  // Mock wallet providers
  private walletProviders: WalletProvider[] = [
    {
      name: () => WalletName.MassaStation,
      connect: async () => {
        // Simulate connection
        const mockAddress =
          "AU12" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        const walletInfo = {
          address: mockAddress,
          isConnected: true,
          publicKey: "pk1" + Math.random().toString(36).substring(2, 15),
        }
        this.currentWallet = walletInfo
        return walletInfo
      },
      disconnect: async () => {
        this.currentWallet = null
      },
      getAccountInfo: async () => this.currentWallet,
      isConnected: async () => this.currentWallet !== null,
    },
    {
      name: () => WalletName.Bearby,
      connect: async () => {
        // Simulate connection
        const mockAddress =
          "AU12" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        const walletInfo = {
          address: mockAddress,
          isConnected: true,
          publicKey: "pk1" + Math.random().toString(36).substring(2, 15),
        }
        this.currentWallet = walletInfo
        return walletInfo
      },
      disconnect: async () => {
        this.currentWallet = null
      },
      getAccountInfo: async () => this.currentWallet,
      isConnected: async () => this.currentWallet !== null,
    },
  ]

  async connectWallet(walletName: WalletName): Promise<WalletInfo | null> {
    try {
      const provider = this.walletProviders.find((p) => p.name() === walletName)
      if (!provider) {
        console.error(`Wallet provider ${walletName} not found`)
        return null
      }

      this.selectedWallet = walletName
      const walletInfo = await provider.connect()
      this.currentWallet = walletInfo
      return walletInfo
    } catch (error) {
      console.error("Error connecting to wallet:", error)
      return null
    }
  }

  async disconnectWallet(): Promise<void> {
    if (!this.selectedWallet) return

    try {
      const provider = this.walletProviders.find((p) => p.name() === this.selectedWallet)
      if (provider) {
        await provider.disconnect()
      }
      this.currentWallet = null
      this.selectedWallet = null
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }

  async getWalletInfo(): Promise<WalletInfo | null> {
    if (!this.selectedWallet) return null

    try {
      const provider = this.walletProviders.find((p) => p.name() === this.selectedWallet)
      if (!provider) return null

      return await provider.getAccountInfo()
    } catch (error) {
      console.error("Error getting wallet info:", error)
      return null
    }
  }

  async isWalletConnected(): Promise<boolean> {
    if (!this.selectedWallet) return false

    try {
      const provider = this.walletProviders.find((p) => p.name() === this.selectedWallet)
      if (!provider) return false

      return await provider.isConnected()
    } catch (error) {
      console.error("Error checking wallet connection:", error)
      return false
    }
  }

  getSelectedWallet(): WalletName | null {
    return this.selectedWallet
  }
}

export const walletService = new MassaWalletService()
export default walletService
