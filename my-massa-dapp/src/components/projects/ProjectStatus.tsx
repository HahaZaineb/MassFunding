import React from 'react';
import { Chip, styled } from '@mui/material';
import { ProjectData } from '@/types';

const statusMap = {
  live: {
    label: 'Live',
    background: 'linear-gradient(45deg, #00c853, #64dd17)', // fresh green gradient
  },
  release: {
    label: 'In Release',
    background: 'linear-gradient(45deg, #1e88e5, #42a5f5)', // calm blue gradient
  },
  completed: {
    label: 'Completed',
    background: 'linear-gradient(45deg, #6d4c41, #a1887f)', // warm brown gradient
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
  project: ProjectData;
  sx?: React.CSSProperties;
}

const ProjectStatus: React.FC<StatusChipProps> = ({ project, sx }) => {
  const status = getProjectStatus(project);
  const { label, background } = statusMap[status] || statusMap.completed;

  function getProjectStatus(
    project: ProjectData,
  ): 'live' | 'release' | 'completed' {
    let isLocked = true;
    if (project?.creationDate) {
      const createdAt = new Date(project.creationDate);
      const lockDurationDays = 30;
      const now = new Date();
      const lockEndDate = new Date(
        createdAt.getTime() + lockDurationDays * 24 * 60 * 60 * 1000,
      );
      isLocked = now < lockEndDate;
    }

    if (project.amountRaised < project.goalAmount && isLocked) return 'live';
    else if (project.amountRaised === project.goalAmount) return 'release';
    else if (!isLocked) return 'release';
    else return 'completed';
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
      }}
    >
      <StyledChip
        label={label}
        icon={status === 'live' ? <PulseCircle /> : undefined}
        style={{
          background,
          ...sx,
        }}
      />
    </div>
  );
};

export default ProjectStatus;
