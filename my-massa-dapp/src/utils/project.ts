import { Project } from "@/models/Project";
import { getCurrentMassaPeriod } from "@/services/massaNetworkService";
import { getProjectSupportersCount } from "@/services/projectService";
import { getVestingSchedule } from "@/services/vestingScheduleService";
import { ProjectData } from '@/types/project';
import { VestingScheduleData } from "@/types/vestingSchedule";
import { formatMas } from '@massalabs/massa-web3'

export async function convertProjectToProjectData(project: Project): Promise<ProjectData> {
  const supportersCount = await getProjectSupportersCount(project.projectId);
  const creationDate =  getProjectCreationDate(Number(project.creationPeriod));

  return {
    id: project.projectId.toString(),
    creator: project.creator,
    name: project.title,
    description: project.description,
    goalAmount: Number(formatMas(project.fundingGoal)),
    amountRaised: Number(formatMas(project.amountRaised)),
    beneficiary: project.beneficiary,
    category: project.category,
    lockPeriod: Number(project.lockPeriod),
    releaseInterval: Number(project.releaseInterval),
    releasePercentage: Number(project.releasePercentage),
    image: project.image,
    creationPeriod: Number(project.creationPeriod),
    vestingScheduleId: project.vestingScheduleId.toString(),
    initialVestingTriggered: project.initialVestingTriggered,
    amountNeeded: Number(formatMas(project.fundingGoal - project.amountRaised)),
    supporters: supportersCount,
    deadline: "N/A", // This would ideally come from contract or be calculated dynamically
    creationDate: creationDate.toISOString(), // Store as ISO string to preserve time
    // Removed updates and milestones as they are now fetched separately
    updates: [], // Initialize empty, will be populated by separate fetches
    milestones: [], // Initialize empty, will be populated by separate fetches
    totalAmountRaisedAtLockEnd: Number(project.totalAmountRaisedAtLockEnd),
  } as ProjectData;
}

export function getProjectCreationDate(creationPeriod: number): Date {
  const MASSA_GENESIS_TIMESTAMP_MS = 1704289800000; // Wednesday, January 3, 2024 1:50:00 PM UTC (BuildNet)
  const MASSA_PERIOD_DURATION_MS = 16 * 1000; // 16 seconds per period
  const creationTimestampMs = MASSA_GENESIS_TIMESTAMP_MS + (creationPeriod * MASSA_PERIOD_DURATION_MS);

  return new Date(creationTimestampMs);
}

const MASSA_PERIOD_MS = 16 * 1000;
const MASSA_PERIOD_SEC = 16;

function formatTimeLeft(seconds: number): string {
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds / (60 * 60)) % 24);
  const minutes = Math.floor((seconds / 60) % 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

interface CalculatedProjectDetails {
  createdDate: Date | null;
  lockDate: Date | null;
  nextReleaseDate: Date | null;
  projectStatus: 'live' | 'release' | 'completed' | '';
  vestingDetails: VestingScheduleData | null;
  firstReleaseDate: Date | null;
  lastReleaseDate: Date | null;
  totalReleases: number;
  timeLeft: string;
}

export const calculateProjectDetails = async (
  project: ProjectData,
): Promise<CalculatedProjectDetails> => {
  const createdDate = project.creationDate
    ? new Date(new Date(project.creationDate).getTime() + 2 * 60 * 1000)
    : null;

  const lockPeriod = Number(project.lockPeriod); // in periods
  const lockDate = createdDate
    ? new Date(createdDate.getTime() + lockPeriod * MASSA_PERIOD_MS)
    : null;

  const vestingDetails = project.vestingScheduleId
    ? await getVestingSchedule(Number(project.vestingScheduleId))
    : null;

  let totalReleases = 0;
  let firstReleaseDate: Date | null = null;
  let lastReleaseDate: Date | null = null;
  let nextReleaseDate: Date | null = lockDate;
  let projectStatus: 'live' | 'release' | 'completed' | '' = '';

  // --- Lock status check ---
  const isLocked = (): boolean => {
    if (!project.creationDate) return true;
    const baseCreatedAt = new Date(project.creationDate);
    const createdAtWithOffset = new Date(baseCreatedAt.getTime() + 2 * 60 * 1000);
    const lockEnd = new Date(createdAtWithOffset.getTime() + project.lockPeriod * MASSA_PERIOD_SEC * 1000);
    return new Date() < lockEnd;
  };

  const isFundingComplete = project.amountRaised >= project.goalAmount;

  if (vestingDetails && createdDate && lockDate) {
    const amountPerRelease = (vestingDetails.totalAmount * project.releasePercentage) / 100;
    const claimedReleases = Math.floor(vestingDetails.amountClaimed / amountPerRelease);
    const intervalMs = project.releaseInterval * MASSA_PERIOD_MS;

    nextReleaseDate = new Date(lockDate.getTime() + (claimedReleases + 1) * intervalMs);
    firstReleaseDate = lockDate;
    totalReleases = project.amountRaised > 0 ? Math.floor(vestingDetails.totalAmount / amountPerRelease) : 0;
    lastReleaseDate = new Date(lockDate.getTime() + (totalReleases - 1) * intervalMs);

    const now = new Date();
    const isCompleted = totalReleases > 0 ? vestingDetails.isCompleted && now >= lastReleaseDate : vestingDetails.isCompleted;
    const hasClaimed = project.amountRaised > 0 ? vestingDetails.amountClaimed > 0 : true;

    if (isCompleted && hasClaimed) {
      projectStatus = 'completed';
    } else if (!isLocked()) {
      projectStatus = 'release';
    } else {
      projectStatus = 'live';
    }
  } else {
    if (!isLocked()) {
      projectStatus = 'release';
    } else if (isFundingComplete) {
      projectStatus = 'release';
    } else {
      projectStatus = 'live';
    }
  }

  // --- Time left calculation for live projects ---
  let timeLeft = '';
  if (projectStatus === 'live') {
    const createdAtPeriod = project.creationPeriod;
    const lockEndPeriod = createdAtPeriod + lockPeriod;

    try {
      const currentPeriod = await getCurrentMassaPeriod();
      const remainingPeriods = lockEndPeriod - currentPeriod;

      if (remainingPeriods <= 0) {
        timeLeft = 'Lock period ended';
      } else {
        timeLeft = formatTimeLeft(remainingPeriods * MASSA_PERIOD_SEC);
      }
    } catch (e) {
      console.error('Failed to fetch current Massa period:', e);
      timeLeft = '';
    }
  }

  return {
    createdDate,
    lockDate,
    nextReleaseDate,
    projectStatus,
    vestingDetails,
    firstReleaseDate,
    lastReleaseDate,
    totalReleases,
    timeLeft,
  };
};
