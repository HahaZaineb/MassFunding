'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import UserActivity from '@/components/profile-page/UserActivity';
import MyProjects from '@/components/profile-page/MyProjects';
import WalletInfo from '@/components/profile-page/WalletInfo';
import MyDonations from '@/components/profile-page/MyDonations';

const AccentText = styled('span')({
  color: '#00ff9d',
  fontWeight: 500,
});

const ProfilePage: React.FC = ({}) => {
  return (
    <div className="w-full p-4 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Typography variant="h4" sx={{ color: '#fff', mb: 3 }}>
        My <AccentText>Profile</AccentText>
      </Typography>

      <Box
        display="flex"
        gap={4}
        flexDirection={{ xs: 'column', md: 'row' }}
        mb={4}
      >
        <WalletInfo />
        <UserActivity />
      </Box>
      <MyProjects />
      <MyDonations />
    </div>
  );
};

export default ProfilePage;
