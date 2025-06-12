'use client';

import { Box, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/system';
import { ElementType, FC } from 'react';

type SectionHeaderProps = {
  icon: ElementType;
  title: string;
  color: string;
};

const SectionHeader: FC<SectionHeaderProps> = ({ icon: Icon, title, color }) => (
  <Box display="flex" alignItems="center" gap={1}>
    <Icon sx={{ color } as SxProps<Theme>} />
    <Typography variant="h6" sx={{ color: '#fff' }}>
      {title}
    </Typography>
  </Box>
);

export default SectionHeader;
