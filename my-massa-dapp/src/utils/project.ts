import { Project } from "@/models/Project";
import { getProjectSupportersCount } from "@/services/projectService";
import { ProjectData } from '@/types/project';
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