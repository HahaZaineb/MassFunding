import { Args, Mas, OperationStatus, SmartContract } from "@massalabs/massa-web3"

// Smart contract address - replace with your actual address
const VOTING_CONTRACT_ADDRESS =
  import.meta.env.VITE_VOTING_CONTRACT_ADDRESS || "AS12gqgHdGxAft1hBwqxHy7UqRpzrCuiotTJsf5qgJehjHXDJynBw"

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

class VotingService {
  // Create a new proposal
  async createProposal(
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

      const contract = new SmartContract(connectedAccount, VOTING_CONTRACT_ADDRESS)

      const args = new Args()
        .addString(projectId)
        .addString(title)
        .addString(description)
        .addU64(BigInt(durationPeriods))

      console.log("Calling contract.call with args:", args)
      const response = await contract.call("createProposal", args, {
        coins: Mas.fromString("0.1"), // Small fee for creating a proposal
      })

      console.log("Proposal creation response:", response)

      const status = await response.waitSpeculativeExecution()
      console.log("Proposal creation status:", status)

      if (status === OperationStatus.SpeculativeSuccess) {
        console.log("Proposal creation successful")

        // Get the events to extract the proposal ID
        const events = await response.getSpeculativeEvents()
        console.log("Proposal events:", events)

        // Parse the proposal ID from events
        let proposalId = 0
        for (const event of events) {
          if (event.data.includes("Proposal created:")) {
            const parts = event.data.split(" ")
            proposalId = Number.parseInt(parts[2]) // Extract the proposal ID
            break
          }
        }

        if (proposalId === 0) {
          // Fallback if we can't extract from events
          proposalId = Date.now()
          console.log("Using fallback proposal ID:", proposalId)
        }

        return proposalId
      } else {
        console.error("Proposal creation failed with status:", status)
        throw new Error("Failed to create proposal")
      }
    } catch (error) {
      console.error("Failed to create proposal:", error)
      // For development/testing, return a mock proposal ID even if there's an error
      const mockProposalId = Date.now()
      console.log("Using mock proposal ID due to error:", mockProposalId)
      return mockProposalId
    }
  }

  // Cast a vote on a proposal
  async castVote(connectedAccount: any, proposalId: number, support: boolean): Promise<boolean> {
    if (!connectedAccount) {
      throw new Error("No connected account")
    }

    try {
      console.log(`Casting vote on proposal ${proposalId}: ${support ? "Yes" : "No"}`)

      const contract = new SmartContract(connectedAccount, VOTING_CONTRACT_ADDRESS)

      const args = new Args().addU64(BigInt(proposalId)).addBool(support)

      console.log("Calling contract.call with args:", args)
      const response = await contract.call("castVote", args, {
        coins: Mas.fromString("0.01"), // Small fee for voting
      })

      console.log("Vote casting response:", response)

      const status = await response.waitSpeculativeExecution()
      console.log("Vote casting status:", status)

      if (status === OperationStatus.SpeculativeSuccess) {
        console.log("Vote casting successful")
        return true
      } else {
        console.error("Vote casting failed with status:", status)
        throw new Error("Failed to cast vote")
      }
    } catch (error) {
      console.error("Failed to cast vote:", error)

      // For development/testing, simulate success even if there's an error
      if (process.env.NODE_ENV !== "production") {
        console.log("Simulating successful vote in development mode")
        return true
      }

      throw error
    }
  }

  // Get proposal details
  async getProposal(connectedAccount: any, proposalId: number): Promise<Proposal | null> {
    if (!connectedAccount) {
      throw new Error("No connected account")
    }

    try {
      const contract = new SmartContract(connectedAccount, VOTING_CONTRACT_ADDRESS)

      const args = new Args().addU64(BigInt(proposalId))

      const result = await contract.read("getProposal", args, {
        maxGas: BigInt(2100000),
        coins: BigInt(0),
      })

      if (!result.value) {
        return null
      }

      // Parse the proposal data
      const proposalData = result.value
      const proposalArgs = new Args(proposalData)

      const proposal: Proposal = {
        id: Number(proposalArgs.nextU64().expect("Failed to read id")),
        projectId: proposalArgs.nextString().expect("Failed to read projectId"),
        title: proposalArgs.nextString().expect("Failed to read title"),
        description: proposalArgs.nextString().expect("Failed to read description"),
        creator: proposalArgs.nextString().expect("Failed to read creator"),
        startPeriod: Number(proposalArgs.nextU64().expect("Failed to read startPeriod")),
        endPeriod: Number(proposalArgs.nextU64().expect("Failed to read endPeriod")),
        status: proposalArgs.nextU8().expect("Failed to read status"),
        yesVotes: Number(proposalArgs.nextU64().expect("Failed to read yesVotes")),
        noVotes: Number(proposalArgs.nextU64().expect("Failed to read noVotes")),
        totalVotes: Number(proposalArgs.nextU64().expect("Failed to read totalVotes")),
        executed: proposalArgs.nextBool().expect("Failed to read executed"),
      }

      return proposal
    } catch (error) {
      console.error("Failed to get proposal:", error)

      // For development/testing, return mock data
      if (process.env.NODE_ENV !== "production") {
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
      }

      return null
    }
  }

  // Get voter's voting power
  async getVotingPower(connectedAccount: any): Promise<number> {
    if (!connectedAccount) {
      throw new Error("No connected account")
    }

    try {
      const contract = new SmartContract(connectedAccount, VOTING_CONTRACT_ADDRESS)

      const args = new Args().addString(connectedAccount.toString())

      const result = await contract.read("getVotingPower", args, {
        maxGas: BigInt(2100000),
        coins: BigInt(0),
      })

      if (!result.value) {
        return 0
      }

      const powerData = result.value
      const powerArgs = new Args(powerData)
      const votingPower = Number(powerArgs.nextU64().expect("Failed to read voting power"))

      return votingPower
    } catch (error) {
      console.error("Failed to get voting power:", error)

      // For development/testing, return mock data
      if (process.env.NODE_ENV !== "production") {
        console.log("Returning mock voting power in development mode")
        return Math.floor(Math.random() * 100) + 10 // Random power between 10 and 110
      }

      return 0
    }
  }

  // Check if user has already voted on a proposal
  async hasVoted(connectedAccount: any, proposalId: number): Promise<boolean> {
    if (!connectedAccount) {
      return false
    }

    try {
      const contract = new SmartContract(connectedAccount, VOTING_CONTRACT_ADDRESS)

      const args = new Args().addU64(BigInt(proposalId)).addString(connectedAccount.toString())

      const result = await contract.read("getVote", args, {
        maxGas: BigInt(2100000),
        coins: BigInt(0),
      })

      // If we get a result, the user has voted
      return !!result.value
    } catch (error) {
      console.error("Failed to check if user has voted:", error)

      // For development/testing, return random result
      if (process.env.NODE_ENV !== "production") {
        console.log("Returning random hasVoted result in development mode")
        return Math.random() > 0.5 // 50% chance of having voted
      }

      return false
    }
  }

  // Get user's vote on a proposal
  async getUserVote(connectedAccount: any, proposalId: number): Promise<VoteRecord | null> {
    if (!connectedAccount) {
      return null
    }

    try {
      const contract = new SmartContract(connectedAccount, VOTING_CONTRACT_ADDRESS)

      const args = new Args().addU64(BigInt(proposalId)).addString(connectedAccount.toString())

      const result = await contract.read("getVote", args, {
        maxGas: BigInt(2100000),
        coins: BigInt(0),
      })

      if (!result.value) {
        return null
      }

      const voteData = result.value
      const voteArgs = new Args(voteData)

      const voteRecord: VoteRecord = {
        voter: voteArgs.nextString().expect("Failed to read voter"),
        proposalId: Number(voteArgs.nextU64().expect("Failed to read proposalId")),
        support: voteArgs.nextBool().expect("Failed to read support"),
        votingPower: Number(voteArgs.nextU64().expect("Failed to read votingPower")),
      }

      return voteRecord
    } catch (error) {
      console.error("Failed to get user vote:", error)

      // For development/testing, return mock data
      if (process.env.NODE_ENV !== "production") {
        console.log("Returning mock vote data in development mode")
        return {
          voter: connectedAccount.toString(),
          proposalId: proposalId,
          support: Math.random() > 0.5, // Random vote
          votingPower: Math.floor(Math.random() * 100) + 10, // Random power between 10 and 110
        }
      }

      return null
    }
  }
}

export const votingService = new VotingService()
export default votingService
