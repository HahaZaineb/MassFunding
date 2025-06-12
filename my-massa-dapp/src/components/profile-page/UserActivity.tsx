'use client';

import { motion } from 'framer-motion';
import { FilePlus2, HandHeart, DollarSign } from 'lucide-react';
import { Card as CardMui, CardContent as CardContentMui, Divider } from '@mui/material';
import { Card, CardContent } from '@/components/ui/card';

import { styled } from '@mui/system';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { useState, useEffect } from 'react';
import SectionHeader from '../SectionHeader';
import TimelineIcon from '@mui/icons-material/Timeline';
import { getUserDonations } from '@/services/statsService';
import { ProjectData } from '@/types/project';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProjects } from '@/store/slices/projectSlice';

export default function UserActivity() {
  const dispatch = useAppDispatch();
  const { connectedAccount } = useAccountStore();
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalAmountDonated, setTotalAmountDonated] = useState(0);
  const [loading, setLoading] = useState(true);
  const { list } = useAppSelector((state) => state.projects);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (connectedAccount) {
        try {
          setLoading(true);
          const donations = await getUserDonations(
            connectedAccount.address.toString(),
          );
          setTotalDonations(donations.length);
          setTotalAmountDonated(
            donations.reduce((sum, d) => sum + d.amount, 0),
          );
        } catch (error) {
          setTotalDonations(0);
          setTotalAmountDonated(0);
        } finally {
          setLoading(false);
        }
      } else {
        setTotalDonations(0);
        setTotalAmountDonated(0);
        setLoading(false);
      }
    };
    fetchUserStats();
        dispatch(fetchProjects());
  }, [connectedAccount]);

  const myProjects = connectedAccount
    ? list.filter((p: ProjectData) => {
        const creatorAddress = p.creator?.toLowerCase() || '';
        const connectedAddress = connectedAccount.address
          .toString()
          .toLowerCase();
        return creatorAddress === connectedAddress;
      })
    : [];

  const totalProjectsCreated = myProjects.length;

const StyledCard = styled(CardMui)(() => ({
  backgroundColor: '#11182f',
  color: '#e0e0e0',
  border: '1px solid #1f2a48',
  borderRadius: 12,
}));
  
  return (
    <StyledCard sx={{ flex: 1 }} className="bg-gradient-to-br">
      <CardContentMui>
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
            <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <FilePlus2 className="h-8 w-8 text-[#00ff9d]" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {totalProjectsCreated}
                </div>
                <div className="text-sm text-slate-400">Projects Created</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <HandHeart className="h-8 w-8 text-[#00ff9d]" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {loading ? '...' : totalDonations}
                </div>
                <div className="text-sm text-slate-400">Funds Donated</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-8 w-8 text-[#00ff9d]" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {loading ? '...' : totalAmountDonated.toFixed(2)}
                </div>
                <div className="text-sm text-slate-400">
                  Amount Donated (MAS)
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </CardContentMui>
    </StyledCard>
  );
}
