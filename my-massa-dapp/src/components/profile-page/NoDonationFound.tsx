'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NoDonationFound() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center w-full"
    >
      <div className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20 rounded-2xl p-12 w-full mx-auto">
        <TrendingUp className="h-16 w-16 text-[#00ff9d] mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-white mb-4">No Donations Yet</h3>
        <p className="text-slate-400 mb-6">
          You haven't make any donations yet. Your support can make a
          difference!
        </p>
        <Button
          onClick={() => navigate('/projects')}
          className="bg-gradient-to-r from-[#00ff9d] to-[#00cc7d] hover:from-[#00cc7d] hover:to-[#00ff9d] text-black font-bold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Support a Project
        </Button>
      </div>
    </motion.div>
  );
}
