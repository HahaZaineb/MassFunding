import { Project } from "@/models/ContractModels";
import { ProjectData } from "@/types";
import { formatMas } from '@massalabs/massa-web3'

export function convertProjectToProjectData(project: Project): ProjectData {
  return {
    id: project.projectId.toString(),
    creator: project.creator,
    name: project.title,
    description: project.description,
    goalAmount: formatMas(project.fundingGoal),
    amountRaised: formatMas(project.amountRaised),
    beneficiary: project.beneficiary,
    category: project.category,
    lockPeriod: project.lockPeriod.toString(),
    releaseInterval: project.releaseInterval.toString(),
    releasePercentage: Number(project.releasePercentage),
    image: project.image,
    // Default values for properties not directly from contract or not needed from contract
    amountNeeded: formatMas(project.fundingGoal - project.amountRaised),
    supporters: 0, // This would ideally come from contract or be calculated dynamically
    deadline: "N/A", // This would ideally come from contract or be calculated dynamically
    // Removed updates and milestones as they are now fetched separately
    updates: [], // Initialize empty, will be populated by separate fetches
    milestones: [], // Initialize empty, will be populated by separate fetches
  };
}