import React from 'react';
import { Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ConnectMassaWallet } from '@massalabs/react-ui-kit';

interface WalletConnectModalProps {
  open: boolean;
  onClose: () => void;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: "#0f172a",
          border: "1px solid #00ff9d",
          px: 4,
          py: 3,
          minWidth: 350,
          position: "relative",
          overflow: "visible",
          zIndex: 1300
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8, color: "#00ff9d" }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0, overflow: "visible" }}>
        <div className="theme-dark">
          <Typography variant="h6" sx={{ color: "#ffffff", mb: 1 }}>
            Connect Your Wallet
          </Typography>

          <Typography variant="body2" sx={{ color: "#cccccc", mb: 3 }}>
            Choose a wallet provider to connect to the platform
          </Typography>

          <ConnectMassaWallet />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
