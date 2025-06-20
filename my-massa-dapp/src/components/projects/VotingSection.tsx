'use client';

import { useEffect, useState } from 'react';
import {
  getVotingSession,
  getVotes,
  voteOnRelease,
  calculateVotingProgress,
  isVotingSessionActive,
} from '@/services/votingService';
import { useAccountStore } from '@massalabs/react-ui-kit';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  Paper,
  Divider,
  Badge,
} from '@mui/material';
import { CheckCircle, ThumbsDown } from 'lucide-react';
import { Vote, VotingSession } from '@/types/voting';
import { useToast } from '@/contexts/ToastProvider';
import { formatMas } from '@massalabs/massa-web3';

interface VotingSectionProps {
  vestingId: any;
  canVote: boolean;
}

const VotingSection: React.FC<VotingSectionProps> = ({
  vestingId,
  canVote,
}) => {
  const { showToast } = useToast();

  const { connectedAccount } = useAccountStore();
  const [session, setSession] = useState<VotingSession | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

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

  const handleVote = async () => {
    try {
      await voteOnRelease(connectedAccount, vestingId);
      showToast('Vote submitted!', 'success');
      const sessionData = await getVotingSession(vestingId);
      setSession(sessionData);
      const updatedVotes = await getVotes(vestingId);
      setVotes(updatedVotes);
      if (connectedAccount) {
        const userVote = updatedVotes.find(
          (v) => v.voter === connectedAccount.address,
        );
        setHasVoted(!!userVote);
      }
    } catch (err) {
      showToast('Error submitting vote', 'error');
    }
  };

  useEffect(() => {
    if (connectedAccount) {
      const userVote = votes.find((v) => v.voter === connectedAccount.address);
      setHasVoted(!!userVote);
    }
  }, [connectedAccount, votes]);

  if (!session) return null;

  const progress = calculateVotingProgress(session);

  return (
    <Card
      sx={{
        my: 4,
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      <CardContent>
        <Stack spacing={4}>
          {/* Header */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              flexWrap="wrap"
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  🗳️ Fund Release Voting
                </Typography>
              </Box>

              {!isActive && (
                <Chip
                  label="Voting session has ended"
                  color="warning"
                  sx={{
                    fontWeight: 500,
                    px: 2,
                    backgroundColor: '#f59e0b33',
                    color: '#fbbf24',
                    height: 28,
                    mt: { xs: 2, sm: 0 },
                  }}
                />
              )}
            </Stack>
          </Box>

          {/* Redesigned Progress Bars */}
          <Stack display={'flex'} flexDirection={'row'} flexWrap="wrap" gap={2}>
            {/* Continue Option */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: '#152033',
                border: '1px solid #22c55e33',
                flex: 1,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="success.main"
                >
                  ✅ Vote to Continue
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="success.main"
                >
                  {progress.continuePercentage.toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress.continuePercentage}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#1e293b',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#22c55e',
                  },
                }}
              />
            </Box>

            {/* Stop Option */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: '#1e1b28',
                border: '1px solid #ef444433',
                flex: 1,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="body2" fontWeight={600} color="error.main">
                  ❌ Vote to Stop
                </Typography>
                <Typography variant="body2" fontWeight={600} color="error.main">
                  {progress.stopPercentage.toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress.stopPercentage}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#1e293b',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ef4444',
                  },
                }}
              />
            </Box>
          </Stack>
          {/* Voting Buttons */}
          {isActive && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {canVote ? (
                hasVoted ? (
                  <Badge
                    style={{
                      background: 'linear-gradient(to right, #334155, #475569)',
                      color: '#00ff9d',
                      height: 32,
                      padding: '0 12px',
                      borderRadius: '999px',
                      alignItems: 'center',
                      fontWeight: 500,
                      fontSize: 13,
                      letterSpacing: 0.5,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    You Have Already Voted
                  </Badge>
                ) : (
                  <Button
                    fullWidth
                    onClick={() => handleVote()}
                    variant="contained"
                    color="error"
                    startIcon={<ThumbsDown size={18} />}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      py: 1.5,
                      boxShadow: '0 0 0 1px #b91c1c',
                    }}
                  >
                    Vote to Stop
                  </Button>
                )
              ) : (
                <Badge
                  style={{
                    background: 'linear-gradient(to right, #1e293b, #334155)',
                    color: '#f87171',
                    height: 32,
                    padding: '0 12px',
                    borderRadius: '999px',
                    alignItems: 'center',
                    fontWeight: 500,
                    fontSize: 13,
                    letterSpacing: 0.5,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  🔒 Locked — Support to Vote
                </Badge>
              )}
            </Stack>
          )}

          <Divider sx={{ borderColor: '#334155' }} />

          {/* Voter List */}
          <Box>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ mb: 2, color: '#f1f5f9' }}
            >
              🧾 Voter List
            </Typography>

            {votes.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  py: 4,
                  px: 2,
                  backgroundColor: '#1e293b',
                  borderRadius: 2,
                  border: '1px dashed #475569',
                }}
              >
                <ThumbsDown size={32} stroke="#94a3b8" />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#94a3b8',
                    mt: 1,
                    fontWeight: 500,
                    textAlign: 'center',
                  }}
                >
                  {isActive
                    ? 'No votes yet.'
                    : 'Voting session ended with no votes submitted.'}
                </Typography>
                {isActive && (
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748b', textAlign: 'center', mt: 0.5 }}
                  >
                    Be the first to support or stop the fund release.
                  </Typography>
                )}
              </Box>
            ) : (
              <Stack spacing={1}>
                {votes.map((v) => {
                  const isSupport = false;
                  return (
                    <Paper
                      key={v.voter}
                      elevation={0}
                      sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: isSupport ? '#022c22' : '#2f1d1d',
                        borderRadius: 2,
                        border: `1px solid ${
                          isSupport ? '#16a34a55' : '#dc262655'
                        }`,
                        color: '#f1f5f9',
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          backgroundColor: isSupport ? '#064e3b' : '#4c1d1d',
                        },
                      }}
                    >
                      <Box>
                        <Typography
                          fontWeight={600}
                          sx={{ fontSize: '0.875rem' }}
                        >
                          {v.voter.slice(0, 6)}...{v.voter.slice(-4)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {isSupport ? '✅ Continue' : '❌ Stop'}
                        </Typography>
                      </Box>

                      <Typography
                        fontWeight={600}
                        sx={{
                          fontSize: '0.875rem',
                          color: isSupport ? 'success.light' : 'error.light',
                        }}
                      >
                        {formatMas(BigInt(v.votingPower))} MAS
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default VotingSection;
