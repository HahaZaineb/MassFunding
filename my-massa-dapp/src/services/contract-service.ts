import { SmartContract, Args, Mas, OperationStatus } from '@massalabs/massa-web3';
import type { Account } from '@massalabs/massa-web3';
import type { ProjectData } from '../types';

const PROJECT_MANAGER_ADDRESS = "AS12nQuAomjzJiQHdB9XuGps9d7esxUTzPFsLrFVt3STP4GysWv5Y";

export class ContractService {
  private static instance: ContractService;
  private contract: SmartContract | null = null;


  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  public initializeContract(account: Account) {
    this.contract = new SmartContract(account, PROJECT_MANAGER_ADDRESS);
  }

  public async createProject(
    connectedAccount: any,
    projectData: {
      title: string;
      description: string;
      fundingGoal: number;
      beneficiary: string;
      category: string;
      lockPeriod: number;
      releaseInterval: number;
      releasePercentage: number;
      image: string;
    }
  ): Promise<string> {
    if (!connectedAccount) {
      throw new Error("Wallet not connected");
    }
    
    const contract = new SmartContract(connectedAccount, PROJECT_MANAGER_ADDRESS);

    const args = new Args()
      .addString(projectData.title)
      .addString(projectData.description)
      .addU64(BigInt(projectData.fundingGoal))
      .addString(projectData.beneficiary)
      .addString(projectData.category)
      .addU64(BigInt(projectData.lockPeriod))
      .addU64(BigInt(projectData.releaseInterval))
      .addU64(BigInt(projectData.releasePercentage))
      .addString(projectData.image);

    const response = await contract.call('createProject', args);
    console.log('Transaction response:', response);
    const status = await response.waitSpeculativeExecution();
    console.log('Transaction status:', status);
    if (status === OperationStatus.SpeculativeSuccess) {
      const events = await response.getSpeculativeEvents();
      // Extract project ID from events
      const projectId = events[0].data.split('ID: ')[1].split(' ')[0];
      return projectId;
    }

    throw new Error('Failed to create project');
  }

  public async fundProject(
    connectedAccount: any,
    projectId: string,
    amount: number
  ): Promise<void> {
    if (!connectedAccount) {
      throw new Error("Wallet not connected");
    }

    const contract = new SmartContract(connectedAccount, PROJECT_MANAGER_ADDRESS);

    const args = new Args().addU64(BigInt(projectId));
    const response = await contract.call('fundProject', args, {
      coins: Mas.fromString(amount.toString()),
    });

    const status = await response.waitSpeculativeExecution();
    if (status !== OperationStatus.SpeculativeSuccess) {
      throw new Error('Failed to fund project');
    }
  }

  public async addUpdate(
    connectedAccount: any,
    projectId: string,
    updateMessage: string
  ): Promise<void> {
    if (!connectedAccount) {
      throw new Error("Wallet not connected");
    }

    const contract = new SmartContract(connectedAccount, PROJECT_MANAGER_ADDRESS);

    const args = new Args()
      .addU64(BigInt(projectId))
      .addString(updateMessage);

    const response = await contract.call('addUpdate', args);
    const status = await response.waitSpeculativeExecution();

    if (status !== OperationStatus.SpeculativeSuccess) {
      throw new Error('Failed to add update');
    }
  }

  public async getProject(connectedAccount: any, projectId: string): Promise<ProjectData> {
    if (!connectedAccount) {
      throw new Error("Wallet not connected");
    }

    const contract = new SmartContract(connectedAccount, PROJECT_MANAGER_ADDRESS);

    const args = new Args().addU64(BigInt(projectId));
    const response = await contract.read('getProject', args);
    console.log('Transaction response:', response);

    
    const projectArgs = new Args(response.value);
    return {
      id: projectId,
      name: projectArgs.nextString(),
      description: projectArgs.nextString(),
      amountNeeded: Number(projectArgs.nextU64()),
      amountRaised: Number(projectArgs.nextU64()),
      goalAmount: Number(projectArgs.nextU64()),
      beneficiary: projectArgs.nextString(),
      category: projectArgs.nextString(),
      lockPeriod: projectArgs.nextU64().toString(),
      releaseInterval: projectArgs.nextU64().toString(),
      releasePercentage: Number(projectArgs.nextU64()),
      image: projectArgs.nextString(),
      creator: projectArgs.nextString(),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 30 days
      supporters: 0, // This would need to be tracked separately
      updates: [], // Updates would need to be fetched separately
      milestones: [], // Milestones would need to be fetched separately
    };
  }

  public async getAllProjects(connectedAccount: any): Promise<ProjectData[]> {
    if (!connectedAccount) {
      throw new Error("Wallet not connected");
    }

    const contract = new SmartContract(connectedAccount, PROJECT_MANAGER_ADDRESS);

    const response = await contract.read('getAllProjects', new Args());
    const result = response.value;

    if (!result || result.length === 0) {
      return [];
    }

    const projectsArgs = new Args(result);
    const projectsCount = Number(projectsArgs.nextU64());
    const projects: ProjectData[] = [];

    for (let i = 0; i < projectsCount; i++) {
      const projectId = projectsArgs.nextU64();
      const creator = projectsArgs.nextString();
      const title = projectsArgs.nextString();
      const description = projectsArgs.nextString();
      const fundingGoal = Number(projectsArgs.nextU64());
      const amountRaised = Number(projectsArgs.nextU64());
      const beneficiary = projectsArgs.nextString();
      const category = projectsArgs.nextString();
      const lockPeriod = projectsArgs.nextU64();
      const releaseInterval = projectsArgs.nextU64();
      const releasePercentage = Number(projectsArgs.nextU64());
      const image = projectsArgs.nextString();
      const creationPeriod = projectsArgs.nextU64();
      const vestingScheduleId = projectsArgs.nextU64();
      const initialVestingTriggered = projectsArgs;

      projects.push({
        id: projectId,
        name: title,
        description: description,
        amountNeeded: fundingGoal,
        goalAmount: fundingGoal,
        amountRaised: amountRaised,
        beneficiary: beneficiary,
        category: category,
        lockPeriod: lockPeriod,
        releaseInterval: releaseInterval,
        releasePercentage: releasePercentage,
        supporters: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        creator: creator,
        image: image,
        updates: [],
        milestones: [],
      });
    }

    return projects;
  }

  public async getProjectUpdates(connectedAccount: any, projectId: string): Promise<string[]> {
    if (!connectedAccount) {
      throw new Error("Wallet not connected");
    }

    const contract = new SmartContract(connectedAccount, PROJECT_MANAGER_ADDRESS);

    const args = new Args().addU64(BigInt(projectId));
    const response = await contract.read('getProjectUpdates', args);
    const result = response.value;

    if (!result || result.length === 0) {
      return [];
    }

    const updatesArgs = new Args(result);
    const updatesCount = Number(updatesArgs.nextU64().expect('Failed to deserialize updates count'));
    const updates: string[] = [];

    for (let i = 0; i < updatesCount; i++) {
      const update = updatesArgs.nextString().expect('Failed to deserialize update string');
      updates.push(update);
    }

    return updates;
  }
} 