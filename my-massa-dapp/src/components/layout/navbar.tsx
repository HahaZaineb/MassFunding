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
  Container,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import WalletConnectModal from '../WalletConnectModal';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { shortenAddress } from '@/lib/utils';

const navItems = [
  { label: 'Explore Projects', path: '/projects' },
  { label: 'Request Funding', path: '/request-funding' },
  { label: 'How It Works', path: '/about' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuOpen = Boolean(anchorEl);

  return (
    <>
      <AppBar
        position="static"
        sx={{ backgroundColor: '#181f36', borderBottom: '1px solid #23243a' }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: '#00ff9d', cursor: 'pointer' }}
              onClick={() => handleNavigate('/')}
            >
              MassFunding
            </Typography>

            {!isMobile && (
              <Box display="flex" gap={3} flexGrow={1} justifyContent="center">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      color:
                        location.pathname === item.path ? '#00ff9d' : '#fff',
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

            <Box display="flex" alignItems="center" gap={1}>
              {connectedAccount ? (
                <>
                  <Button
                    onClick={handleMenuOpen}
                    sx={{
                      bgcolor: 'transparent',
                      color: '#00ff9d',
                      border: '2px solid #00ff9d',
                      fontWeight: 'bold',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': { bgcolor: 'transparent' },
                    }}
                    startIcon={
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: 'green',
                        }}
                      />
                    }
                  >
                    {shortenAddress(connectedAccount?.address?.toString())}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    PaperProps={{
                      sx: {
                        bgcolor: '#1f2a48',
                        color: '#fff',
                        mt: 1,
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleNavigate('/profile');
                        handleMenuClose();
                      }}
                    >
                      <PersonIcon sx={{ mr: 1 }} /> My Profile
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setShowWalletModal(true);
                        handleMenuClose();
                      }}
                    >
                      🔄 Switch Wallet
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  onClick={() => setShowWalletModal(true)}
                  sx={{
                    bgcolor: '#00ff9d',
                    color: '#0f1629',
                    border: '2px solid #00ff9d',
                    fontWeight: 'bold',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(0,255,157,0.9)',
                    },
                  }}
                  startIcon={
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: 'red',
                      }}
                    />
                  }
                >
                  Connect Wallet
                </Button>
              )}

              {isMobile && (
                <IconButton color="inherit" onClick={toggleDrawer}>
                  <MenuIcon sx={{ color: '#00ff9d' }} />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

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

      <WalletConnectModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
  );
}
