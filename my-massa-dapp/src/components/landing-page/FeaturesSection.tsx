'use client';

import { motion } from 'framer-motion';
import { Shield, Clock, Coins } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-[#0f1629]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Decentralized and Trustless Funding */}
          <motion.div
            className="bg-[#0f1629] p-6 rounded-lg border border-[#00ff9d]/20 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#fbbf24]/20">
              <Coins className="text-[#fbbf24] w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Decentralized and Trustless Funding
            </h3>
            <p className="text-slate-300">
              Projects launch fundraising campaigns directly on the Massa
              blockchain, where smart contracts handle funds automatically. This
              removes the need for intermediaries and ensures trustless,
              transparent transactions.
            </p>
          </motion.div>
          {/* Secure Vesting */}
          <motion.div
            className="bg-[#0f1629] p-6 rounded-lg border border-[#00ff9d]/20 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#34d399]/20">
              <Shield className="text-[#34d399] w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Secure Vesting
            </h3>
            <p className="text-slate-300">
              Funds are systematically released based on predefined vesting
              schedules, providing transparency and ensuring the project remains
              accountable throughout its development lifecycle.
            </p>
          </motion.div>

          {/* Milestone Tracking */}
          <motion.div
            className="bg-[#0f1629] p-6 rounded-lg border border-[#00ff9d]/20 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#60a5fa]/20">
              <Clock className="text-[#60a5fa] w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Milestone Tracking
            </h3>
            <p className="text-slate-300">
              Monitor project progress effortlessly with transparent and consistent updates directly from the creators,
              ensuring full visibility and confidence every step of the way.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
