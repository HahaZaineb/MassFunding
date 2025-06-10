import { Project } from "@/models/ContractModels";
import { ProjectData } from "@/types";
import { formatMas } from '@massalabs/massa-web3'
import { getProjectSupportersCount } from "@/services/contract-service";

export async function convertProjectToProjectData(project: Project): Promise<ProjectData> {
  const supportersCount = await getProjectSupportersCount(project.projectId);

  return {
    id: project.projectId.toString(),
    creator: project.creator,
    name: project.title,
    description: project.description,
    goalAmount: Number(formatMas(project.fundingGoal)),
    amountRaised: Number(formatMas(project.amountRaised)),
    beneficiary: project.beneficiary,
    category: project.category,
    lockPeriod: (Number(project.lockPeriod) / 5760).toString(),
    releaseInterval: (Number(project.releaseInterval) / 5760).toString(),
    releasePercentage: Number(project.releasePercentage),
    image: project.image,
    // Default values for properties not directly from contract or not needed from contract
    amountNeeded: Number(formatMas(project.fundingGoal - project.amountRaised)),
    supporters: supportersCount,
    deadline: "N/A", // This would ideally come from contract or be calculated dynamically
    // Removed updates and milestones as they are now fetched separately
    updates: [], // Initialize empty, will be populated by separate fetches
    milestones: [], // Initialize empty, will be populated by separate fetches
  };
}