import { useEffect, useState } from 'react';
import {
  getVotingSession,
  getVotes,
  voteOnRelease,
  calculateVotingProgress,
  isVotingSessionActive,
  formatPeriodToDate
} from '@/services/votingService'; // or wherever you put this file
import { useAccountStore } from '@massalabs/react-ui-kit';
import { Button, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { Vote, VotingSession } from '@/types/voting';

interface VotingSectionProps {
  vestingId: any
}
const VotingSection : React.FC<VotingSectionProps> = ({vestingId})  => {
  const { connectedAccount } = useAccountStore();
  const [session, setSession] = useState<VotingSession | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!vestingId) return;

    const loadVoting = async () => {
      const sessionData = await getVotingSession(vestingId);
      setSession(sessionData);
      if (sessionData) {
        setIsActive(await isVotingSessionActive(sessionData));
        const allVotes = await getVotes(vestingId);
        setVotes(allVotes);
      }
    };

    loadVoting();
  }, [vestingId]);
  const handleVote = async (support: boolean) => {
    try {
      await voteOnRelease(connectedAccount, vestingId, support);
      alert('Vote submitted!');
      // re-fetch session & votes
      const sessionData = await getVotingSession(vestingId);
      setSession(sessionData);
      const updatedVotes = await getVotes(vestingId);
      setVotes(updatedVotes);
    } catch (err) {
      alert('Error submitting vote');
    }
  };
  if (!session) return <p>Loading voting session...</p>;

  const progress = calculateVotingProgress(session);

  return (
    <Card sx={{ my: 4, backgroundColor: '#11182f', color: '#e0e0e0' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Voting on Fund Release
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Voting from <b>{formatPeriodToDate(session.startPeriod)}</b> to{' '}
          <b>{formatPeriodToDate(session.endPeriod)}</b>
        </Typography>

        <div>
          <Typography>Continue Release: {progress.continuePercentage.toFixed(1)}%</Typography>
          <LinearProgress
            variant="determinate"
            value={progress.continuePercentage}
            sx={{ height: 10, borderRadius: 5, mb: 2 }}
            color="success"
          />
          <Typography>Stop Release: {progress.stopPercentage.toFixed(1)}%</Typography>
          <LinearProgress
            variant="determinate"
            value={progress.stopPercentage}
            sx={{ height: 10, borderRadius: 5 }}
            color="error"
          />
        </div>

        {isActive && (
          <div className="mt-4 space-x-4">
            <Button onClick={() => handleVote(true)} variant="contained" color="success">
              ✅ Vote to Continue
            </Button>
            <Button onClick={() => handleVote(false)} variant="contained" color="error">
              ❌ Vote to Stop
            </Button>
          </div>
        )}

        {!isActive && (
          <Typography sx={{ mt: 2 }} color="warning.main">
            Voting session has ended.
          </Typography>
        )}
        {votes.map((v) => (
  <Typography key={v.voter}>
    {v.voter.slice(0, 6)}...: {v.vote ? '✅' : '❌'} ({v.votingPower} MAS)
  </Typography>
))}
      </CardContent>
    </Card>
  );
}

export default VotingSection
