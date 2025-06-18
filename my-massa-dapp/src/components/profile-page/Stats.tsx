'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { useAppSelector } from '@/store/hooks';
import { useMemo } from 'react';

export default function Stats() {
  const { connectedAccount } = useAccountStore();
  const { list } = useAppSelector((state) => state.projects);

  const userAddress = connectedAccount?.address?.toString().toLowerCase();

  const { totalProjectsCreated, totalDonationsReceived, totalSupportersReceived } = useMemo(() => {
    if (!userAddress) return { totalProjectsCreated: 0, totalDonationsReceived: 0, totalSupportersReceived: 0 };

    const myProjects = list.filter(
      (p) => p.creator?.toLowerCase() === userAddress
    );

    const totalDonations = myProjects.reduce((sum, project) => sum + project.amountRaised, 0);
    const totalSupporters = myProjects.reduce((sum, project) => sum + project.supporters, 0);

    return {
      totalProjectsCreated: myProjects.length,
      totalDonationsReceived: totalDonations,
      totalSupportersReceived: totalSupporters,
    };
  }, [list, userAddress]);

  const cardData = [
    {
      icon: <TrendingUp className="h-8 w-8 text-[#00ff9d]" />,
      value: totalProjectsCreated,
      label: 'Projects Created',
    },
    {
      icon: <DollarSign className="h-8 w-8 text-[#00ff9d]" />,
      value: `${totalDonationsReceived.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} MAS`,
      label: 'Total Donations Received',
    },
    {
      icon: <Users className="h-8 w-8 text-[#00ff9d]" />,
      value: totalSupportersReceived,
      label: 'Total Supporters',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cardData.map(({ icon, value, label }, idx) => (
          <Card
            key={idx}
            className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20"
          >
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">{icon}</div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-sm text-slate-400">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
