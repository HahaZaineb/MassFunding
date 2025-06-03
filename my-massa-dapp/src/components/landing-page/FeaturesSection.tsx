'use client';

import { motion } from 'framer-motion';
import { Shield, Clock, Coins } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-[#1a1a2e]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            className="bg-[#0f1629] p-6 rounded-lg border border-[#00ff9d]/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="bg-[#00ff9d] w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Shield className="text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Secure Vesting
            </h3>
            <p className="text-slate-300">
              Funds are released according to predefined vesting schedules,
              ensuring project accountability.
            </p>
          </motion.div>

          <motion.div
            className="bg-[#0f1629] p-6 rounded-lg border border-[#00ff9d]/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="bg-[#00ff9d] w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Coins className="text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">NFT Receipts</h3>
            <p className="text-slate-300">
              Receive unique NFTs as proof of contribution that can be used for
              governance voting.
            </p>
          </motion.div>

          <motion.div
            className="bg-[#0f1629] p-6 rounded-lg border border-[#00ff9d]/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-[#00ff9d] w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Clock className="text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Milestone Tracking
            </h3>
            <p className="text-slate-300">
              Track project progress through transparent milestones and regular
              updates from project creators.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection
