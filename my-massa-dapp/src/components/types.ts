export interface VestingSchedule {
    beneficiary: string
    token: string
    totalAmount: number
    amountClaimed: number
    lockPeriod: number
    releaseInterval: number
    releasePercentage: number
    nextReleasePeriod: number
  }
  
  export interface ProjectData {
    id: string
    name: string
    description: string
    amountNeeded: number
    amountRaised: number
    beneficiary: string
    lockPeriod: string
    releaseInterval: string
    releasePercentage: number
    supporters: number
    category: string
  }
  
  export interface NFTMetadata {
    projectId: string
    projectName: string
    donationAmount: number
    donationDate: string
    donorAddress: string
    category: string
  }
  
  export interface WalletInfo {
    address: string
    isConnected: boolean
    publicKey?: string
  }
  
  