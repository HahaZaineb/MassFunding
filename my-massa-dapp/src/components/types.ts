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
  lockPeriod: string // In days
  releaseInterval: string // In days
  releasePercentage: number
  supporters: number
  category: string
  updates?: ProjectUpdate[]
  milestones?: ProjectMilestone[]
  owner?: string
  creator?: string
  deadline?: string
  goalAmount: number
  image?: string
}

export interface NFTMetadata {
  projectId: string
  projectName: string
  donationAmount: number
  donationDate: string
  donorAddress: string
  category: string
  transactionId?: string
}

export interface WalletInfo {
  address: string
  isConnected: boolean
  publicKey?: string
}

export interface ProjectFormData {
  projectName: string
  description: string
  amountNeeded: string
  walletAddress: string
  lockPeriod: string
  releaseInterval: string
  releasePercentage: number
  category?: string
}

export interface ProjectUpdate {
  id: string
  date: string
  title: string
  content: string
  author: string
}

export interface ProjectMilestone {
  id: string
  title: string
  description: string
  deadline: string
  completed: boolean
  progress: number
}

export interface DonationTransaction {
  id: string
  projectId: string
  donorAddress: string
  amount: number
  transactionId: string
  vestingScheduleId?: string
  nftId?: string
  timestamp: string
}
