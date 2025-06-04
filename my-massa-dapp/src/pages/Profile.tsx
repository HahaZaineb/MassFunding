'use client';

import React from 'react';
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
import { useProjects } from '@/context/project-context';
import ProjectMiniCard from '@/components/projects/ProjectMiniCard';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TimelineIcon from '@mui/icons-material/Timeline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { ConnectMassaWallet, useAccountStore } from '@massalabs/react-ui-kit';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#11182f',
  color: '#e0e0e0',
  border: '1px solid #1f2a48',
  borderRadius: 12,
}));

const AccentText = styled('span')({
  color: '#00ff9d',
  fontWeight: 500,
});

const Label = styled(Typography)({
  color: '#888',
  fontSize: '0.9rem',
});

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

const ProfilePage: React.FC = ({}) => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const featuredProjects = projects.slice(0, 3);

  const donatedProjects = [
    { id: 'a1', name: 'Project 1', amount: 500, date: '2024-05-12' },
    { id: 'a2', name: 'Project 2', amount: 250, date: '2024-06-10' },
  ];

  return (
    <Box sx={{ p: 4, backgroundColor: '#0f1629', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ color: '#fff', mb: 3 }}>
        My <AccentText>Profile</AccentText>
      </Typography>

      <Box
        display="flex"
        gap={4}
        flexDirection={{ xs: 'column', md: 'row' }}
        mb={4}
      >
        {/* Wallet Info */}
        <StyledCard sx={{ flex: 1 }}>
          <CardContent>
            <SectionHeader
              icon={AccountBalanceWalletIcon}
              title="Wallet Info"
              color="#00bcd4"
            />
            <Divider sx={{ my: 2, borderColor: '#1f2a48' }} />
            <div className="theme-dark">
              <ConnectMassaWallet />
            </div>
          </CardContent>
        </StyledCard>

        {/* User Activity Summary */}
        <StyledCard sx={{ flex: 1 }}>
          <CardContent>
            <SectionHeader
              icon={TimelineIcon}
              title="User Activity"
              color="#ff9800"
            />
            <Divider sx={{ my: 2, borderColor: '#1f2a48' }} />
            <Box display="flex" flexDirection="column" gap={1}>
              <Label>Total Projects Created</Label>
              <Typography>
                <AccentText>{featuredProjects.length}</AccentText>
              </Typography>

              <Label>Total Donated</Label>
              <Typography>
                <AccentText>
                  $
                  {donatedProjects
                    .reduce((sum, dp) => sum + dp.amount, 0)
                    .toLocaleString()}
                </AccentText>
              </Typography>

              <Label>Number of Donations</Label>
              <Typography>
                <AccentText>{donatedProjects.length}</AccentText>
              </Typography>
            </Box>
          </CardContent>
        </StyledCard>
      </Box>

      {/* My Projects */}
      <StyledCard sx={{ mb: 4 }}>
        <CardContent>
          <SectionHeader
            icon={WorkOutlineIcon}
            title="My Projects"
            color="#4caf50"
          />
          <Divider sx={{ my: 2, borderColor: '#1f2a48' }} />
          {featuredProjects.length === 0 ? (
            <Typography color="text.secondary">
              No projects created yet.
            </Typography>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProjects.map((project, index) => (
                <ProjectMiniCard
                  project={project}
                  key={index}
                  showFundBtn={false}
                />
              ))}
            </div>
          )}
        </CardContent>
      </StyledCard>

      {/* Donated Projects Table */}
      <StyledCard>
        <CardContent>
          <SectionHeader
            icon={FavoriteIcon}
            title="Projects I’ve Donated To"
            color="#f44336"
          />
          <Divider sx={{ my: 2, borderColor: '#1f2a48' }} />
          {donatedProjects.length === 0 ? (
            <Typography color="text.secondary">
              No donations made yet.
            </Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{ backgroundColor: '#11182f' }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#00ff9d' }}>
                      Project Name
                    </TableCell>
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
                      <TableCell sx={{ color: '#aaa' }}>
                        {project.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default ProfilePage;
