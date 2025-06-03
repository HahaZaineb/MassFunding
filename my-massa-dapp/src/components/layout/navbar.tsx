import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from 'react-router-dom';
import WalletConnectModal from '../WalletConnectModal';
import { useAccountStore } from '@massalabs/react-ui-kit';

const navItems = [
  { label: 'Explore Projects', path: '/projects' },
  { label: 'Request Funding', path: '/request-funding' },
  { label: 'How It Works', path: '/about' },
];

function shortenAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { connectedAccount } = useAccountStore();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) toggleDrawer();
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{ backgroundColor: '#181f36', borderBottom: '1px solid #23243a' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo on left */}
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: '#00ff9d', cursor: 'pointer' }}
            onClick={() => handleNavigate('/')}
          >
            MassFunding
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box display="flex" gap={3} flexGrow={1} justifyContent="center">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    color: location.pathname === item.path ? '#00ff9d' : '#fff',
                    fontWeight: '500',
                    textTransform: 'none',
                    '&:hover': { color: '#00ff9d' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Right side: Wallet Button + Burger Menu (mobile only) */}
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              onClick={() => setShowWalletModal(true)}
              sx={{
                bgcolor: connectedAccount ? '#00ff9d' : '#23243a',
                color: connectedAccount ? '#181f36' : '#fff',
                border: connectedAccount ? 'none' : '2px solid #00ff9d',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: connectedAccount ? '#00ffaa' : '#2c2d4a',
                },
              }}
              startIcon={
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: connectedAccount ? 'green' : 'red',
                  }}
                />
              }
            >
              {connectedAccount
                ? shortenAddress(connectedAccount.toString())
                : 'Connect Wallet'}
            </Button>

            {isMobile && (
              <IconButton color="inherit" onClick={toggleDrawer}>
                <MenuIcon sx={{ color: '#00ff9d' }} />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for Mobile Nav */}
      <Drawer anchor="left" open={mobileOpen} onClose={toggleDrawer}>
        <Box
          sx={{ width: 250, bgcolor: '#181f36', height: '100%', color: '#fff' }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: '#00ff9d' }}
            >
              Menu
            </Typography>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon sx={{ color: '#00ff9d' }} />
            </IconButton>
          </Box>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton onClick={() => handleNavigate(item.path)}>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      sx: {
                        color:
                          location.pathname === item.path ? '#00ff9d' : '#fff',
                        fontWeight: 500,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Wallet Modal */}

      <WalletConnectModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
  );
}
