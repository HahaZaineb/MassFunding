import React from 'react';
import { LinearProgress, linearProgressClasses, LinearProgressProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StyledLinearProgressProps extends LinearProgressProps {
  valueColor: string;
}

const BorderLinearProgress = styled((props: StyledLinearProgressProps) => (
  <LinearProgress {...props} />
))(({ theme, valueColor }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[300],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: valueColor,
  },
}));

const getProgressColor = (value: number): string => {
  if (value < 25) return '#f44336'; // red
  if (value < 50) return '#ff9800'; // orange
  if (value < 75) return '#ffeb3b'; // yellow
  return '#4caf50'; // green
};

const ProgressBar = ({ value }: { value: number }) => {
  const color = getProgressColor(value);

  return (
    <BorderLinearProgress
      variant="determinate"
      value={value}
      valueColor={color}
    />
  );
};

export default ProgressBar;
