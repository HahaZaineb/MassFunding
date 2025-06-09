import { MASSA_NETWORK } from '@/configs/massa'
import { Args, CallSCOptions, JsonRpcPublicProvider, PublicProvider, SmartContract } from '@massalabs/massa-web3'

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