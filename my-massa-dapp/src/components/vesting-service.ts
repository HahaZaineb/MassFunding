import { Args, Mas, OperationStatus, SmartContract } from "@massalabs/massa-web3"
import { useEffect, useState } from 'react';
const VESTING_CONTRACT_ADDRESS = "AS1DLxrPVcJ6xhSvoNe7s3pMbFStCtnLrMhhZeoWBFE8tzFjcFda"

export interface VestingScheduleParams {
  beneficiary: string
  amount: string
  lockPeriod: string
  releaseInterval: string
  releasePercentage: string
}

export class VestingService {
  
 

  async createVestingSchedule(connectedAccount: any, params: VestingScheduleParams): Promise<string> {
    console.log("Create Vesting Schedule clicked")
    console.log("Params:", params)

    if (!connectedAccount) {
      console.error("No connected account")
      throw new Error("No connected account")
    }

    try {
      
      const contract = new SmartContract(connectedAccount as any, VESTING_CONTRACT_ADDRESS)

      // Convert amount to MAS (assuming the amount is in MAS units)
      const amountInMAS = Mas.fromString(params.amount)

      // Convert days to seconds (matching your test code logic)
      const lockPeriodSeconds = BigInt(Number.parseInt(params.lockPeriod) * 24 * 60 * 60)
      const releaseIntervalSeconds = BigInt(Number.parseInt(params.releaseInterval) * 24 * 60 * 60)

      const args = new Args()
        .addString(params.beneficiary)
        .addString("MAS") // Placeholder for native MAS token
        .addU64(amountInMAS) // Amount in nanoMAS
        .addU64(lockPeriodSeconds) // Lock period in seconds
        .addU64(releaseIntervalSeconds) // Release interval in seconds
        .addU64(BigInt(params.releasePercentage)) // Release percentage

      console.log("Calling createVestingSchedule with args:", {
        beneficiary: params.beneficiary,
        amount: amountInMAS.toString(),
        lockPeriod: lockPeriodSeconds.toString(),
        releaseInterval: releaseIntervalSeconds.toString(),
        releasePercentage: params.releasePercentage,
      })

      const response = await contract.call("createVestingSchedule", args, {
        coins: amountInMAS, // Send MAS tokens with the transaction
      })

      console.log("Transaction response:", response)

      const status = await response.waitSpeculativeExecution()
      console.log("Transaction status:", status)

      const events = await response.getSpeculativeEvents()
      console.log("Events:", events)

      if (status === OperationStatus.SpeculativeSuccess) {
        console.log("Transaction successful")
        return response.toString()
      } else {
        console.error("Transaction failed")
        throw new Error(`Transaction failed with status: ${status}`)
      }
      // setDeferredCallId(response.toString());
    } catch (error) {
      console.error("Error creating vesting schedule:", error)
      throw error
    }
  }
}

export const vestingService = new VestingService()
