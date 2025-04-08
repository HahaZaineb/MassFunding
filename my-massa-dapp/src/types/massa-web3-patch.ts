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
      // Add minimal implementation
    }
  }
  