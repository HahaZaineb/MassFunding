import { Box, Typography, Link, Container, Divider, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const linkStyles = {
    color: 'slategray',
    fontSize: '0.875rem',
    display: 'block',
    cursor: 'pointer',
    '&:hover': { color: '#00ff9d' },
  };

  const sections = [
    {
      title: 'Platform',
      links: [
        { label: 'Explore Projects', path: '/projects' },
        { label: 'Request Funding', path: '/request-funding' },
        { label: 'How It Works', path: '/about' },
      ],
      internal: true,
    },
    {
      title: 'Resources',
      links: [
        { label: 'Massa Docs', path: 'https://docs.massa.net/' },
        { label: 'GitHub', path: 'https://github.com/massalabs' },
        { label: 'Discord', path: 'https://discord.gg/massa' },
      ],
      internal: false,
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Privacy Policy', path: '/privacy' },
      ],
      internal: true,
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1a1a2e',
        borderTop: '1px solid rgba(0, 255, 157, 0.2)',
        py: 8,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 8 }}
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
        >
          <Stack spacing={2} sx={{ flex: 1, minWidth: 240 }}>
            <Typography
              variant="h6"
              sx={{ color: '#00ff9d', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => handleNavigate('/')}
            >
              MassFunding
            </Typography>
            <Typography variant="body2" sx={{ color: 'slategray', maxWidth: 200 }}>
              A decentralized crowdfunding platform built on Massa blockchain with vesting schedules and deferred calls.
            </Typography>
          </Stack>

          <Stack direction="row" flexWrap="wrap" sx={{ gap: 6 }}>
            {sections.map((section) => (
              <Stack spacing={1} key={section.title} minWidth={140}>
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
                  {section.title}
                </Typography>
                {section.links.map((link) =>
                  section.internal ? (
                    <Typography
                      key={link.path}
                      onClick={() => handleNavigate(link.path)}
                      sx={linkStyles}
                    >
                      {link.label}
                    </Typography>
                  ) : (
                    <Link
                      key={link.path}
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={linkStyles}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </Stack>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ borderColor: 'rgba(0, 255, 157, 0.2)', mt: 6, mb: 3 }} />

        <Typography variant="body2" align="center" sx={{ color: 'slategray' }}>
          © {new Date().getFullYear()} MassFunding. Built on Massa blockchain.
        </Typography>
      </Container>
    </Box>
  );
}
