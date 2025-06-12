'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { styled } from '@mui/system';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { getUserDonations } from '@/services/statsService';
import { useAppSelector } from '@/store/hooks';

const StyledCard = styled(Card)(() => ({
  backgroundColor: '#11182f',
  color: '#e0e0e0',
  border: '1px solid #1f2a48',
  borderRadius: 12,
}));

const SectionHeader = ({
  icon: Icon,
  title,
  color,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
}) => (
  <Box display="flex" alignItems="center" gap={1}>
    <Icon sx={{ color }} />
    <Typography variant="h6" sx={{ color: '#fff' }}>
      {title}
    </Typography>
  </Box>
);

const MyDonations: React.FC = ({}) => {
  const { connectedAccount } = useAccountStore();
  const [donatedProjects, setDonatedProjects] = useState<
    Array<{ id: string; name: string; amount: number; date: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const { list } = useAppSelector((state) => state.projects);

  useEffect(() => {
    const fetchDonatedProjects = async () => {
      if (connectedAccount) {
        try {
          setLoading(true);
          const donations = await getUserDonations(
            connectedAccount.address.toString(),
          );
          const mappedProjects = donations.map((donation) => {
            const project = list.find(
              (p) => p.id.toString() === donation.projectId,
            );
            return {
              id: donation.projectId,
              name: project ? project.name : `Project #${donation.projectId}`,
              amount: donation.amount,
              date: project && project.creationDate ? project.creationDate : '',
            };
          });
          setDonatedProjects(mappedProjects);
        } catch (error) {
          setDonatedProjects([]);
        } finally {
          setLoading(false);
        }
      } else {
        setDonatedProjects([]);
        setLoading(false);
      }
    };
    fetchDonatedProjects();
  }, [connectedAccount, list]);

  return (
    <StyledCard>
      <CardContent>
        <SectionHeader
          icon={FavoriteIcon}
          title="Projects I've Donated To"
          color="#f44336"
        />
        <Divider sx={{ my: 2, borderColor: '#1f2a48' }} />
        {loading ? (
          <Typography color="text.secondary">Loading donations...</Typography>
        ) : donatedProjects.length === 0 ? (
          <Typography color="text.secondary">No donations made yet.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ backgroundColor: '#11182f' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#00ff9d' }}>Project Name</TableCell>
                  <TableCell sx={{ color: '#00ff9d' }}>Amount</TableCell>
                  <TableCell sx={{ color: '#00ff9d' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {donatedProjects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell sx={{ color: '#e0e0e0' }}>
                      {project.name}
                    </TableCell>
                    <TableCell sx={{ color: '#e0e0e0' }}>
                      {project.amount.toLocaleString()} MAS
                    </TableCell>
                    <TableCell sx={{ color: '#aaa' }}>{project.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default MyDonations;
