import { Args, SmartContract, JsonRpcProvider, bytesToSerializableObjectArray} from '@massalabs/massa-web3';
import { ProjectData } from '@/types';
import { Project, VestingSchedule, ProjectUpdate } from '@/models/ContractModels';
import { readSmartContractPublic } from '@/utils/smartContract';
import { convertProjectToProjectData } from '@/utils/project';
import { CONTRACT_ADDRESS } from '@/configs/massa';

const PERIODS_PER_DAY = 5760; // 86400 seconds / 15 seconds per period
const PERIODS_PER_SECOND = 1 / 15;

// Helper function to format periods into human-readable time (days, hours, minutes, seconds)
export const formatPeriodsToHumanReadable = (periods: number): string => {
  const totalSeconds = periods * 15; // 1 Massa period = 15 seconds

  if (totalSeconds < 60) {
    return `${Math.round(totalSeconds)} seconds`;
  } else if (totalSeconds < 3600) {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.round(totalSeconds % 60);
    return `${minutes} minutes` + (remainingSeconds > 0 ? ` ${remainingSeconds} seconds` : '');
  } else if (totalSeconds < 86400) {
    const hours = Math.floor(totalSeconds / 3600);
    const remainingMinutes = Math.round((totalSeconds % 3600) / 60);
    return `${hours} hours` + (remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : '');
  } else {
    const days = Math.round(totalSeconds / 86400);
    return `${days} days`;
  }
};

// Helper function to parse human-readable time (days, hours, minutes, seconds) into periods
export const parseDurationToPeriods = (durationString: string): bigint => {
  const parts = durationString.trim().split(' ');
  if (parts.length < 2) {
    // If no unit is specified, assume days as a default or throw an error based on expected input
    const value = parseFloat(durationString);
    if (isNaN(value)) throw new Error('Invalid duration string: No unit specified or invalid number.');
    // Default to days if no unit is provided
    return BigInt(Math.round(value * PERIODS_PER_DAY));
  }

  const value = parseFloat(parts[0]);
  if (isNaN(value)) throw new Error('Invalid duration value in string.');

  const unit = parts[1].toLowerCase();

  let periods: number;

  switch (unit) {
    case 'second':
    case 'seconds':
      periods = value * PERIODS_PER_SECOND;
      break;
    case 'minute':
    case 'minutes':
      periods = value * 60 * PERIODS_PER_SECOND;
      break;
    case 'hour':
    case 'hours':
      periods = value * 3600 * PERIODS_PER_SECOND;
      break;
    case 'day':
    case 'days':
      periods = value * 86400 * PERIODS_PER_SECOND;
      break;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }

  return BigInt(Math.round(periods));
};

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

    // Convert human-readable durations to periods
    const lockPeriodInPeriods = parseDurationToPeriods(projectData.lockPeriod);
    const releaseIntervalInPeriods = parseDurationToPeriods(projectData.releaseInterval);
    const args = new Args()
      .addString(projectData.title)
      .addString(projectData.description)
      .addU64(BigInt(Math.round(parseFloat(projectData.fundingGoal) * 1e9))) // Convert to nanoMAS BigInt and round
      .addString(projectData.beneficiaryAddress)
      .addString(projectData.category)
      .addU64(lockPeriodInPeriods) // Pass periods as u64
      .addU64(releaseIntervalInPeriods) // Pass periods as u64
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
  isCompleted: boolean; // New field to track completion status
}

