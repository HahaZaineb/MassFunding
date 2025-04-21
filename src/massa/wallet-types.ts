export enum WalletName {
  MassaStation = "MassaStation",
  Bearby = "Bearby",
}

export interface WalletInfo {
  address: string
  isConnected: boolean
  publicKey?: string
}

export interface WalletProvider {
  name: () => WalletName
  connect: () => Promise<WalletInfo>
  disconnect: () => Promise<void>
  getAccountInfo: () => Promise<WalletInfo | null>
  isConnected: () => Promise<boolean>
}
