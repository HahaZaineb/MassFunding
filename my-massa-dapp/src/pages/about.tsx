'use client';

export default function AboutPage() {
  return (
    <div className="mx-auto py-12 px-4 bg-[#0f1629]">
      <h1 className="text-3xl font-bold mb-6 text-[#00ff9d]">
        About MassFunding
      </h1>
      <div className="bg-[#1a1a2e] p-8 rounded-lg border border-[#00ff9d]/20">
        <p className="text-lg text-slate-300 mb-6">
          MassFunding is a decentralized crowdfunding platform built on the
          Massa blockchain. It leverages Massa's unique features like deferred
          calls and vesting schedules to create a transparent and accountable
          funding ecosystem.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-white">Key Features</h2>
        <ul className="list-disc list-inside text-slate-300 space-y-2">
          <li>Transparent vesting schedules for project funding</li>
          <li>NFT-based contribution receipts</li>
          <li>Milestone-based fund release</li>
          <li>Built on Massa's secure and efficient blockchain</li>
          <li>Community governance through NFT voting</li>
        </ul>
      </div>
    </div>
  );
}
