import { Args, SmartContract } from '@massalabs/massa-web3';
import { ProjectData } from '@/types';
import { useEffect, useState } from 'react';

const CONTRACT_ADDRESS = "AS14j9kaiJ7RVJy9yUKfNpYeTNqFiEPVqRv5XTh2q6V74UZu4V4y"

export async function createProject(
  connectedAccount: any,
  projectData: {
    title: string;
    description: string;
    fundingGoal: string;
    beneficiaryAddress: string;
    category: string;
    lockPeriod: string;
    releaseInterval: string;
    releasePercentage: number;
    image: string;
  }
) {
  try {
    const contract = new SmartContract(connectedAccount, CONTRACT_ADDRESS);

    const args = new Args()
      .addString(projectData.title)
      .addString(projectData.description)
      .addU64(BigInt(parseFloat(projectData.fundingGoal) * 1e9)) // Convert to nanoMAS
      .addString(projectData.beneficiaryAddress)
      .addString(projectData.category)
      .addU64(BigInt(projectData.lockPeriod))
      .addU64(BigInt(projectData.releaseInterval))
      .addU64(BigInt(projectData.releasePercentage))
      .addString(projectData.image);

    const response = await contract.call('createProject', args);
    return response;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}


export async function getAllProjects(connectedAccount: any): Promise<number[]> {
  try {
    const contract = new SmartContract(connectedAccount, CONTRACT_ADDRESS);
    const response = await contract.read('getAllProjects', new Args());
    const result = response.value;

    if (!result || result.length === 0) {
      console.log("No project IDs returned.", result);
      return [];
    }

    const argsReader = new Args(result);
    const arrayLength = Number(argsReader.nextU64()); // Read array length
    const projectIds: number[] = [];

    for (let i = 0; i < arrayLength; i++) {
      projectIds.push(Number(argsReader.nextU64())); // Read each u64 ID
    }
    console.log("Fetched and deserialized project IDs:", projectIds);
    return projectIds;

  } catch (error) {
    console.error('Error fetching project IDs:', error);
    throw error;
  }
}

export async function getProject(connectedAccount: any, projectId: number): Promise<ProjectData> {
  try {
    const contract = new SmartContract(connectedAccount, CONTRACT_ADDRESS);
    const args = new Args().addU64(BigInt(projectId));
    const response = await contract.read('getProject', args);
    const deserializer = new Args(response.value);
    // Deserialize in the order of the contract's Project class
    const id = deserializer.nextU64();
    const creator = deserializer.nextString();
    const title = deserializer.nextString();
    const description = deserializer.nextString();
    const fundingGoal = Number(deserializer.nextU64());
    const amountRaised = Number(deserializer.nextU64());
    const beneficiary = deserializer.nextString();
    const category = deserializer.nextString();
    const lockPeriod = Number(deserializer.nextU64());
    const releaseInterval = Number(deserializer.nextU64());
    const releasePercentage = Number(deserializer.nextU64());
    const image = deserializer.nextString();
    const creationPeriod = Number(deserializer.nextU64());
    const vestingScheduleId = Number(deserializer.nextU64());
    const initialVestingTriggered = deserializer.nextBool();
    // Map to ProjectData
    return {
        id: id.toString(),
        name: title,
        description,
        amountNeeded: fundingGoal,
        goalAmount: fundingGoal,
        amountRaised,
        beneficiary,
        lockPeriod: lockPeriod.toString(),
        releaseInterval: releaseInterval.toString(),
        releasePercentage,
        supporters: 0,
        category,
        updates: [],
        milestones: [],
        owner: '',
        creator,
        deadline: '',
        image
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

export async function fundProject(projectId: number, amount: bigint): Promise<void> {
  try {
    const contract = new SmartContract(null, CONTRACT_ADDRESS); // Assuming CONTRACT_ADDRESS is defined
    const args = new Args().addU64(BigInt(projectId));

    // Call the fundProject function, sending coins
    await contract.call(
      'fundProject',
      args,
      amount // Amount of coins to send
    );

    console.log(`Successfully funded project ${projectId} with ${amount} MAS.`);

  } catch (error) {
    console.error('Error funding project:', error);
    throw error; // Rethrow to be handled by the component
  }
}

export async function addUpdate(
  connectedAccount: any,
  projectId: number,
  updateMessage: string
): Promise<string> {
  try {
    const contract = new SmartContract(connectedAccount, CONTRACT_ADDRESS);
    const args = new Args()
      .addU64(BigInt(projectId))
      .addString(updateMessage);
    const response = await contract.call('addUpdate', args);
    console.log('Add update transaction response:', response);
    // Wait for speculative execution and return operation ID
    await response.waitSpeculativeExecution();
    return response.toString();
  } catch (error) {
    console.error('Error adding update:', error);
    throw error;
  }
}

export async function getProjectUpdates(projectId: number): Promise<string[]> {
  try {
    // Note: getProjectUpdates in contract.ts does not check caller, so no connectedAccount needed for read
    const contract = new SmartContract(null, CONTRACT_ADDRESS); // Use null account for read-only if no account is required by the contract
    const args = new Args().addU64(BigInt(projectId));
    const response = await contract.read('getProjectUpdates', args);
    
    // Deserialize the array of strings
    const argsReader = new Args(response.value);
    const updates: string[] = [];
    // Assuming the array of strings is serialized with length prefix followed by strings with length prefixes
    const arrayLength = Number(argsReader.nextU64()); // Read array length (assuming u64)
    for (let i = 0; i < arrayLength; i++) {
      updates.push(argsReader.nextString());
    }
    return updates;

  } catch (error) {
    console.error('Error fetching project updates:', error);
    throw error;
  }
}

// Define a frontend interface for VestingSchedule data matching the contract structure
export interface ContractVestingScheduleData {
  id: number; // u64 in contract
  beneficiary: string; // Address serialized as string in contract
  totalAmount: number; // u64 in contract
  amountClaimed: number; // u64 in contract
  lockPeriod: number; // u64 in contract
  releaseInterval: number; // u64 in contract
  releasePercentage: number; // u64 in contract
  nextReleasePeriod: number; // u64 in contract
}

export async function getVestingSchedule(vestingId: number): Promise<ContractVestingScheduleData> {
  try {
    const contract = new SmartContract(null, CONTRACT_ADDRESS); // Read-only from main contract
    const args = new Args().addU64(BigInt(vestingId));
    const response = await contract.read('getVestingSchedule', args);

    // Manually deserialize VestingSchedule data
    const deserializer = new Args(response.value);
    const id = Number(deserializer.nextU64());
    const beneficiary = deserializer.nextString();
    const totalAmount = Number(deserializer.nextU64());
    const amountClaimed = Number(deserializer.nextU64());
    const lockPeriod = Number(deserializer.nextU64());
    const releaseInterval = Number(deserializer.nextU64());
    const releasePercentage = Number(deserializer.nextU64());
    const nextReleasePeriod = Number(deserializer.nextU64());

    return {
      id,
      beneficiary,
      totalAmount,
      amountClaimed,
      lockPeriod,
      releaseInterval,
      releasePercentage,
      nextReleasePeriod,
    };

  } catch (error) {
    console.error('Error fetching vesting schedule:', error);
    throw error;
  }
}

export async function getTotalVested(vestingId: number): Promise<number> {
  try {
    const contract = new SmartContract(null, CONTRACT_ADDRESS); // Read-only from main contract
    const args = new Args().addU64(BigInt(vestingId));
    const response = await contract.read('getTotalVested', args);
    // Deserialize the u64 return value
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching total vested amount:', error);
    throw error;
  }
}

export async function getLockedAmount(vestingId: number): Promise<number> {
  try {
    const contract = new SmartContract(null, CONTRACT_ADDRESS); // Read-only from main contract
    const args = new Args().addU64(BigInt(vestingId));
    const response = await contract.read('getLockedAmount', args);
    // Deserialize the u64 return value
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching locked amount:', error);
    throw error;
  }
}

export async function viewNextVestingId(): Promise<number> {
  try {
    const contract = new SmartContract(null, CONTRACT_ADDRESS); // Read-only from main contract, no args
    const response = await contract.read('viewNextVestingId', new Args());
    // Deserialize the u64 return value
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching next vesting ID:', error);
    throw error;
  }
}

