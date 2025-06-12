import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Info, Loader2 } from 'lucide-react';
import { useAccountStore } from '@massalabs/react-ui-kit';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useParams } from 'react-router-dom';
import Loader from '@/components/Loader';
import { styled } from '@mui/system';
import ProgressBar from '@/components/ProgressBar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProjectById } from '@/store/slices/projectSlice';
import { Alert } from '@mui/material';
import { useToast } from '@/contexts/ToastProvider';
import { fundProject } from '@/services/projectService';
import { formatPeriodsToHumanReadable } from '@/utils/functions';

export function FundPage() {
  const dispatch = useAppDispatch();
  const { connectedAccount } = useAccountStore();
  const { showToast } = useToast();
  const { projectId } = useParams();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { selected, loading } = useAppSelector((state) => state.projects);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
    }
  }, [dispatch, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedAccount) {
      showToast('Please connect your wallet to proceed.', 'error');
      return;
    }
    if (!amount || Number.parseFloat(amount) < 0.1) {
      setError('Please enter a valid donation amount greater than 0.1');
      return;
    }

    if (Number(amount) > Number(selected?.goalAmount)) {
      setError(
        'Please enter a valid donation amount less than ' +
          selected?.goalAmount,
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const projectIdNum = Number(selected?.id);
      const amountInNanoMAS = BigInt(Math.round(parseFloat(amount) * 1e9));
      await fundProject(connectedAccount, projectIdNum, amountInNanoMAS);
      showToast(
        `Your donation of ${amount} MAS has been processed and the vesting schedule has been created.`,
        'success',
      );
    } catch (error) {
      console.error('Failed to donate:', error);
      let errorMessage = 'Failed to process donation. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  const AccentText = styled('span')({
    color: '#00ff9d',
    fontWeight: 500,
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Loader />;
      </div>
    );
  }

  if (!loading && !selected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <p className="text-lg">
          The project you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4">
      <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20 shadow-2xl max-w-xl mx-auto">
        <CardHeader className="border-b border-[#00ff9d]/10">
          <CardTitle className="text-white">
            Donate to <AccentText>{selected?.name}</AccentText>
          </CardTitle>
          <CardDescription className="text-slate-300">
            Support this project with a secure vesting schedule
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Project Progress */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Project Progress
                </label>
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                  <span>Current: {selected?.amountRaised} MAS</span>
                  <span>Goal: {selected?.goalAmount} MAS</span>
                </div>
                <ProgressBar
                  value={
                    selected?.goalAmount && selected?.goalAmount > 0
                      ? Math.min(
                          Math.round(
                            (selected.amountRaised / selected.goalAmount) * 100,
                          ),
                          100,
                        )
                      : 0
                  }
                />
                <div className="text-center text-sm text-slate-400 mt-1">
                  {selected?.goalAmount && selected?.goalAmount > 0
                    ? Math.min(
                        Math.round(
                          (selected.amountRaised / selected.goalAmount) * 100,
                        ),
                        100,
                      )
                    : 0}
                  % funded
                </div>
              </div>

              {/* Vesting Schedule Info */}
              <div className="bg-[#0f1629] p-4 rounded-lg border border-[#00ff9d]/20">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-[#00ff9d]" />
                  Vesting Schedule Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">Lock Period:</span>
                    <div className="text-white font-medium">
                      {formatPeriodsToHumanReadable(
                        Number(selected?.lockPeriod),
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Release Interval:</span>
                    <div className="text-white font-medium">
                      {formatPeriodsToHumanReadable(
                        Number(selected?.releaseInterval),
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Release %:</span>
                    <div className="text-white font-medium">
                      {selected?.releasePercentage}%
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Beneficiary:</span>
                    <div className="text-white font-medium text-xs font-mono">
                      {selected?.beneficiary.slice(0, 8)}...
                      {selected?.beneficiary.slice(-6)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  Your funds will be locked for{' '}
                  {formatPeriodsToHumanReadable(Number(selected?.lockPeriod))},
                  then released {selected?.releasePercentage}% every{' '}
                  {formatPeriodsToHumanReadable(
                    Number(selected?.releaseInterval),
                  )}
                  .
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <label htmlFor="amount" className="text-white font-medium">
                    Donation Amount (MAS)
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 ml-2 text-slate-400"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1a2340] text-white border border-[#00ff9d]/20">
                        <p className="max-w-xs">
                          Amount of MAS tokens to donate. These will be held in
                          a vesting schedule according to the project
                          parameters.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount (e.g., 100)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.1"
                  step="0.1"
                  className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Minimum donation: 0.1 MAS
                </p>
              </div>
              {error && (
                <Alert variant="filled" severity="error">
                  {error}
                </Alert>
              )}

              <div className="mt-6">
                <Button
                  type="submit"
                  className="w-full bg-[#00ff9d] text-slate-900 hover:bg-[#00e68f] transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Donate Now'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}