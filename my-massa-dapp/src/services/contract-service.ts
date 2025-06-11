import { Args, SmartContract, JsonRpcProvider, bytesToSerializableObjectArray} from '@massalabs/massa-web3';
import { ProjectData } from '@/types';
import { Project, VestingSchedule, ProjectUpdate } from '@/models/ContractModels';
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
  image?: string;
}

export interface NewUpdateData {
  title: string;
  content: string;
  author: string;
  image?: string;
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
      .addString(updateData.content)
      .addString(updateData.image || '');

    await contract.call('addProjectUpdate', args);
    console.log(`Successfully added update for project ${projectId}.`);
  } catch (error) {
    console.error('Error adding update:', error);
    throw error;
  }
}

export async function getProjectUpdates(projectId: number): Promise<ContractProjectUpdateData[]> {
  try {
    
    const args = new Args().addU64(BigInt(projectId));
    const response = await readSmartContractPublic(CONTRACT_ADDRESS, 'getProjectUpdates', args)
    const result = response.value;
    
    if (!result || result.length === 0) {
      console.log("No project data returned.", result);
      return [];
    }

    const arrArgs = new Args(result);
    const deserializedUpdates = arrArgs.nextSerializableObjectArray<ProjectUpdate>(ProjectUpdate);


    return deserializedUpdates.map(update => ({
      id: update.id.toString(),
      date: update.date,
      title: update.title,
      content: update.content,
      author: update.author,
      image: update.image,
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

export async function getUserVestingSchedules(userAddress: string): Promise<number[]> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const args = new Args().addString(userAddress);
    const response = await contract.read('getUserVestingSchedules', args);
    const argsReader = new Args(response.value);
    const length = Number(argsReader.nextU64());
    const vestingIds: number[] = [];
    for (let i = 0; i < length; i++) {
      vestingIds.push(Number(argsReader.nextU64()));
    }
    return vestingIds;
  } catch (error) {
    console.error('Error fetching user vesting schedules:', error);
    throw error;
  }
}

export async function fetchUserDonations(userAddress: string): Promise<ContractVestingScheduleData[]> {
  try {
    const vestingIds = await getUserVestingSchedules(userAddress);
    const donationSchedules: ContractVestingScheduleData[] = [];

    for (const id of vestingIds) {
      const schedule = await getVestingSchedule(id);
      donationSchedules.push(schedule);
    }

    return donationSchedules;
  } catch (error) {
    console.error('Error fetching user donations:', error);
    throw error;
  }
}

export async function getCurrentMassaPeriod(): Promise<number> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const response = await contract.read('getCurrentMassaPeriod', new Args());
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching current Massa period:', error);
    throw error;
  }
}

export function getProjectCreationDate(creationPeriod: number): Date {
  const MASSA_GENESIS_TIMESTAMP_MS = 1704289800000; // Wednesday, January 3, 2024 1:50:00 PM UTC (BuildNet)
  const MASSA_PERIOD_DURATION_MS = 16 * 1000; // 16 seconds per period
  const creationTimestampMs = MASSA_GENESIS_TIMESTAMP_MS + (creationPeriod * MASSA_PERIOD_DURATION_MS);

  return new Date(creationTimestampMs);
}

export async function getUserDonations(userAddress: string): Promise<Array<{ projectId: string; amount: number }>> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const args = new Args().addString(userAddress);
    const response = await contract.read('getUserDonations', args);
    const argsReader = new Args(response.value);
    const length = Number(argsReader.nextU64());
    const donations: Array<{ projectId: string; amount: number }> = [];
    for (let i = 0; i < length; i++) {
      const projectId = argsReader.nextU64().toString();
      const amount = Number(argsReader.nextU64()) / 1e9;
      donations.push({ projectId, amount });
    }
    return donations;
  } catch (error) {
    console.error('Error fetching user donations:', error);
    throw error;
  }
}

export async function getTotalDonatedAmount(userAddress: string): Promise<number> {
  try {
    const donations = await getUserDonations(userAddress);
    return donations.reduce((total, d) => total + d.amount, 0);
  } catch (error) {
    console.error('Error calculating total donated amount:', error);
    throw error;
  }
}

export async function getTotalClaimedAmount(userAddress: string): Promise<number> {
  try {
    const vestingSchedules = await getUserVestingSchedules(userAddress);
    return vestingSchedules.reduce((total, schedule) => total + schedule, 0);
  } catch (error) {
    console.error('Error calculating total claimed amount:', error);
    throw error;
  }
}

