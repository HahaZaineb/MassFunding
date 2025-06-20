'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FilePlus2, HandHeart, DollarSign } from 'lucide-react';
import {
  Card as MuiCard,
  CardContent as MuiCardContent,
  Divider,
} from '@mui/material';
import { styled } from '@mui/system';

import { useAccountStore } from '@massalabs/react-ui-kit';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProjects } from '@/store/slices/projectSlice';
import { getUserDonations } from '@/services/statsService';

import SectionHeader from '../SectionHeader';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Card, CardContent } from '@/components/ui/card';

const StyledCard = styled(MuiCard)(() => ({
  backgroundColor: '#11182f',
  color: '#e0e0e0',
  border: '1px solid #1f2a48',
  borderRadius: 12,
}));

export default function UserActivity() {
  const dispatch = useAppDispatch();
  const { connectedAccount } = useAccountStore();
  const { list: projectList } = useAppSelector((state) => state.projects);

  const [totalDonations, setTotalDonations] = useState(0);
  const [totalAmountDonated, setTotalAmountDonated] = useState(0);
  const [loading, setLoading] = useState(false);

  const userAddress = connectedAccount?.address?.toString().toLowerCase() || '';

  const totalProjectsCreated = useMemo(() => {
    if (!userAddress) return 0;
    return projectList.filter((p) => p.creator?.toLowerCase() === userAddress)
      .length;
  }, [projectList, userAddress]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!userAddress) {
        setTotalDonations(0);
        setTotalAmountDonated(0);
        return;
      }

      try {
        setLoading(true);
        const donations = await getUserDonations(
          connectedAccount?.address.toString() || '',
        );
        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
        setTotalDonations(donations.length);
        setTotalAmountDonated(totalAmount);
      } catch {
        setTotalDonations(0);
        setTotalAmountDonated(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
    dispatch(fetchProjects());
  }, [userAddress, dispatch]);

  const cardData = [
    {
      icon: <FilePlus2 className="h-8 w-8 text-[#00ff9d]" />,
      value: totalProjectsCreated,
      label: 'Projects Created',
    },
    {
      icon: <HandHeart className="h-8 w-8 text-[#00ff9d]" />,
      value: loading ? '...' : totalDonations,
      label: 'Funds Donated',
    },
    {
      icon: <DollarSign className="h-8 w-8 text-[#00ff9d]" />,
      value: loading ? '...' : totalAmountDonated.toFixed(2),
      label: 'Amount Donated (MAS)',
    },
  ];

  return (
    <StyledCard sx={{ flex: 1 }}>
      <MuiCardContent>
        <SectionHeader
          icon={TimelineIcon}
          title="User Activity"
          color="#ff9800"
        />
        <Divider sx={{ my: 2, borderColor: '#1f2a48' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cardData.map(({ icon, value, label }, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20"
              >
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    {icon}
                  </div>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-sm text-slate-400">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </MuiCardContent>
    </StyledCard>
  );
}
