'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { useAppSelector } from '@/store/hooks';

export default function Stats() {
  const { connectedAccount } = useAccountStore();
  const { list } = useAppSelector((state) => state.projects);

  const myProjects = connectedAccount
    ? list.filter((p) => {
        const creatorAddress = (p.creator?.toString() || '').toLowerCase();
        const connectedAddress = connectedAccount.address
          .toString()
          .toLowerCase();
          const match = creatorAddress === connectedAddress;
          return match;
        })
      : [];

  const totalProjectsCreated = myProjects.length;

  // Total MAS received by all my projects
  const totalDonationsReceived = myProjects.reduce(
    (sum, project) => sum + project.amountRaised ,
    0,
  );

  const totalSupportersReceived = myProjects.reduce(
    (sum, project) => sum + project.supporters,
    0,
  );

  const formattedTotalDonations = totalDonationsReceived.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }) + ' MAS';

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
            <div className="text-2xl font-bold text-white">{totalProjectsCreated}</div>
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
            <div className="text-sm text-slate-400">Total Donations Received</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-8 w-8 text-[#00ff9d]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {totalSupportersReceived}
            </div>
            <div className="text-sm text-slate-400">Total Supporters</div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}