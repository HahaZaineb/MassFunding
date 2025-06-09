import { LinearProgress, linearProgressClasses, LinearProgressProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StyledLinearProgressProps extends LinearProgressProps {
  valuecolor: string;
}

const BorderLinearProgress = styled((props: StyledLinearProgressProps) => (
  <LinearProgress {...props} />
))(({ theme, valuecolor }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[300],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: valuecolor,
  },
}));

const getProgressColor = (value: number): string => {
  if (value < 25) return '#f44336';
  if (value < 50) return '#ff9800';
  if (value < 75) return '#ffeb3b';
  return '#4caf50';
};

const ProgressBar = ({ value }: { value: number }) => {
  const color = getProgressColor(value);

  return (
    <BorderLinearProgress
      variant="determinate"
      value={value}
      valuecolor={color}
    />
  );
};

export default ProgressBar;
