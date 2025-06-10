import { Args, SmartContract, JsonRpcProvider, bytesToSerializableObjectArray } from '@massalabs/massa-web3';
import { ProjectData } from '@/types';
import { Project, VestingSchedule, ProjectMilestone, ProjectUpdate } from '@/models/ContractModels';
import { readSmartContractPublic } from '@/utils/smartContract';
import { CONTRACT_ADDRESS } from '@/constants';
import { convertProjectToProjectData } from '@/utils/project';


// Create a public provider for read-only operations
const publicProvider = JsonRpcProvider.buildnet();

// Frontend interfaces for Milestone and Update data matching the contract structure
export interface ContractProjectMilestoneData {
  id: string;
  title: string;
  description: string;
  deadline: string;
  completed: boolean;
  progress: number;
}

export interface NewMilestoneData {
  title: string;
  description: string;
  deadline: string;
  progress: number;
}

export interface ContractProjectUpdateData {
  id: string;
  date: string;
  title: string;
  content: string;
  author: string;
}

export interface NewUpdateData {
  title: string;
  content: string;
  author: string;
}

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
    // Use connectedAccount's provider for write operations
    const contract = new SmartContract(connectedAccount, CONTRACT_ADDRESS);

    const args = new Args()
      .addString(projectData.title)
      .addString(projectData.description)
      .addU64(BigInt(parseFloat(projectData.fundingGoal) * 1e9)) // Convert to nanoMAS BigInt
      .addString(projectData.beneficiaryAddress)
      .addString(projectData.category)
      .addU64(BigInt(projectData.lockPeriod)) // Convert to BigInt
      .addU64(BigInt(projectData.releaseInterval)) // Convert to BigInt
      .addU64(BigInt(projectData.releasePercentage)) // Convert to BigInt
      .addString(projectData.image);

    const response = await contract.call('createProject', args);
    return response;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}


export async function getAllProjects(): Promise<ProjectData[]> {
  try {
    const response = await readSmartContractPublic(CONTRACT_ADDRESS, 'getAllProjects', new Args())
    const result = response.value;

    if (!result || result.length === 0) {
      console.log("No project data returned.", result);
      return [];
    }
    const arrArgs = new Args(result);
    const deserializedProjects = arrArgs.nextSerializableObjectArray<Project>(Project);

    // Convert deserialized Project objects to ProjectData objects
    const projectDataPromises = deserializedProjects.map(project => convertProjectToProjectData(project));
    return Promise.all(projectDataPromises);

  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

export async function getProject(projectId: number): Promise<ProjectData> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const args = new Args().addU64(BigInt(projectId));
    const response = await contract.read('getProject', args);
    const [project] = bytesToSerializableObjectArray(response.value, Project);

    // Convert the deserialized Project object to a ProjectData object
    return convertProjectToProjectData(project);

  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

export async function fundProject(connectedAccount: any, projectId: number, amount: bigint): Promise<void> {
  try {
    // Use connectedAccount's provider for write operations
    const contract = new SmartContract(connectedAccount, CONTRACT_ADDRESS);
    const args = new Args().addU64(BigInt(projectId));

    // Call the fundProject function, sending coins
    await contract.call(
      'fundProject',
      args,
      { coins: amount }
    );

    console.log(`Successfully funded project ${projectId} with ${amount} MAS.`);

  } catch (error) {
    console.error('Error funding project:', error);
    throw error;
  }
}

export async function addMilestone(
  connectedAccount: any,
  projectId: number,
  milestone: NewMilestoneData,
): Promise<void> {
  try {
    const contract = new SmartContract(connectedAccount, CONTRACT_ADDRESS);
    const args = new Args()
      .addU64(BigInt(projectId))
      .addString(milestone.title)
      .addString(milestone.description)
      .addString(milestone.deadline)
      .addU64(BigInt(milestone.progress));

    await contract.call('addMilestone', args);
    console.log(`Successfully added milestone for project ${projectId}.`);
  } catch (error) {
    console.error('Error adding milestone:', error);
    throw error;
  }
}

export async function getMilestones(projectId: number): Promise<ContractProjectMilestoneData[]> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const args = new Args().addU64(BigInt(projectId));
    const response = await contract.read('getMilestones', args);

    
    const deserializedMilestones = bytesToSerializableObjectArray(response.value, ProjectMilestone);


    return deserializedMilestones.map(milestone => ({
      id: milestone.id.toString(),
      title: milestone.title,
      description: milestone.description,
      deadline: milestone.deadline,
      completed: milestone.completed,
      progress: Number(milestone.progress),
    }));

  } catch (error) {
    console.error('Error fetching project milestones:', error);
    throw error;
  }
}