// Returns true if the vesting for the project is completed
export async function isProjectVestingCompleted(projectId: number): Promise<boolean> {
  try {
    // 1. Fetch the project
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const args = new Args().addU64(BigInt(projectId));
    const response = await contract.read('getProject', args);

    if (!response.value || response.value.length === 0) {
      throw new Error('Project not found');
    }

    // Parse the project object
    const [project] = bytesToSerializableObjectArray(response.value, Project);

    // 2. Get the vestingScheduleId from the project
    const vestingScheduleId = Number(project.vestingScheduleId);

    // If vestingScheduleId is 0 or not set, vesting hasn't started
    if (!vestingScheduleId) {
      return false;
    }

    // 3. Fetch the vesting schedule
    const vestingArgs = new Args().addU64(BigInt(vestingScheduleId));
    const vestingResponse = await contract.read('getVestingSchedule', vestingArgs);

    if (!vestingResponse.value || vestingResponse.value.length === 0) {
      // If the vesting schedule does not exist, it is completed
      return true;
    }

    // Parse the vesting schedule
    const [schedule] = bytesToSerializableObjectArray(vestingResponse.value, VestingSchedule);

    // 4. Check if all funds have been claimed
    return Number(schedule.amountClaimed) >= Number(schedule.totalAmount);
  } catch (error) {
    // If any error occurs (e.g., vesting schedule not found), treat as completed
    return true;
  }
}

// Interface for detailed vesting information to be displayed on the frontend.
export interface DetailedVestingInfo {
  vestingScheduleId: string | null;
  vestingStart: string; // Formatted time since vesting started
  nextRelease: string; // Formatted time until next release
  amountReceived: string; // Formatted amount received (MAS)
  amountLeft: string; // Formatted amount left (MAS)
  lockPeriod: string; // Original lock period in days
  releaseInterval: string; // Original release interval in days
  releasePercentage: number; // Original release percentage
  beneficiary: string; // Beneficiary address
  hasVestingSchedule: boolean; // Indicates if a vesting schedule exists for the project
  loading: boolean;
}

/**
 * Fetches and formats detailed vesting schedule information for a given project.
 * This function combines data from multiple contract getters and formats it for display.
 *
 * @param projectId The ID of the project to fetch vesting details for.
 * @returns A promise that resolves to a DetailedVestingInfo object, or null if no vesting schedule exists.
 */
export async function getDetailedVestingInfo(projectId: number): Promise<DetailedVestingInfo> {
  const initialInfo: DetailedVestingInfo = {
    vestingScheduleId: null,
    vestingStart: 'N/A',
    nextRelease: 'N/A',
    amountReceived: 'N/A',
    amountLeft: 'N/A',
    lockPeriod: 'N/A',
    releaseInterval: 'N/A',
    releasePercentage: 0,
    beneficiary: 'N/A',
    hasVestingSchedule: false,
    loading: true,
  };

  try {
    const selectedProject = await getProject(projectId); // Reuse existing getProject
    
    if (!selectedProject || !selectedProject.vestingScheduleId) {
      return { ...initialInfo, loading: false, hasVestingSchedule: false };
    }

    const vestingScheduleIdNum = Number(selectedProject.vestingScheduleId);

    const [fetchedVestingSchedule, currentPeriod] = await Promise.all([
      getVestingSchedule(vestingScheduleIdNum),
      getCurrentMassaPeriod(),
    ]);

    const formatPeriodDifference = (targetPeriod: number, currentPeriod: number | null): string => {
      if (currentPeriod === null) return 'Loading...';

      const diffPeriods = targetPeriod - currentPeriod;
      const seconds = Math.abs(diffPeriods * 15); // 1 Massa period = 15 seconds

      if (diffPeriods < 0) {
        // Past
        if (seconds < 60) {
          return `${Math.floor(seconds)} seconds ago`;
        } else if (seconds < 3600) {
          return `${Math.floor(seconds / 60)} minutes ago`;
        } else if (seconds < 86400) {
          return `${Math.floor(seconds / 3600)} hours ago`;
        } else {
          return `${Math.floor(seconds / 86400)} days ago`;
        }
      } else if (diffPeriods > 0) {
        // Future
        if (seconds < 60) {
          return `in ${Math.floor(seconds)} seconds`;
        } else if (seconds < 3600) {
          return `in ${Math.floor(seconds / 60)} minutes`;
        } else if (seconds < 86400) {
          return `in ${Math.floor(seconds / 3600)} hours`;
        } else {
          return `in ${Math.floor(seconds / 86400)} days`;
        }
      } else {
        return 'now';
      }
    };

    const vestingStartPeriod = selectedProject.creationPeriod + Number(selectedProject.lockPeriod);

    return {
      vestingScheduleId: selectedProject.vestingScheduleId,
      vestingStart: formatPeriodDifference(vestingStartPeriod, currentPeriod),
      nextRelease: formatPeriodDifference(fetchedVestingSchedule.nextReleasePeriod, currentPeriod),
      amountReceived: (fetchedVestingSchedule.amountClaimed / 1e9).toLocaleString(),
      amountLeft: ((fetchedVestingSchedule.totalAmount - fetchedVestingSchedule.amountClaimed) / 1e9).toLocaleString(),
      lockPeriod: selectedProject.lockPeriod,
      releaseInterval: selectedProject.releaseInterval,
      releasePercentage: selectedProject.releasePercentage,
      beneficiary: selectedProject.beneficiary,
      hasVestingSchedule: true,
      loading: false,
    };
  } catch (error) {
    console.error('Error fetching detailed vesting info:', error);
    return { ...initialInfo, loading: false };
  }
}
