import { MASSA_NETWORK } from '@/configs/massa'
import { Args, CallSCOptions, JsonRpcPublicProvider, OperationStatus, PublicProvider, SmartContract } from '@massalabs/massa-web3'
import { OutputEvents } from '@massalabs/massa-web3/dist/esm/generated/client-types'

export const getPublicProviderByNetwork = (): PublicProvider => {
  switch (MASSA_NETWORK) {
    case 'mainnet':
      return JsonRpcPublicProvider.mainnet()
    case 'buildnet':
      return JsonRpcPublicProvider.buildnet()
    default:
      return JsonRpcPublicProvider.buildnet()
  }
}

export const readSmartContract = async (connectedAccount: any, contractAddress: string, functionName: string, args: Args, options: CallSCOptions = {}): Promise<any | null> => {

  if (!connectedAccount) {
    console.error('No connected account found')
    return null
  }
  const contract = new SmartContract(connectedAccount, contractAddress)
  const result = await contract.read(functionName, args, options)
  return result
}

// Reads using default public client
export const readSmartContractPublic = async (contractAddress: string, functionName: string, args: Args, options: CallSCOptions = {}): Promise<any | null> => {
  const provider = getPublicProviderByNetwork()
  const contract = new SmartContract(provider, contractAddress)
  const result = await contract.read(functionName, args, options)
  return result
}

export const callSmartContract = async (connectedAccount : any, contractAddress: string, functionName: string, args: Args, options: CallSCOptions = {}): Promise<any | null> => {
  try {

    if (!connectedAccount) {
      throw new Error('You are not connected')
    }

    const contract = new SmartContract(connectedAccount, contractAddress)
    const operation = await contract.call(functionName, args, options)
    if (!operation) {
      throw new Error('The transaction was not found. Possible reasons: insufficient balance, network delay, or invalid transaction. Please try again.')
    }

    const speculativeStatus = await operation.waitSpeculativeExecution(120000, 500)
    if(speculativeStatus === OperationStatus.NotFound) {
      throw new Error('The transaction was not found. Possible reasons: insufficient balance, network delay, or invalid transaction. Please try again.');
    }

    if(speculativeStatus === OperationStatus.SpeculativeError){
      const speculativeEvents = await operation.getSpeculativeEvents();
      parseMassaExecutionErrors(speculativeEvents)
    }
    return operation.id
  } catch (e: any) {
    console.log('error callSmartContract', e)
    throw e
  }
}

export function parseMassaExecutionErrors(events: OutputEvents): void {
  for (const event of events) {
    const parsed = JSON.parse(event.data)

    if (parsed?.massa_execution_error) {
      const message: string = parsed.massa_execution_error
      if (message.includes('insufficient balance')) {
        throw new Error('Your account has insufficient balance to complete this transfer.')
      }
      if (message.includes('does not exist')) {
        throw new Error('The smart contract you are trying to interact with does not exist.')
      }
      throw new Error(message)
    }
  }
  throw new Error('An Unknow Error Occured, Please try again')
}