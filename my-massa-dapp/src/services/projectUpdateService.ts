import { callSmartContract, readSmartContractPublic } from '@/utils/smartContract';
import { CONTRACT_ADDRESS } from '@/configs/massa';
import { Args, MAX_GAS_CALL, parseMas } from '@massalabs/massa-web3';
import { ProjectUpdate } from '@/models/ContractModels';
import { ProjectUpdateData, ProjectUpdateInput } from '@/types/projectUpdate';

export async function addUpdate(
  connectedAccount: any,
  projectId: number,
  updateData: ProjectUpdateInput,
): Promise<void> {
  try {
    const args = new Args()
      .addU64(BigInt(projectId))
      .addString(updateData.title)
      .addString(updateData.content)
      .addString(updateData.image || '');
    const options = {
      maxGas: BigInt(MAX_GAS_CALL),
      //   coins: amount,
      fee: parseMas('0.01'),
    };
    const operationId = await callSmartContract(
      connectedAccount,
      CONTRACT_ADDRESS,
      'addProjectUpdate',
      args,
      options,
    );
    console.log(`Successfully added update for project ${projectId}.`);
    return operationId;
  } catch (error) {
    console.error('Error adding update:', error);
    throw error;
  }
}

export async function getProjectUpdates(projectId: number): Promise<ProjectUpdateData[]> {
  try {
    
    const args = new Args().addU64(BigInt(projectId));
    const response = await readSmartContractPublic(CONTRACT_ADDRESS, 'getProjectUpdates', args)
    const result = response.value;
    
    if (!result || result.length === 0) {
      console.log("No project data returned.", result);
      return [];
    }

    const arrArgs = new Args(result);
    const deserializedUpdates = arrArgs.nextSerializableObjectArray<ProjectUpdate>(ProjectUpdate);


    return deserializedUpdates.map(update => ({
      id: update.id.toString(),
      date: update.date,
      title: update.title,
      content: update.content,
      author: update.author,
      image: update.image,
    }));

  } catch (error) {
    console.error('Error fetching project updates:', error);
    throw error;
  }
}
