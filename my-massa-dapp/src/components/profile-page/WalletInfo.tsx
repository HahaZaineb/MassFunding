'use client';

import React from 'react';
import { Card, CardContent, Divider } from '@mui/material';
import { styled } from '@mui/system';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { ConnectMassaWallet } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';
import SectionHeader from '../SectionHeader';

const StyledCard = styled(Card)(() => ({
  backgroundColor: '#11182f',
  color: '#e0e0e0',
  border: '1px solid #1f2a48',
  borderRadius: 12,
}));

const WalletInfo: React.FC = ({}) => {
  return (
    <StyledCard sx={{ flex: 1 }} className="bg-gradient-to-br">
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
  );
};

export default WalletInfo;
