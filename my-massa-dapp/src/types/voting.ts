export interface VotingSession {
  isActive: boolean;
  startPeriod: number;
  endPeriod: number;
  totalVotingPower: number;
  continueVotes: number;
  stopVotes: number;
}

export interface Vote {
  voter: string;
  votingPower: number;
  vote: boolean; // true for continue, false for stop
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