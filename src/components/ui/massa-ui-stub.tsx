"use client"

// This is a stub file to replace imports from @massalabs/react-ui-kit
// Add any components that might be imported from there

export const useAccountStore = () => {
  return {
    connectedAccount: null,
    connect: async () => {},
    disconnect: async () => {},
  }
}

export const WalletName = {
  MassaStation: "MassaStation",
  Bearby: "Bearby",
}

export const ConnectMassaWallet = ({ onConnect }: { onConnect?: (wallet: any) => void }) => {
  return (
    <button
      onClick={() => onConnect && onConnect({ address: "AU12...mock" })}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Connect Wallet (Mock)
    </button>
  )
}
