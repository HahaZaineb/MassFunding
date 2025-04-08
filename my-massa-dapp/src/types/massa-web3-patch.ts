// Extend the CallSCParams interface
declare module "@massalabs/massa-web3" {
    interface CallSCParams {
      caller?: string // Add the missing caller property
    }
  }
  