import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, HandCoins, Rocket, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  getTotalDonations,
  getTotalProjectsFunded,
  getTotalSupporters,
} from '@/services/contract-service';
import { formatMas } from '@massalabs/massa-web3';

const HeroSection = () => {
  const navigate = useNavigate();

  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [totalProjects, setTotalProjects] = useState<number>(0);
  const [totalSupporters, setTotalSupporters] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const donations = await getTotalDonations();
        setTotalDonations(donations);

        const projects = await getTotalProjectsFunded();
        setTotalProjects(projects);

        const supporters = await getTotalSupporters();
        setTotalSupporters(supporters);
      } catch (error) {
        console.error('Error fetching hero section stats:', error);
      }
    };

    fetchData();
  }, []);

  const formattedTotalDonations = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MAS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(formatMas(BigInt(totalDonations))));

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
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Whether you're here to support innovation or bring your vision to life, join the growing community on the Massa blockchain.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              onClick={() => navigate('/projects')}
              className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-[#0f1629] font-medium px-8 py-6 text-lg"
            >
              <HandCoins className="h-5 w-5" />
              Fund a Project <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate('/request-funding')}
              variant="outline"
              className="border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 font-medium px-8 py-6 text-lg"
            >
              <Rocket className="h-5 w-5" />
              Request Funding <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white"
        >
          <div className="flex flex-col items-center">
            <HandCoins className="h-8 w-8 text-yellow-400 mb-2" />
            <p className="text-3xl font-semibold text-yellow-400">{formattedTotalDonations}</p>
            <p className="text-slate-400 mt-1">Total Donations</p>
          </div>
          <div className="flex flex-col items-center">
            <Rocket className="h-8 w-8 text-purple-400 mb-2" />
            <p className="text-3xl font-semibold text-purple-400">{totalProjects}</p>
            <p className="text-slate-400 mt-1">Projects Funded</p>
          </div>
          <div className="flex flex-col items-center">
            <Users className="h-8 w-8 text-sky-400 mb-2" />
            <p className="text-3xl font-semibold text-sky-400">{totalSupporters}</p>
            <p className="text-slate-400 mt-1">Supporters</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;