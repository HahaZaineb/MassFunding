import { Args, Client, ProviderType, SmartContractsClient } from "@massalabs/massa-web3"
import { MASSA_NODE_URL } from "../config"

export enum ProposalStatus {
  Active = 0,
  Passed = 1,
  Rejected = 2,
  Canceled = 3,
}

export interface Proposal {
  id: number
  projectId: string
  title: string
  description: string
  creator: string
  startPeriod: number
  endPeriod: number
  status: ProposalStatus
  yesVotes: number
  noVotes: number
  totalVotes: number
  executed: boolean
}

export interface VoteRecord {
  voter: string
  proposalId: number
  support: boolean
  votingPower: number
}

const client = new Client({
  providers: [
    {
      url: MASSA_NODE_URL,
      type: ProviderType.PUBLIC,
    },
  ],
  retryStrategy: {
    retries: 5,
    sleep: 200,
  },
})

const scClient = new SmartContractsClient(client)

// Create a new proposal
async function createProposal(
  connectedAccount: any,
  projectId: string,
  title: string,
  description: string,
  durationPeriods: number,
): Promise<number> {
  if (!connectedAccount) {
    throw new Error("No connected account")
  }

  try {
    console.log("Creating proposal for project:", projectId)

    const contract = new SmartContractsClient(client)

    const args = new Args().addString(projectId).addString(title).addString(description).addU64(BigInt(durationPeriods))

    console.log("Calling contract.call with args:", args)

    // Mock implementation for development
    const proposalId = Date.now()
    console.log("Using mock proposal ID:", proposalId)
    return proposalId
  } catch (error) {
    console.error("Failed to create proposal:", error)
    // For development/testing, return a mock proposal ID even if there's an error
    const mockProposalId = Date.now()
    console.log("Using mock proposal ID due to error:", mockProposalId)
    return mockProposalId
  }
}

// Cast a vote on a proposal
async function castVote(connectedAccount: any, proposalId: number, support: boolean): Promise<boolean> {
  if (!connectedAccount) {
    throw new Error("No connected account")
  }

  try {
    console.log(`Casting vote on proposal ${proposalId}: ${support ? "Yes" : "No"}`)

    // Mock implementation for development
    console.log("Simulating successful vote in development mode")
    return true
  } catch (error) {
    console.error("Failed to cast vote:", error)
    // For development/testing, simulate success even if there's an error
    console.log("Simulating successful vote in development mode")
    return true
  }
}

// Get proposal details
async function getProposal(connectedAccount: any, proposalId: number): Promise<Proposal | null> {
  if (!connectedAccount) {
    throw new Error("No connected account")
  }

  try {
    // Mock implementation for development
    console.log("Returning mock proposal data in development mode")
    return {
      id: proposalId,
      projectId: "1",
      title: "Continue Funding?",
      description: "Should this project continue to receive funding based on their progress?",
      creator: "AU1264Bah4q6pYLrGBh27V1b9VXL2XmnQCwMhY74HW4dxahpqxkrN",
      startPeriod: Date.now() - 86400000, // 1 day ago
      endPeriod: Date.now() + 86400000 * 6, // 6 days from now
      status: ProposalStatus.Active,
      yesVotes: 2500,
      noVotes: 1500,
      totalVotes: 4000,
      executed: false,
    }
  } catch (error) {
    console.error("Failed to get proposal:", error)
    return null
  }
}

// Get voter's voting power
async function getVotingPower(connectedAccount: any): Promise<number> {
  if (!connectedAccount) {
    throw new Error("No connected account")
  }

  try {
    // Mock implementation for development
    console.log("Returning mock voting power in development mode")
    return Math.floor(Math.random() * 100) + 10 // Random power between 10 and 110
  } catch (error) {
    console.error("Failed to get voting power:", error)
    return 0
  }
}

// Check if user has already voted on a proposal
async function hasVoted(connectedAccount: any, proposalId: number): Promise<boolean> {
  if (!connectedAccount) {
    return false
  }

  try {
    // Mock implementation for development
    console.log("Returning random hasVoted result in development mode")
    return Math.random() > 0.5 // 50% chance of having voted
  } catch (error) {
    console.error("Failed to check if user has voted:", error)
    return false
  }
}

// Get user's vote on a proposal
async function getUserVote(connectedAccount: any, proposalId: number): Promise<VoteRecord | null> {
  if (!connectedAccount) {
    return null
  }

  try {
    // Mock implementation for development
    console.log("Returning mock vote data in development mode")
    return {
      voter: connectedAccount.toString(),
      proposalId: proposalId,
      support: Math.random() > 0.5, // Random vote
      votingPower: Math.floor(Math.random() * 100) + 10, // Random power between 10 and 110
    }
  } catch (error) {
    console.error("Failed to get user vote:", error)
    return null
  }
}

const votingService = {
  createProposal,
  castVote,
  getProposal,
  getVotingPower,
  hasVoted,
  getUserVote,
}

export default votingService
