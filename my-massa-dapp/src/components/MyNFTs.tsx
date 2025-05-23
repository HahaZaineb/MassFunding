import { useAccountStore } from "@massalabs/react-ui-kit";
import { useEffect, useState } from "react";
import type { NFTMetadata, ProjectData } from "./types";
import { NFTPreview } from "./nft-preview";

export function MyNFTs() {
  const { connectedAccount } = useAccountStore();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFTMetadata | null>(null);

  useEffect(() => {
    if (!connectedAccount) return;
    // TODO: Replace with actual fetch from blockchain or backend
    setNfts([
      {
        projectId: "1",
        projectName: "Sample Project",
        donationAmount: 10,
        donationDate: "2024-05-23",
        donorAddress: connectedAccount.toString(),
        category: "Tech"
      }
    ]);
  }, [connectedAccount]);

  if (!connectedAccount) {
    return <div className="text-center text-slate-400">Connect your wallet to view your NFTs.</div>;
  }

  if (selectedNFT) {
    // Mock project data for preview
    const project: ProjectData = {
      id: selectedNFT.projectId,
      name: selectedNFT.projectName,
      description: "Project description here",
      category: selectedNFT.category,
      goalAmount: 100,
      amountRaised: 10,
      deadline: "2024-12-31",
      supporters: 1,
      creator: selectedNFT.donorAddress,
    };
    return (
      <NFTPreview
        projectId={selectedNFT.projectId}
        amount={selectedNFT.donationAmount.toString()}
        nftId={selectedNFT.projectId}
        onBack={() => setSelectedNFT(null)}
        project={project}
      />
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My NFTs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nfts.map((nft, idx) => (
          <div
            key={idx}
            className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700"
            onClick={() => setSelectedNFT(nft)}
          >
            <div className="font-bold text-white">{nft.projectName}</div>
            <div className="text-slate-300">Amount: {nft.donationAmount} MAS</div>
            <div className="text-slate-400 text-xs">Date: {nft.donationDate}</div>
            <div className="text-slate-400 text-xs">NFT ID: {nft.projectId}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 