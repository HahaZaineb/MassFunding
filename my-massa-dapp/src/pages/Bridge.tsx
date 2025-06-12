import React, { useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';

const BridgePage: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://letsexchange.io/init_widget.js';
    script.async = true;
    document.body.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://letsexchange.io/widget_lets.css';
    document.head.appendChild(link);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return (
    <Box sx={{ backgroundColor: '#0f1629' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="#00ff9d"
            gutterBottom
          >
            Bridge Assets
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Seamlessly bridge your assets between different blockchains using
            Let's Exchange
          </Typography>
        </Box>

        <div
          className="lets-widget"
          id="lets_widget_hwn4AYoQ3WlgA0A4"
          style={{
            maxWidth: '480px',
            height: '520px',
            margin: '0 auto',
            overflow: 'hidden',
          }}
        >
          <iframe
            src="https://letsexchange.io/v2/widget?affiliate_id=hwn4AYoQ3WlgA0A4&is_iframe=true"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            allow="clipboard-read; clipboard-write"
            title="Let's Exchange Widget"
          ></iframe>
        </div>
      </Container>
    </Box>
  );
};

export default BridgePage;