export async function getVestingSchedule(vestingId: number): Promise<ContractVestingScheduleData | null> {
  try {
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const args = new Args().addU64(BigInt(vestingId));
    const response = await contract.read('getVestingSchedule', args);

    // If the contract returns an empty array, the schedule doesn't exist
    if (!response.value || response.value.length === 0) {
      return null;
    }

    const schedule = new VestingSchedule();
    try {
      schedule.deserialize(response.value, 0);
      // Check if deserialized schedule has valid ID after deserialization
      if (Number(schedule.id) !== vestingId) {
          return null; // Return null if deserialization seems to have failed or returned wrong ID
      }
    } catch (deserializeError) {
      return null; // Return null if deserialization throws an error
    }

    return {
      id: Number(schedule.id),
      beneficiary: schedule.beneficiary,
      totalAmount: Number(schedule.totalAmount),
      amountClaimed: Number(schedule.amountClaimed),
      lockPeriod: Number(schedule.lockPeriod),
      releaseInterval: Number(schedule.releaseInterval),
      releasePercentage: Number(schedule.releasePercentage),
      nextReleasePeriod: Number(schedule.nextReleasePeriod),
      isCompleted: schedule.isCompleted
    };

  } catch (error) {
    return null; // Return null on any error during fetch or processing
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
      if (schedule) { // Only push if schedule is not null
        donationSchedules.push(schedule);
      }
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
    // 1. Get the project
    const project = await getProject(projectId);
    if (!project) {
      return false; // If project doesn't exist, vesting is not completed
    }

    // 2. Get the vestingScheduleId from the project
    const vestingScheduleId = Number(project.vestingScheduleId);

    // If vestingScheduleId is 0 or not set, vesting hasn't started
    if (!vestingScheduleId) {
      return false;
    }

    // 3. Fetch the vesting schedule
    const contract = new SmartContract(publicProvider, CONTRACT_ADDRESS);
    const vestingArgs = new Args().addU64(BigInt(vestingScheduleId));
    const vestingResponse = await contract.read('getVestingSchedule', vestingArgs);
    
    if (!vestingResponse.value || vestingResponse.value.length === 0) {
      return false; // If schedule doesn't exist, it's not completed
    }

    // Parse the vesting schedule
    const [schedule] = bytesToSerializableObjectArray(vestingResponse.value, VestingSchedule);
    return schedule.isCompleted; // Use the new isCompleted flag

  } catch (error) {
    console.error('Error checking if project vesting is completed:', error);
    return false; // If any error occurs, treat as not completed
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
    amountReceived: '0',
    amountLeft: '0',
    lockPeriod: 'N/A',
    releaseInterval: 'N/A',
    releasePercentage: 0,
    beneficiary: 'N/A',
    hasVestingSchedule: false,
    loading: true
  };

  try {
    const selectedProject = await getProject(projectId);
    if (!selectedProject) {
      return { ...initialInfo, loading: false };
    }

    // If no vesting schedule ID is associated with the project, it means it was never created
    if (!selectedProject.vestingScheduleId) {
      return { ...initialInfo, loading: false, hasVestingSchedule: false };
    }

    const vestingScheduleIdNum = Number(selectedProject.vestingScheduleId);
    const currentMassaPeriod = await getCurrentMassaPeriod();

    const fetchedVestingSchedule = await getVestingSchedule(vestingScheduleIdNum);

    // If fetchedVestingSchedule is null, it means the schedule was not found
    if (!fetchedVestingSchedule) {
      return {
        ...initialInfo,
        loading: false,
        hasVestingSchedule: false,
        vestingStart: "Vesting schedule not found"
      };
    }

    // If vesting is completed, show final amounts
    if (fetchedVestingSchedule.isCompleted) {
      return {
        ...initialInfo,
        loading: false,
        hasVestingSchedule: true,
        vestingScheduleId: selectedProject.vestingScheduleId,
        vestingStart: "Vesting completed",
        nextRelease: "N/A",
        amountReceived: (fetchedVestingSchedule.amountClaimed / 1e9).toLocaleString(),
        amountLeft: "0",
        lockPeriod: formatPeriodsToHumanReadable(fetchedVestingSchedule.lockPeriod),
        releaseInterval: formatPeriodsToHumanReadable(fetchedVestingSchedule.releaseInterval),
        releasePercentage: fetchedVestingSchedule.releasePercentage,
        beneficiary: fetchedVestingSchedule.beneficiary
      };
    }

    const vestingStartPeriod = selectedProject.creationPeriod + Number(selectedProject.lockPeriod);
    const formatPeriodDifference = (targetPeriod: number, currentPeriod: number | null): string => {
      if (!currentPeriod) return 'N/A';
      const diff = targetPeriod - currentPeriod;
      if (diff <= 0) return 'Now';
      return formatPeriodsToHumanReadable(diff);
    };

    return {
      vestingScheduleId: selectedProject.vestingScheduleId,
      vestingStart: formatPeriodDifference(vestingStartPeriod, currentMassaPeriod),
      nextRelease: formatPeriodDifference(fetchedVestingSchedule.nextReleasePeriod, currentMassaPeriod),
      amountReceived: (fetchedVestingSchedule.amountClaimed / 1e9).toLocaleString(),
      amountLeft: ((fetchedVestingSchedule.totalAmount - fetchedVestingSchedule.amountClaimed) / 1e9).toLocaleString(),
      lockPeriod: formatPeriodsToHumanReadable(fetchedVestingSchedule.lockPeriod),
      releaseInterval: formatPeriodsToHumanReadable(fetchedVestingSchedule.releaseInterval),
      releasePercentage: fetchedVestingSchedule.releasePercentage,
      beneficiary: fetchedVestingSchedule.beneficiary,
      hasVestingSchedule: true,
      loading: false
    };

  } catch (error) {
    console.error('Error getting detailed vesting info:', error);
    return { ...initialInfo, loading: false };
  }
}