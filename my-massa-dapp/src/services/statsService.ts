import { CONTRACT_ADDRESS } from '@/configs/massa';
import { readSmartContractPublic } from '@/utils/smartContract';
import { Args } from '@massalabs/massa-web3';

export async function getTotalDonations(): Promise<number> {
  try {
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getTotalDonations',
      new Args(),
    );
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching total donations:', error);
    throw error;
  }
}

export async function getTotalProjectsFunded(): Promise<number> {
  try {
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getTotalProjectsFunded',
      new Args(),
    );
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching total projects funded:', error);
    throw error;
  }
}

export async function getTotalSupporters(): Promise<number> {
  try {
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getTotalSupporters',
      new Args(),
    );
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching total supporters:', error);
    throw error;
  }
}

export async function getUserDonations(
  userAddress: string,
): Promise<Array<{ projectId: string; amount: number }>> {
  try {
    const args = new Args().addString(userAddress);
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getUserDonations',
      args,
    );
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
