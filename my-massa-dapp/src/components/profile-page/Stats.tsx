'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { useProjects } from '@/context/project-context';
import React, { useEffect, useState } from 'react';
import {
  getTotalDonations,
  getTotalProjectsFunded,
  getTotalSupporters,
} from '@/services/contract-service';
import { formatMas } from '@massalabs/massa-web3';

export default function Stats() {
  const { projects } = useProjects();
  const { connectedAccount } = useAccountStore();

  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [totalProjectsFunded, setTotalProjectsFunded] = useState<number>(0);
  const [totalSupporters, setTotalSupporters] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const donations = await getTotalDonations();
        setTotalDonations(donations);

        const projectsFunded = await getTotalProjectsFunded();
        setTotalProjectsFunded(projectsFunded);

        const supporters = await getTotalSupporters();
        setTotalSupporters(supporters);
      } catch (error) {
        console.error('Error fetching global stats for profile page:', error);
      }
    };

    fetchData();
  }, []);

  const formattedTotalDonations = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MAS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(formatMas(BigInt(totalDonations.toString()))));

  const myProjects = connectedAccount
    ? projects.filter((p) => {
        const creatorAddress = p.creator?.toLowerCase() || '';
        const connectedAddress = connectedAccount.address
          .toString()
          .toLowerCase();
        const match = creatorAddress === connectedAddress;
        return match;
      })
    : [];

  const totalProjects = myProjects.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-[#00ff9d]" />
            </div>
            <div className="text-2xl font-bold text-white">{totalProjects}</div>
            <div className="text-sm text-slate-400">Projects Created</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-8 w-8 text-[#00ff9d]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {formattedTotalDonations}
            </div>
            <div className="text-sm text-slate-400">Total Donations</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-8 w-8 text-[#00ff9d]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {totalSupporters}
            </div>
            <div className="text-sm text-slate-400">Total Supporters</div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}