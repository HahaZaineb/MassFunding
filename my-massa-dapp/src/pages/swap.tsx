import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const SwapPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="#00ff9d" gutterBottom>
          Swap Tokens
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Easily swap your tokens with the best rates using EagleFi
        </Typography>
      </Box>

      <iframe
        src="https://www.eaglefi.io/swap-widget?fromToken=AS12FW5Rs5YN2zdpEnqwj4iHUUPt9R4Eqjq2qtpJFNKW3mn33RuLU&toToken=NATIVE_COIN&fixFromToken=false&fixToToken=false&theme=light"
        width="100%"
        height="640px"
        style={{
          border: 0,
          margin: '0 auto',
          display: 'block',
          maxWidth: '960px',
          minWidth: '300px',
        }}
        scrolling="no"
        title="EagleFi Swap Widget"
      ></iframe>
    </Container>
  );
};

export default SwapPage;
