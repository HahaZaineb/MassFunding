import React from 'react';
import { Chip, styled } from '@mui/material';

const statusMap = {
  live: {
    label: 'Live',
    background: 'linear-gradient(45deg, #00c853, #64dd17)',
  },
  release: {
    label: 'In Release',
    background: 'linear-gradient(45deg, #ff9100, #ff6d00)',
  },
  completed: {
    label: 'Completed',
    background: 'linear-gradient(45deg, #607d8b, #90a4ae)',
  },
};

const StyledChip = styled(Chip)(() => ({
  padding: '0 10px',
  height: 28,
  borderRadius: '16px',
  fontWeight: 600,
  color: 'white',
  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  '& .MuiChip-icon': {
    marginLeft: 0,
    marginRight: 0,
  },
}));

const PulseCircle = styled('span')(() => ({
  width: 10,
  height: 10,
  backgroundColor: '#ff1744',
  boxShadow: '0 0 6px 2px rgba(255, 23, 68, 0.7)',
  borderRadius: '50%',
  animation: 'pulse 1.5s infinite ease-in-out',
  opacity: 0.9,
  position: 'relative',
  margin: 0,

  '@keyframes pulse': {
    '0%': {
      transform: 'scale(0.9)',
      opacity: 0.9,
    },
    '50%': {
      transform: 'scale(1.4)',
      opacity: 0.5,
    },
    '100%': {
      transform: 'scale(0.9)',
      opacity: 0.9,
    },
  },
}));

interface StatusChipProps {
  status: 'live' | 'release' | 'completed' | '';
  sx?: React.CSSProperties;
}

const ProjectStatus: React.FC<StatusChipProps> = ({
  status,
  sx,
}) => {

  return (
    <>
      {status && (
        <div className="absolute top-3 left-4">
          <StyledChip
            label={statusMap[status].label}
            icon={status === 'live' ? <PulseCircle /> : undefined}
            style={{
              background: statusMap[status].background,
              ...sx,
            }}
          />
        </div>
      )}
    </>
  );
};

export default ProjectStatus;
