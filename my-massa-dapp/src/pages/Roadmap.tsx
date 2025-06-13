'use client';

export default function RoadmapPage() {
  return (
    <div className="mx-auto py-12 px-4 bg-[#0f1629]">
      <h1 className="text-3xl font-bold mb-6 text-[#00ff9d]">
        Platform Roadmap
      </h1>

      <div className="bg-[#1a1a2e] p-8 rounded-lg border border-[#00ff9d]/20 space-y-10">
        {/* Phase 1 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">
            ✅ Phase 1: Foundation
          </h2>
          <ul className="list-disc list-inside text-slate-300 space-y-1">
            <li>Wallet connection</li>
            <li>Request project funding</li>
            <li>Fund a project securely</li>
            <li>Explore projects & view details</li>
          </ul>
        </section>

        {/* Phase 2 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">
            🚀 Phase 2: Smart Vesting
          </h2>
          <ul className="list-disc list-inside text-slate-300 space-y-1">
            <li>Smart contract-based vesting schedules</li>
            <li>Automatic fund release in stages</li>
            <li>Lock periods to protect early backers</li>
            <li>Real-time vesting & release countdowns</li>
            <li>Project updates shared with funders</li>
          </ul>
        </section>

        {/* Phase 3 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">
            🗳️ Phase 3: Community Voting
          </h2>
          <ul className="list-disc list-inside text-slate-300 space-y-1">
            <li>Backers vote to approve each fund release</li>
            <li>Automatic pause if voting fails</li>
            <li>On-chain recording of all voting outcomes</li>
          </ul>
        </section>

        {/* Phase 4 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">
            🎁 Phase 4: Token & NFT Integration
          </h2>
          <ul className="list-disc list-inside text-slate-300 space-y-1">
            <li>Launch of MassFunding native token</li>
            <li>Token rewards for funders & project owners</li>
            <li>Token utility for governance & early access</li>
            <li>
              Earn an NFT as proof of contribution after funding a project
            </li>
          </ul>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            📆 Estimated Timeline
          </h2>
          <table className="w-full text-left text-slate-300 text-sm">
            <thead className="text-slate-400 border-b border-[#00ff9d]/20">
              <tr>
                <th className="py-2">Feature</th>
                <th className="py-2">Status</th>
                <th className="py-2">Target</th>
              </tr>
            </thead>
            <tbody>
                              <tr>
                <td className="py-2">Foundation</td>
                <td className="py-2 text-green-400">Done</td>
                <td className="py-2">Q2 2025</td>
              </tr>
              <tr>
                <td className="py-2">Smart Vesting</td>
                <td className="py-2 text-green-400">Done</td>
                <td className="py-2">Q2 2025</td>
              </tr>
              <tr>
                <td className="py-2">Voting System</td>
                <td className="py-2 text-yellow-400">In Progress</td>
                <td className="py-2">Q3 2025</td>
              </tr>
              <tr>
                <td className="py-2">Token & NFT Integration</td>
                <td className="py-2 text-gray-400">Planned</td>
                <td className="py-2">Q4 2025</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
