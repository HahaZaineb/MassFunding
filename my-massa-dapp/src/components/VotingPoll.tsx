import React, { useState, useEffect } from 'react';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { voteOnRelease, getVotingSession, getVotes, calculateVotingProgress } from '@/services/votingService';
import { formatPeriodToDate } from '@/services/votingService';
import { Vote, VotingSession } from '@/types/voting';

interface VotingPollProps {
  vestingId: string | null | undefined;
  projectId: string;
}

export const VotingPoll: React.FC<VotingPollProps> = ({ vestingId, projectId }) => {
  const { connectedAccount } = useAccountStore();
  const [session, setSession] = useState<VotingSession | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchVotingData = async () => {
      try {
        const [sessionData, votesData] = await Promise.all([
          getVotingSession(vestingId),
          getVotes(vestingId)
        ]);
        setSession(sessionData);
        setVotes(votesData);
        
        // Check if current user has voted
        if (connectedAccount) {
          const userVote = votesData.find(v => v.voter === connectedAccount.address);
          setHasVoted(!!userVote);
        }
      } catch (err) {
        setError('Failed to load voting data');
        console.error(err);
      }
    };

    fetchVotingData();
    const interval = setInterval(fetchVotingData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [vestingId, connectedAccount]);

  const handleVote = async (vote: boolean) => {
    if (!connectedAccount) {
      setError('Please connect your wallet to vote');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await voteOnRelease(connectedAccount, vestingId, vote);
      setHasVoted(true);
      // Refresh voting data
      const [sessionData, votesData] = await Promise.all([
        getVotingSession(vestingId),
        getVotes(vestingId)
      ]);
      setSession(sessionData);
      setVotes(votesData);
    } catch (err) {
      setError('Failed to submit vote');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null; // Don't show anything if there's no active session
  }

  const progress = calculateVotingProgress(session);
  const isActive = session.isActive;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Voting Session</h2>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Start: {formatPeriodToDate(Number(session.startPeriod))}</span>
          <span>End: {formatPeriodToDate(Number(session.endPeriod))}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress.continuePercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Continue: {progress.continuePercentage.toFixed(1)}%</span>
          <span>Stop: {progress.stopPercentage.toFixed(1)}%</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isActive && !hasVoted && connectedAccount && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => handleVote(true)}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Voting...' : 'Continue Release'}
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Voting...' : 'Stop Release'}
          </button>
        </div>
      )}

      {!isActive && (
        <div className="text-center text-gray-600">
          Voting session has ended
        </div>
      )}

      {hasVoted && (
        <div className="text-center text-green-600 font-medium">
          You have already voted
        </div>
      )}

      {!connectedAccount && (
        <div className="text-center text-gray-600">
          Connect your wallet to vote
        </div>
      )}
    </div>
  );
}; 