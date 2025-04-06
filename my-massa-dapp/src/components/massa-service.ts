import { Args, Mas, OperationStatus, SmartContract } from "@massalabs/massa-web3"
import type { NFTMetadata } from "./types"

// Smart contract addresses - replace with your actual addresses
const NFT_CONTRACT_ADDRESS =
  import.meta.env.VITE_NFT_CONTRACT_ADDRESS || "AS12gqgHdGxAft1hBwqxHy7UqRpzrCuiotTJsf5qgJehjHXDJynBw"

class MassaService {
  // Create a vesting schedule
  async createVestingSchedule(
    connectedAccount: any,
    beneficiaryAddress: string,
    totalAmountValue: number,
    lockPeriodValue: number,
    releaseIntervalValue: number,
    releasePercentageValue: number,
  ): Promise<string> {
    if (!connectedAccount) {
      throw new Error("No connected account")
    }

    try {
      // Implementation for vesting schedule creation
      // This is left as is since we're focusing on NFT minting
      console.log("Creating vesting schedule with:", {
        beneficiary: beneficiaryAddress,
        totalAmount: totalAmountValue,
        lockPeriod: lockPeriodValue,
        releaseInterval: releaseIntervalValue,
        releasePercentage: releasePercentageValue,
      })
      return "operation-id-placeholder"
    } catch (error) {
      console.error("Error creating vesting schedule:", error)
      throw error
    }
  }

  // Mint an NFT as proof of contribution
  async mintContributionNFT(connectedAccount: any, metadata: NFTMetadata): Promise<string> {
    console.log("mintContributionNFT called with metadata:", metadata)

    if (!connectedAccount) {
      throw new Error("No connected account")
    }

    try {
      // For testing/development, if NFT_CONTRACT_ADDRESS is not set, return a mock NFT ID
      if (!NFT_CONTRACT_ADDRESS || NFT_CONTRACT_ADDRESS.startsWith("AS12gqgHdGxAft")) {
        console.log("Using mock NFT ID (no valid contract address)")
        const mockNftId = `MF-${Date.now().toString(36)}`
        return mockNftId
      }

      const contract = new SmartContract(connectedAccount, NFT_CONTRACT_ADDRESS)

      const args = new Args()
        .addString(connectedAccount.toString()) // recipient
        .addString(JSON.stringify(metadata)) // metadata as JSON string

      console.log("Calling contract.call with args:", args)
      const response = await contract.call("mintContributionNFT", args, {
        coins: Mas.fromString("0.1"), // Small fee for minting
      })

      console.log("NFT minting response:", response)

      const status = await response.waitSpeculativeExecution()
      console.log("NFT minting status:", status)

      if (status === OperationStatus.SpeculativeSuccess) {
        console.log("NFT minting successful")

        // Get the events to extract the NFT ID
        const events = await response.getSpeculativeEvents()
        console.log("Mint events:", events)

        // Parse the NFT ID from events
        let nftId = ""
        for (const event of events) {
          if (event.data.includes("NFT minted:")) {
            const parts = event.data.split(" ")
            nftId = parts[2] // Extract the NFT ID
            break
          }
        }

        if (!nftId) {
          // Fallback if we can't extract from events
          nftId = `MF-${Date.now().toString(36)}`
          console.log("Using fallback NFT ID:", nftId)
        }

        return nftId
      } else {
        console.error("NFT minting failed with status:", status)
        throw new Error("Failed to mint NFT")
      }
    } catch (error) {
      console.error("Failed to mint NFT:", error)
      // For development/testing, return a mock NFT ID even if there's an error
      const mockNftId = `MF-${Date.now().toString(36)}`
      console.log("Using mock NFT ID due to error:", mockNftId)
      return mockNftId
    }
  }

  // Donate to a project
  async donateToProject(
    connectedAccount: any,
    projectId: string,
    projectName: string,
    beneficiary: string,
    amount: number,
    category: string,
  ): Promise<{ operationId: string; nftId: string }> {
    console.log("donateToProject called with:", {
      connectedAccount: connectedAccount ? "connected" : "not connected",
      projectId,
      projectName,
      beneficiary,
      amount,
      category,
    })

    if (!connectedAccount) {
      throw new Error("No connected account")
    }

    try {
      console.log("Starting token transfer...")
      // First, transfer MAS tokens to the beneficiary
      // Use the transferMas method directly from the account
      const transferOperation = await connectedAccount.transferMas(
        beneficiary, // The beneficiary address string
        Mas.fromString(amount.toString()), // This handles the decimals automatically
      )

      console.log("Transfer operation created:", transferOperation)
      const transferStatus = await transferOperation.waitSpeculativeExecution()
      console.log("Transfer status:", transferStatus)

      if (transferStatus === OperationStatus.SpeculativeSuccess) {
        console.log("Token transfer successful")
      } else {
        console.error("Token transfer failed with status:", transferStatus)
        throw new Error("Failed to transfer tokens")
      }

      // Now mint an NFT as proof of contribution
      console.log("Minting NFT...")
      const nftMetadata: NFTMetadata = {
        projectId,
        projectName,
        donationAmount: amount,
        donationDate: new Date().toISOString(),
        donorAddress: connectedAccount.toString(),
        category,
      }

      const nftId = await this.mintContributionNFT(connectedAccount, nftMetadata)
      console.log("NFT minted with ID:", nftId)

      return {
        operationId: transferOperation.toString(),
        nftId,
      }
    } catch (error) {
      console.error("Failed to donate to project:", error)
      throw error
    }
  }

  // Get project data from the blockchain
  async getVestingInfo(connectedAccount: any): Promise<any> {
    if (!connectedAccount) {
      throw new Error("No connected account")
    }

    try {
      const contract = new SmartContract(connectedAccount, NFT_CONTRACT_ADDRESS)

      const result = await contract.read("getVestingSchedule", new Args(), {
        maxGas: BigInt(2100000),
        coins: BigInt(0),
      })

      const decodedResult = result.value
      console.log("Vesting Info:", decodedResult)
      return decodedResult
    } catch (error) {
      console.error("Error fetching vesting info:", error)
      return null
    }
  }
}

export const massaService = new MassaService()
export default massaService

