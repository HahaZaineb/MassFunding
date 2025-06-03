'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 bg-[#0f1629]">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#00ff9d] to-[#00ff9d] bg-clip-text text-transparent">
            Fund the Future of Massa
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            Support innovative projects building on the Massa blockchain and
            help shape the future of decentralized applications.
          </p>
          <Button
            onClick={() => navigate('/projects')}
            className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-[#0f1629] font-medium px-8 py-6 text-lg"
          >
            Explore Projects <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection
