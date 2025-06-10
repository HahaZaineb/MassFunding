'use client';

import { motion } from 'framer-motion';
import { FilePlus2, HandHeart, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { useProjects } from '@/context/project-context';
import { fetchUserDonations, ContractVestingScheduleData } from '@/services/contract-service';
import { useState, useEffect } from 'react';

export default function UserActivity() {
  const { projects } = useProjects();
  const { connectedAccount } = useAccountStore();
  const [userDonations, setUserDonations] = useState<ContractVestingScheduleData[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(true);

  useEffect(() => {
    const getDonations = async () => {
      if (connectedAccount) {
        setLoadingDonations(true);
        try {
          const donations = await fetchUserDonations(connectedAccount.address.toString());
          setUserDonations(donations);
        } catch (error) {
          console.error("Failed to fetch user donations:", error);
          setUserDonations([]);
        } finally {
          setLoadingDonations(false);
        }
      } else {
        setUserDonations([]);
        setLoadingDonations(false);
      }
    };
    getDonations();
  }, [connectedAccount]);

  const myProjects = connectedAccount
    ? projects.filter((p) => {
        const creatorAddress = p.creator?.toLowerCase() || '';
        const connectedAddress = connectedAccount.address
          .toString()
          .toLowerCase();
        return creatorAddress === connectedAddress;
      })
    : [];

  const totalProjectsCreated = myProjects.length;

  const totalDonationsCount = userDonations.length;
  const totalAmountDonated = userDonations.reduce(
    (sum, schedule) => sum + schedule.totalAmount / 1e9,
    0,
  );

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
              <FilePlus2 className="h-8 w-8 text-[#00ff9d]" />
            </div>
            <div className="text-2xl font-bold text-white">{totalProjectsCreated}</div>
            <div className="text-sm text-slate-400">Projects Created</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <HandHeart className="h-8 w-8 text-[#00ff9d]" />
            </div>
            <div className="text-2xl font-bold text-white">{loadingDonations ? '...' : totalDonationsCount}</div>
            <div className="text-sm text-slate-400">Total Donations</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-8 w-8 text-[#00ff9d]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {loadingDonations ? '...' : totalAmountDonated.toFixed(1)}
            </div>
            <div className="text-sm text-slate-400">Total Amount Donated (MAS)</div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
