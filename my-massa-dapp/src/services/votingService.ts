import { CONTRACT_ADDRESS } from '@/configs/massa';
import { readSmartContractPublic, callSmartContract } from '@/utils/smartContract';
import { Args, bytesToSerializableObjectArray, DeserializedResult } from '@massalabs/massa-web3';
import { getCurrentMassaPeriod } from './massaNetworkService';
import { Vote, VotingProgress, VotingSession, Supporter } from '@/types/voting';

/**
 * Data class for serializing/deserializing voting session data from the smart contract.
 * Represents the current state of a voting session for a vesting schedule release.
 */
class VotingSessionData {
  constructor(
    public isActive: boolean = false,      // Whether the voting session is currently active
    public startPeriod: bigint = 0n,       // The period when voting started
    public endPeriod: bigint = 0n,         // The period when voting ends
    public totalVotingPower: bigint = 0n,  // Total voting power of all eligible voters
    public continueVotes: bigint = 0n,     // Total voting power for continuing the release
    public stopVotes: bigint = 0n          // Total voting power for stopping the release
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addBool(this.isActive)
      .addU64(this.startPeriod)
      .addU64(this.endPeriod)
      .addU64(this.totalVotingPower)
      .addU64(this.continueVotes)
      .addU64(this.stopVotes);
    return args.serialize();
  }

  deserialize(data: Uint8Array, offset:number): DeserializedResult<VotingSessionData> {
    const args = new Args(data, offset);
    this.isActive = args.nextBool();
    this.startPeriod = args.nextU64();
    this.endPeriod = args.nextU64();
    this.totalVotingPower = args.nextU64();
    this.continueVotes = args.nextU64();
    this.stopVotes = args.nextU64();
    return { instance: this, offset: args.getOffset() };
  }
}

/**
 * Data class for serializing/deserializing individual vote data from the smart contract.
 * Represents a single voter's decision in a voting session.
 */
class VoteData {
  constructor(
    public voter: string = '',             // Address of the voter
    public votingPower: bigint = 0n,       // Amount of tokens donated (voting power)
    public vote: boolean = false           // true = continue release, false = stop release
  ) {}

  serialize(): Uint8Array {
    return new Args()
      .addString(this.voter)
      .addU64(this.votingPower)
      .addBool(this.vote)
      .serialize();
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<VoteData> {
    const args = new Args(data, offset);
    this.voter = args.nextString();
    this.votingPower = args.nextU64();
    this.vote = args.nextBool();
    return { instance: this, offset: args.getOffset() };
  }
}

/**
 * Retrieves the current voting session for a vesting schedule.
 * @param vestingId - The ID of the vesting schedule
 * @returns The voting session data or null if no active session
 */
export async function getVotingSession(vestingId: string | null | undefined): Promise<VotingSession | null> {
  if (!vestingId) return null;
  try {
    const args = new Args().addU64(BigInt(vestingId));
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getVotingSession',
      args,
    );

    if (!response.value || response.value.length === 0) {
      return null;
    }

    const [session] = bytesToSerializableObjectArray(response.value, VotingSessionData);
    return {
      isActive: session.isActive,
      startPeriod: Number(session.startPeriod),
      endPeriod: Number(session.endPeriod),
      totalVotingPower: Number(session.totalVotingPower),
      continueVotes: Number(session.continueVotes),
      stopVotes: Number(session.stopVotes)
    };
  } catch (error) {
    console.error('Error fetching voting session:', error);
    return null;
  }
}

/**
 * Retrieves all votes cast in a voting session.
 * @param vestingId - The ID of the vesting schedule
 * @returns Array of votes cast in the session
 */
export async function getVotes(vestingId: string | null | undefined): Promise<Vote[]> {
  if (!vestingId) return [];
  try {
    const args = new Args().addU64(BigInt(vestingId));
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getVotes',
      args,
    );

    if (!response.value || response.value.length === 0) {
      return [];
    }

    const votes = bytesToSerializableObjectArray(response.value, VoteData);
    return votes.map(vote => ({
      voter: vote.voter,
      votingPower: Number(vote.votingPower),
      vote: vote.vote
    }));
  } catch (error) {
    console.error('Error fetching votes:', error);
    return [];
  }
}

