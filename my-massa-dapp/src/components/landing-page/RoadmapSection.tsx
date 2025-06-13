'use client';

import { FaCheckCircle, FaRocket, FaVoteYea, FaGift } from 'react-icons/fa';

const statusColors: Record<string, string> = {
  Done: 'text-green-400 bg-green-400/10',
  'In Progress': 'text-yellow-400 bg-yellow-400/10',
  Planned: 'text-gray-400 bg-gray-400/10',
};

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
    status: 'Done',
    target: 'Q2 2025',
  },
  {
    icon: <FaRocket className="text-[#00ff9d]" size={20} />,
    title: 'Phase 2: Smart Vesting',
    items: [
      'Smart contract-based vesting schedules',
      'Automatic fund release in stages',
      'Lock periods to protect early backers',
      'Real-time vesting & release countdowns',
    ],
    status: 'Done',
    target: 'Q2 2025',
  },
  {
    icon: <FaVoteYea className="text-[#00ff9d]" size={20} />,
    title: 'Phase 3: Community Voting',
    items: [
      'Backers vote to approve each fund release',
      'Automatic pause if voting fails',
      'On-chain recording of all voting outcomes',
      'Transparency dashboard for community insights'
    ],
    status: 'In Progress',
    target: 'Q3 2025',
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
    status: 'Planned',
    target: 'Q3 2025',
  },
];

export default function RoadmapSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12 bg-[#1a1a2e]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Platform Roadmap
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {roadmapPhases.map((phase, index) => {
            return (
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

                <ul className="list-disc list-inside text-slate-300 space-y-1 ml-1 mb-4">
                  {phase.items.map((item, i) => (
                    <li key={i} className={item ? '' : 'opacity-40'}>
                      {item || '-'}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[phase.status]}`}
                  >
                    {phase.status}
                  </span>
                  <span className="text-sm text-slate-400">🎯 {phase.target}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
