import { CONTRACT_ADDRESS } from '@/configs/massa';
import { VestingSchedule } from '@/models/ContractModels';
import { readSmartContractPublic } from '@/utils/smartContract';
import { Args } from '@massalabs/massa-web3';
import { getProject } from './projectService';
import { formatPeriodsToHumanReadable } from '@/utils/functions';
import { getCurrentMassaPeriod } from './massaNetworkService';
import { DetailedVestingInfo, VestingScheduleData } from '@/types/vestingSchedule';

export async function getVestingSchedule(
  vestingId: number,
): Promise<VestingScheduleData | null> {
  try {
    const args = new Args().addU64(BigInt(vestingId));
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getVestingSchedule',
      args,
    );

    // IMPORTANT: If the contract returns an empty array for a non-existent schedule (e.g., completed and removed),
    // we should treat this as "not found".
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
    };
  } catch (error) {
    return null; // Return null on any error during fetch or processing
  }
}

export async function getUserVestingSchedules(
  userAddress: string,
): Promise<number[]> {
  try {
    const args = new Args().addString(userAddress);
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getUserVestingSchedules',
      args,
    );
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

/**
 * Fetches and formats detailed vesting schedule information for a given project.
 * This function combines data from multiple contract getters and formats it for display.
 *
 * @param projectId The ID of the project to fetch vesting details for.
 * @returns A promise that resolves to a DetailedVestingInfo object, or null if no vesting schedule exists.
 */
export async function getDetailedVestingInfo(
  projectId: number,
): Promise<DetailedVestingInfo> {
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
    const selectedProject = await getProject(projectId);

    // If no vesting schedule ID is associated with the project, it means it was never created or is 0.
    // We will still attempt to fetch it, as 0 could be a valid ID for a re-used schedule.
    if (!selectedProject.vestingScheduleId) {
      return { ...initialInfo, loading: false, hasVestingSchedule: false };
    }

    const vestingScheduleIdNum = Number(selectedProject.vestingScheduleId);

    const [fetchedVestingSchedule, currentPeriod] = await Promise.all([
      getVestingSchedule(vestingScheduleIdNum),
      getCurrentMassaPeriod(),
    ]);

    // If fetchedVestingSchedule is null, it means the schedule was not found (e.g., completed and removed)
    if (!fetchedVestingSchedule) {
      // If vesting is completed, amountReceived should be totalAmountRaisedAtLockEnd and amountLeft should be 0
      const totalAmount =
        Number(selectedProject.totalAmountRaisedAtLockEnd) / 1e9;
      return {
        ...initialInfo,
        loading: false,
        hasVestingSchedule: false,
        vestingStart: 'Vesting completed', // More precise message
        nextRelease: 'N/A',
        amountReceived: totalAmount.toLocaleString(), // Display the total amount received
        amountLeft: '0', // Amount left is 0
        lockPeriod: formatPeriodsToHumanReadable(
          Number(selectedProject.lockPeriod),
        ),
        releaseInterval: formatPeriodsToHumanReadable(
          Number(selectedProject.releaseInterval),
        ),
        releasePercentage: selectedProject.releasePercentage,
        beneficiary: selectedProject.beneficiary,
      };
    }

    const formatPeriodDifference = (
      targetPeriod: number,
      currentPeriod: number | null,
    ): string => {
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

    const vestingStartPeriod =
      selectedProject.creationPeriod + Number(selectedProject.lockPeriod);

    return {
      vestingScheduleId: selectedProject.vestingScheduleId,
      vestingStart: formatPeriodDifference(vestingStartPeriod, currentPeriod),
      nextRelease: formatPeriodDifference(
        fetchedVestingSchedule.nextReleasePeriod,
        currentPeriod,
      ),
      amountReceived: (
        fetchedVestingSchedule.amountClaimed / 1e9
      ).toLocaleString(),
      amountLeft: (
        (fetchedVestingSchedule.totalAmount -
          fetchedVestingSchedule.amountClaimed) /
        1e9
      ).toLocaleString(),
      lockPeriod: formatPeriodsToHumanReadable(
        Number(selectedProject.lockPeriod),
      ), // Format lock period
      releaseInterval: formatPeriodsToHumanReadable(
        Number(selectedProject.releaseInterval),
      ), // Format release interval
      releasePercentage: selectedProject.releasePercentage,
      beneficiary: selectedProject.beneficiary,
      hasVestingSchedule: true,
      loading: false,
    };
  } catch (error) {
    console.error('Error getting detailed vesting info:', error);
    return { ...initialInfo, loading: false };
  }
}
