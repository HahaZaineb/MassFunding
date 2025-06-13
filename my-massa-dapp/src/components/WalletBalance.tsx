import { formatMas } from '@massalabs/massa-web3';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';
import { useEffect, useState } from 'react';
interface WalletBalanceProps {
    setWalletBalance: (e: any) => void
}
const WalletBalance :React.FC<WalletBalanceProps>= ({setWalletBalance}) => {
  const { connectedAccount } = useAccountStore();

  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (connectedAccount) {
        try {
          const result = await connectedAccount.balance(false);
          setBalance(Number(formatMas(result)));
          setWalletBalance(Number(formatMas(result)));
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    fetchBalance();
  }, [connectedAccount]);

  return (
    <>
      {balance !== null ? (
        <span className="text-sm text-slate-400">
          Balance: <span className="text-white">{balance} MAS</span>
        </span>
      ) : (
        <></>
      )}
    </>
  );
};

export default WalletBalance;
