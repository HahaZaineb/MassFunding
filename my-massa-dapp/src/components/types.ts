// Project data types
export interface ProjectData {
  id: string
  name: string
  description: string
  category: string
  // Financial properties
  goalAmount: number
  amountRaised: number
  amountNeeded?: number
  // Time properties
  deadline: string
  // Participant properties
  supporters: number
  creator: string // Changed from optional to required
  beneficiary?: string
  // Display properties
  image?: string
  updates?: ProjectUpdate[]
  milestones?: ProjectMilestone[]
  // Vesting properties
  lockPeriod?: string
  releaseInterval?: string
  releasePercentage?: number
  walletAddress?: string
  owner?: string
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

export interface NFTMetadata {
  projectId: string
  projectName: string
  donationAmount: number
  donationDate: string
  donorAddress: string
  category: string
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
