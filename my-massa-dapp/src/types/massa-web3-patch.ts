declare module "@massalabs/massa-web3" {
  // Add the missing CallSCParams interface property
  interface CallSCParams {
    caller?: string
  }

  // Add missing exports
  export class Args {
    constructor(data?: any, offset?: number)
    add(value: any): Args
    addString(value: string): Args
    addBool(value: boolean): Args
    addU64(value: bigint): Args
    nextU64(): any
    nextU8(): any
    nextString(): any
    nextBool(): any
    serialize(): any
    offset: number
  }

  export class Mas {
    static fromString(value: string): any
  }

  export enum OperationStatus {
    SpeculativeSuccess = "SpeculativeSuccess",
  }

  export class SmartContract {
    constructor(account: any, address: string)
    call(method: string, args: Args, options?: any): Promise<any>
    read(method: string, args: Args, options?: any): Promise<any>
  }

  export class Operation {
    toString(): string
    waitSpeculativeExecution(): Promise<OperationStatus>
    getSpeculativeEvents(): Promise<any[]>
  }

  export class Provider {
    address?: string // Add address property to Provider
    // Add minimal implementation
  }

  // Add Account interface that has address
  export interface Account {
    address: string
    provider: Provider
  }

  export class MRC20 {
    constructor(account: any, tokenAddress: string)
    increaseAllowance(spender: string, amount: bigint): Promise<Operation>
    // Add other MRC20 methods as needed
  }

  export function parseUnits(value: string, decimals: number): bigint
}
