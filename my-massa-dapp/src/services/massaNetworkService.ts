import { CONTRACT_ADDRESS } from '@/configs/massa';
import { readSmartContractPublic } from '@/utils/smartContract';
import { Args } from '@massalabs/massa-web3';

export async function getCurrentMassaPeriod(): Promise<number> {
  try {
    const response = await readSmartContractPublic(
      CONTRACT_ADDRESS,
      'getCurrentMassaPeriod',
      new Args(),
    );
    const argsReader = new Args(response.value);
    return Number(argsReader.nextU64());
  } catch (error) {
    console.error('Error fetching current Massa period:', error);
    throw error;
  }
}
