import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Info, Loader2 } from 'lucide-react';
import { useAccountStore, ConnectMassaWallet } from '@massalabs/react-ui-kit';
import {
  fundProject,
} from '../services/contract-service';
import { useToast } from '@/components/ui/use-toast';
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
import { ProjectData } from '@/types';
import { useProjects } from '@/context/project-context';
import { useParams } from 'react-router-dom';
import Loader from '@/components/Loader';
import { styled } from '@mui/system';
import ProgressBar from '@/components/ProgressBar';
import { shortenAddress } from '@/utils/functions';

export function FundPage() {
  const { connectedAccount } = useAccountStore();
  const { toast } = useToast();
  const { projectId } = useParams();
  const { projects } = useProjects();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projects.length > 0 && projectId) {
      const selectedProject = projects.find(
        (p) => p.id === projectId.toString(),
      );
      setProject(selectedProject || null);
    }
  }, [projectId, projects]);

  useEffect(() => {
    if (project !== undefined) {
      setIsLoading(false);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid donation amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (!connectedAccount) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to make a donation.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const projectIdNum = Number(project?.id);
      if (isNaN(projectIdNum)) {
        throw new Error('Invalid project ID.');
      }
      const amountInNanoMAS = BigInt(Math.round(parseFloat(amount) * 1e9));
      await fundProject(
        connectedAccount,
        projectIdNum,
        amountInNanoMAS
      );
      toast({
        title: 'Donation Successful!',
        description: `Your donation of ${amount} MAS has been processed and the vesting schedule has been created.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to donate:', error);

      let errorMessage = 'Failed to process donation. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: 'Donation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const AccentText = styled('span')({
    color: '#00ff9d',
    fontWeight: 500,
  });

  if (isLoading || !project || !connectedAccount) {
    if (!isLoading && !project) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
          <p className="text-lg">The project you are looking for does not exist or has been removed.</p>
        </div>
      );
    }
    return <Loader />;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4">
      <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20 shadow-2xl max-w-xl mx-auto">
        <CardHeader className="border-b border-[#00ff9d]/10">
          <CardTitle className="text-white">
            Donate to <AccentText>{project.name}</AccentText>
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
                  <span>Current: {project.amountRaised} MAS</span>
                  <span>Goal: {project.goalAmount} MAS</span>
                </div>
                <ProgressBar
                  value={Math.min(
                    Math.round(
                      (project.amountRaised / project.goalAmount) * 100,
                    ),
                    100,
                  )}
                />
                <div className="text-center text-sm text-slate-400 mt-1">
                  {Math.min(
                    Math.round(
                      (project.amountRaised / project.goalAmount) * 100,
                    ),
                    100,
                  )}
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
                      {project.lockPeriod} days
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Release Interval:</span>
                    <div className="text-white font-medium">
                      {project.releaseInterval} days
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Release %:</span>
                    <div className="text-white font-medium">
                      {project.releasePercentage}%
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Beneficiary:</span>
                    <div className="text-white font-medium text-xs font-mono">
                      {project.beneficiary.slice(0, 8)}...
                      {project.beneficiary.slice(-6)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  Your funds will be locked for {project.lockPeriod} days, then
                  released {project.releasePercentage}% every{' '}
                  {project.releaseInterval} days.
                </div>
              </div>

              {/* Donation Amount */}
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
                  required
                  min="0.1"
                  step="0.1"
                  className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Minimum donation: 0.1 MAS
                </p>
              </div>

              {/* Connected Account Info */}
              {connectedAccount && (
                <div className="text-white text-sm">
                  Connected Wallet:{' '}
                  <span className="font-mono text-[#00ff9d]">
                    {shortenAddress(connectedAccount.address?.toString() || '')}
                  </span>
                </div>
              )}

              {/* Connect Wallet / Submit Button */}
              <div className="mt-6">
                {!connectedAccount ? (
                  <ConnectMassaWallet />
                ) : (
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
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}