export async function addUpdate(
  connectedAccount: any,
  projectId: number,
  updateData: NewUpdateData,
): Promise<void> {
  try {
    const contract = new SmartContract(connectedAccount, CONTRACT_ADDRESS);
    const args = new Args()
      .addU64(BigInt(projectId))
      .addString(updateData.title)
      .addString(updateData.content);

    await contract.call('addProjectUpdate', args); // Assuming addProjectUpdate is the correct function name in contract
    console.log(`Successfully added update for project ${projectId}.`);
  } catch (error) {
    console.error('Error adding update:', error);
    throw error;
  }
}

export async function getProjectUpdates(projectId: number): Promise<ContractProjectUpdateData[]> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const args = new Args().addU64(BigInt(projectId));
    const response = await contract.read('getProjectUpdates', args);

    
    const deserializedUpdates = bytesToSerializableObjectArray(response.value, ProjectUpdate);


    return deserializedUpdates.map(update => ({
      id: update.id.toString(),
      date: update.date,
      title: update.title,
      content: update.content,
      author: update.author,
    }));

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
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const args = new Args().addU64(BigInt(vestingId));
    const response = await contract.read('getVestingSchedule', args);

    // Use bytesToSerializableObjectArray to deserialize the response
    const [schedule] = bytesToSerializableObjectArray(response.value, VestingSchedule);

    return {
      id: Number(schedule.id),
      beneficiary: schedule.beneficiary,
      totalAmount: Number(schedule.totalAmount),
      amountClaimed: Number(schedule.amountClaimed),
      lockPeriod: Number(schedule.lockPeriod),
      releaseInterval: Number(schedule.releaseInterval),
      releasePercentage: Number(schedule.releasePercentage),
      nextReleasePeriod: Number(schedule.nextReleasePeriod)
    };

  } catch (error) {
    console.error('Error fetching vesting schedule:', error);
    throw error;
  }
}

export async function getTotalVested(vestingId: number): Promise<number> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const args = new Args().addU64(BigInt(vestingId));
    const response = await contract.read('getTotalVested', args);
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching total vested amount:', error);
    throw error;
  }
}

export async function getLockedAmount(vestingId: number): Promise<number> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const args = new Args().addU64(BigInt(vestingId));
    const response = await contract.read('getLockedAmount', args);
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching locked amount:', error);
    throw error;
  }
}

export async function viewNextVestingId(): Promise<number> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const response = await contract.read('viewNextVestingId', new Args());
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching next vesting ID:', error);
    throw error;
  }
}

export async function getTotalDonations(): Promise<number> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const response = await contract.read('getTotalDonations', new Args());
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching total donations:', error);
    throw error;
  }
}

export async function getTotalProjectsFunded(): Promise<number> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const response = await contract.read('getTotalProjectsFunded', new Args());
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching total projects funded:', error);
    throw error;
  }
}

export async function getTotalSupporters(): Promise<number> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const response = await contract.read('getTotalSupporters', new Args());
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching total supporters:', error);
    throw error;
  }
}

export async function getProjectSupportersCount(projectId: bigint): Promise<number> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const args = new Args().addU64(projectId);
    const response = await contract.read('getProjectSupportersCount', args);
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching project supporters count:', error);
    throw error;
  }
}

