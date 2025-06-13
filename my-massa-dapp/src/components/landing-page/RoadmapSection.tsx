'use client';

import { FaCheckCircle, FaRocket, FaVoteYea, FaGift } from 'react-icons/fa';

const roadmapPhases = [
  {
    icon: <FaCheckCircle className="text-[#00ff9d]" size={20} />,
    title: 'Phase 1: Foundation',
    items: [
      'Wallet connection',
      'Request project funding',
      'Fund a project securely',
      'Explore projects & view details',
    ],
  },
  {
    icon: <FaRocket className="text-[#00ff9d]" size={20} />,
    title: 'Phase 2: Smart Vesting',
    items: [
      'Smart contract-based vesting schedules',
      'Automatic fund release in stages',
      'Lock periods to protect early backers',
      'Real-time vesting & release countdowns',
      'Project updates shared with funders',
    ],
  },
  {
    icon: <FaVoteYea className="text-[#00ff9d]" size={20} />,
    title: 'Phase 3: Community Voting',
    items: [
      'Backers vote to approve each fund release',
      'Automatic pause if voting fails',
      'On-chain recording of all voting outcomes',
    ],
  },
  {
    icon: <FaGift className="text-[#00ff9d]" size={20} />,
    title: 'Phase 4: Token & NFT Integration',
    items: [
      'Launch of MassFunding native token',
      'Token rewards for funders & project owners',
      'Token utility for governance & early access',
      'Earn NFT as proof of contribution',
    ],
  },
];

const timeline = [
  { feature: 'Foundation', status: 'Done', target: 'Q2 2025' },
  { feature: 'Smart Vesting', status: 'Done', target: 'Q2 2025' },
  { feature: 'Voting System', status: 'In Progress', target: 'Q3 2025' },
  { feature: 'Token & NFT Integration', status: 'Planned', target: 'Q3 2025' },
];

const statusColors: Record<string, string> = {
  Done: 'text-green-400 bg-green-400/10',
  'In Progress': 'text-yellow-400 bg-yellow-400/10',
  Planned: 'text-gray-400 bg-gray-400/10',
};

export default function RoadmapSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12 bg-[#1a1a2e]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Platform Roadmap
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {roadmapPhases.map((phase, index) => (
            <div
              key={index}
              className="bg-slate-800/80 border border-[#00ff9d]/10 backdrop-blur-sm p-6 rounded-xl transition hover:shadow-lg"
            >
              <div className="flex items-center mb-4">
                {phase.icon}
                <h3 className="ml-3 text-xl font-semibold text-white">
                  {phase.title}
                </h3>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-1 ml-1">
                {phase.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            📆 Estimated Timeline
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-slate-300 text-sm">
              <thead className="text-slate-400 border-b border-[#00ff9d]/10">
                <tr>
                  <th className="py-2 pr-4">Feature</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Target</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 pr-4">{row.feature}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3">{row.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