/**
 * Submits a vote for or against releasing the next batch of tokens.
 * @param connectedAccount - The connected wallet account
 * @param vestingId - The ID of the vesting schedule
 * @param vote - true to continue release, false to stop release
 * @returns Transaction hash
 */
export async function voteOnRelease(connectedAccount: any, vestingId: string | null | undefined, vote: boolean): Promise<string> {
  if (!vestingId) throw new Error('Invalid vesting ID');
  const args = new Args()
    .addU64(BigInt(vestingId))
    .addBool(vote);

  return await callSmartContract(
    connectedAccount,
    CONTRACT_ADDRESS,
    'voteOnRelease',
    args,
    {
      fee: 100_000_000n,
      maxGas: 100_000_000n
    }
  );
}

/**
 * Retrieves all supporters (donors) for a project with their donation amounts.
 * @param projectId - The ID of the project
 * @returns Array of supporters with their addresses and donation amounts
 */
export async function getProjectSupporters(projectId: string): Promise<Supporter[]> {
  try {
    const args = new Args().addU64(BigInt(projectId));
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getProjectSupporters',
      args,
    );

    if (!response.value || response.value.length === 0) {
      return [];
    }

    const supportersReader = new Args(response.value);
    const length = Number(supportersReader.nextU64());
    const supporters: Supporter[] = [];

    for (let i = 0; i < length; i++) {
      supporters.push({
        address: supportersReader.nextString(),
        amount: Number(supportersReader.nextU64()) / 1e9 // Convert to MAS
      });
    }

    return supporters;
  } catch (error) {
    console.error('Error fetching project supporters:', error);
    return [];
  }
}

/**
 * Gets the donation amount for a specific supporter of a project.
 * @param projectId - The ID of the project
 * @param supporterAddress - The address of the supporter
 * @returns The amount donated by the supporter in MAS
 */
export async function getSupporterDonationAmount(projectId: string, supporterAddress: string): Promise<number> {
  try {
    const args = new Args()
      .addU64(BigInt(projectId))
      .addString(supporterAddress);
    
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getSupporterDonationAmount',
      args,
    );

    return Number(new Args(response.value).nextU64()) / 1e9; // Convert to MAS
  } catch (error) {
    console.error('Error fetching supporter donation amount:', error);
    return 0;
  }
}

/**
 * Calculates the current voting progress for a session.
 * @param session - The voting session data
 * @returns Object containing voting statistics and percentages
 */
export function calculateVotingProgress(session: VotingSession): VotingProgress {
  const total = session.continueVotes + session.stopVotes;
  if (total === 0) {
    return {
      continuePercentage: 0,
      stopPercentage: 0,
      totalVotes: 0,
      totalVotingPower: session.totalVotingPower
    };
  }

  return {
    continuePercentage: (session.continueVotes * 100) / total,
    stopPercentage: (session.stopVotes * 100) / total,
    totalVotes: total,
    totalVotingPower: session.totalVotingPower
  };
}

/**
 * Checks if a voting session is currently active.
 * A session is active if it's marked as active and hasn't reached its end period.
 * @param session - The voting session data
 * @returns true if the session is active, false otherwise
 */
export async function isVotingSessionActive(session: VotingSession): Promise<boolean> {
  const currentPeriod = await getCurrentMassaPeriod();
  return session.isActive && currentPeriod <= session.endPeriod;
}

/**
 * Converts a Massa period number to a human-readable date string.
 * @param period - The Massa period number
 * @returns Formatted date string
 */
export function formatPeriodToDate(period: number): string {
  const date = new Date(period * 16 * 1000); // 1 period = 16 seconds
  return date.toLocaleString();
} 