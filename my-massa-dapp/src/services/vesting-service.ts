import { Args, Mas, OperationStatus, SmartContract, parseUnits } from "@massalabs/massa-web3"
import { useEffect, useState } from 'react';

const VESTING_CONTRACT_ADDRESS = "AS141CwwCHqYGYkU7QcgQuLYTwV7k3zM7c4Xn8CMMLftCHBnyovE"

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

    // Validate inputs
    if (!params.amount || !params.lockPeriod || !params.releaseInterval || !params.releasePercentage) {
      throw new Error("All fields must be filled")
    }

    const amountNum = parseFloat(params.amount)
    const lockPeriodNum = parseInt(params.lockPeriod)
    const releaseIntervalNum = parseInt(params.releaseInterval)
    const releasePercentageNum = parseInt(params.releasePercentage)

    if (
      isNaN(amountNum) ||
      isNaN(lockPeriodNum) ||
      isNaN(releaseIntervalNum) ||
      isNaN(releasePercentageNum)
    ) {
      throw new Error("Invalid input values")
    }

    if (amountNum <= 0) {
      throw new Error("Amount must be greater than 0")
    }
    if (lockPeriodNum < 0) {
      throw new Error("Lock period cannot be negative")
    }
    if (releaseIntervalNum <= 0) {
      throw new Error("Release interval must be greater than 0")
    }
    if (releasePercentageNum <= 0 || releasePercentageNum > 100) {
      throw new Error("Release percentage must be between 1 and 100")
    }

    try {
      const contract = new SmartContract(connectedAccount as any, VESTING_CONTRACT_ADDRESS)

      const args = new Args()
        .addString(params.beneficiary)
        .addU64(parseUnits(params.amount, 6))
        .addU64(BigInt(lockPeriodNum))
        .addU64(BigInt(releaseIntervalNum))
        .addU64(BigInt(releasePercentageNum))

      console.log("Calling createVestingSchedule with args:", {
        beneficiary: params.beneficiary,
        amount: parseUnits(params.amount, 6).toString(),
        lockPeriod: lockPeriodNum,
        releaseInterval: releaseIntervalNum,
        releasePercentage: releasePercentageNum,
      })

      const response = await contract.call("createVestingSchedule", args, {
        coins: Mas.fromString(params.amount),
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
    } catch (error) {
      console.error("Error creating vesting schedule:", error)
      throw error
    }
  }
}

export const vestingService = new VestingService()