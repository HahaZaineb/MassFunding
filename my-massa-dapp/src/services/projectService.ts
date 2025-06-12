import { CONTRACT_ADDRESS } from '@/configs/massa';
import { Project } from '@/models/Project';
import { VestingSchedule } from '@/models/VestingSchedule';
import { ProjectData } from '@/types/project';
import { parseDurationToPeriods } from '@/utils/functions';
import { convertProjectToProjectData } from '@/utils/project';
import {
  callSmartContract,
  readSmartContractPublic,
} from '@/utils/smartContract';
import {
  Args,
  bytesToSerializableObjectArray,
  MAX_GAS_CALL,
  parseMas,
} from '@massalabs/massa-web3';
import { getVestingSchedule } from './vestingScheduleService';

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
  },
) {
  try {
    const lockPeriodInPeriods = parseDurationToPeriods(projectData.lockPeriod);
    const releaseIntervalInPeriods = parseDurationToPeriods(
      projectData.releaseInterval,
    );

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

    const options = {
      maxGas: BigInt(MAX_GAS_CALL),
      coins: parseMas('20'),
      fee: parseMas('0.01'),
    };
    const operationId = await callSmartContract(
      connectedAccount,
      CONTRACT_ADDRESS,
      'createProject',
      args,
      options,
    );
    return operationId;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function fundProject(
  connectedAccount: any,
  projectId: number,
  amount: bigint,
): Promise<void> {
  try {
    const args = new Args().addU64(BigInt(projectId));
    const options = {
      maxGas: BigInt(MAX_GAS_CALL),
      coins: amount,
      fee: parseMas('0.01'),
    };
    const operationId = await callSmartContract(
      connectedAccount,
      CONTRACT_ADDRESS,
      'fundProject',
      args,
      options,
    );
    return operationId;
  } catch (error) {
    console.error('Error funding project:', error);
    throw error;
  }
}

export async function getProject(projectId: number): Promise<ProjectData> {
  try {
    const args = new Args().addU64(BigInt(projectId));
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getProject',
      args,
    );
    const [project] = bytesToSerializableObjectArray(response.value, Project);

    return convertProjectToProjectData(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

export async function getAllProjects(): Promise<ProjectData[]> {
  try {
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getAllProjects',
      new Args(),
    );
    const result = response.value;

    if (!result || result.length === 0) {
      console.log('No project data returned.', result);
      return [];
    }
    const arrArgs = new Args(result);
    const deserializedProjects =
      arrArgs.nextSerializableObjectArray<Project>(Project);

    // Convert deserialized Project objects to ProjectData objects
    const projectDataPromises = deserializedProjects.map((project) =>
      convertProjectToProjectData(project),
    );
    return Promise.all(projectDataPromises);
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

// Returns true if the vesting for the project is completed
export async function isProjectVestingCompleted(
  projectId: number,
): Promise<boolean> {
  try {
    // 1. Fetch the project
    const args = new Args().addU64(BigInt(projectId));
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getProject',
      args,
    );

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
    const vestingResponse = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getVestingSchedule',
      vestingArgs,
    );
    if (!vestingResponse.value || vestingResponse.value.length === 0) {
      // If the vesting schedule does not exist, it is completed
      return true;
    }

    // Parse the vesting schedule
    const [schedule] = bytesToSerializableObjectArray(
      vestingResponse.value,
      VestingSchedule,
    );

    // 4. Check if all funds have been claimed
    return Number(schedule.amountClaimed) >= Number(schedule.totalAmount);
  } catch (error) {
    // If any error occurs (e.g., vesting schedule not found), treat as completed
    return true;
  }
}

export async function getProjectSupportersCount(
  projectId: bigint,
): Promise<number> {
  try {
    const args = new Args().addU64(projectId);
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getProjectSupportersCount',
      args,
    );
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching project supporters count:', error);
    throw error;
  }
}

export const getProjectStatus = async (
  project: ProjectData,
): Promise<'live' | 'release' | 'completed'> => {
  const isLocked = project.creationDate
    ? checkIfLocked(project)
    : true;

  const vesting = await getVestingSchedule(Number(project.vestingScheduleId))
  if (vesting?.isCompleted) return 'completed';
  if (!isLocked) return 'release';
  if (project.amountRaised >= project.goalAmount) return 'release';

  return 'live';
};

export const checkIfLocked = (project: ProjectData): boolean => {
  if (project.creationDate) {
    const createdAt = new Date(project.creationDate);
    const lockPeriod = project.lockPeriod * 15;
    const now = new Date();
    const lockEndDate = new Date(createdAt.getTime() + lockPeriod * 1000);
    return now < lockEndDate;
  } else {
    return true;
  }
};
