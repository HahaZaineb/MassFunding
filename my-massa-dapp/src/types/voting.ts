export interface VotingSession {
  isActive: boolean;
  startPeriod: number;
  totalVotingPower: number;
  stopVotes: number;
}

export interface Vote {
  voter: string;
  votingPower: number;
}

export interface Supporter {
  address: string;
  amount: number;
}

export interface VotingProgress {
  continuePercentage: number;
  stopPercentage: number;
  totalVotes: number;
  totalVotingPower: number;
} 