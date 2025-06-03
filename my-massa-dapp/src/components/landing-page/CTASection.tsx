'use client';

import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-br from-[#0f1629] to-[#1a1a2e]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Ready to Launch Your Project?
        </h2>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Join the growing community of innovators using MassFunding to bring
          their ideas to life on the Massa blockchain.
        </p>
        <Button
          size="lg"
          className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black font-bold"
          onClick={() => navigate('/request-funding')}
        >
          Request Funding Now
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
