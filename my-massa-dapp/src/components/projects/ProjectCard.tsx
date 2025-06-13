'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Users,
  Clock,
  Coins,
  ChevronDown,
  ChevronUp,
  History,
  CheckCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectData } from '@/types/project';
import ProgressBar from '../ProgressBar';
import ProjectUpdates from './ProjectUpdates';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  formatPeriodsToHumanReadable,
  getCategoryColor,
  shortenAddress,
} from '@/utils/functions';
import ProjectStatus from './ProjectStatus';
import { getVestingSchedule } from '@/services/vestingScheduleService';
import { VestingScheduleData } from '@/types/vestingSchedule';
import { updateProjectStatus } from '@/store/slices/projectSlice';
import { useAppDispatch } from '@/store/hooks';
import { formatMas } from '@massalabs/massa-web3';

interface ProjectCardProps {
  project: ProjectData & { image?: string };
  showDetails?: boolean;
}

const ProjectCard = ({ project, showDetails = true }: ProjectCardProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const percentFunded = (project.amountRaised / project.goalAmount) * 100;
  const [openProjectUpdates, setOpenProjectUpdates] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [vestingDetails, setVestingDetails] =
    useState<VestingScheduleData | null>(null);
  const [projectStatus, setProjectStatus] = useState<
    'live' | 'release' | 'completed'
  >('live');
  const [nextReleaseDate, setNextReleaseDate] = useState<Date | null>(null);
  const [lockDate, setLockDate] = useState<Date | null>(null);
  const [createdDate, setCreatedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!project?.creationDate) return;

    const createdAt = new Date(project.creationDate);
    const createdAtTimestamp = createdAt.getTime() + 120 * 1000;
    setCreatedDate(new Date(createdAtTimestamp));

    const lockPeriodInMs = Number(project.lockPeriod) * 15 * 1000;
    const lockEnd = new Date(createdAtTimestamp + lockPeriodInMs);
    setLockDate(lockEnd);

    if (
      vestingDetails?.id &&
      vestingDetails?.amountClaimed !== undefined &&
      project.releasePercentage > 0
    ) {
      const totalAmountPerRelease =
        (vestingDetails.totalAmount * project.releasePercentage) / 100;
      const claimedReleases = Math.floor(
        vestingDetails.amountClaimed / totalAmountPerRelease,
      );

      const nextReleaseTimestamp =
        lockEnd.getTime() +
        (claimedReleases + 1) * project.releaseInterval * 15 * 1000;

      setNextReleaseDate(new Date(nextReleaseTimestamp));
    } else {
      setNextReleaseDate(lockEnd);
    }
  }, [project, vestingDetails]);

  useEffect(() => {
    dispatch(updateProjectStatus({ id: project.id, status: projectStatus }));
  }, [project, projectStatus]);

  useEffect(() => {
    if (projectStatus !== 'live') return;

    const createdAt = new Date(project.creationDate || '');
    const lockPeriodInSeconds = Number(project.lockPeriod) * 15; // Convert periods to seconds
    const lockEnd = new Date(
      createdAt.getTime() + 120 * 1000 + lockPeriodInSeconds * 1000,
    );

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = lockEnd.getTime() - now;

      if (distance <= 0) {
        setTimeLeft('Lock period ended');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [project, projectStatus]);

  const getDetailedVestingInfoHandler = async () => {
    const details = await getVestingSchedule(Number(project.vestingScheduleId));
    setVestingDetails(details);
    if (details) {
      console.log(details, 'details');
      const createdAt = new Date(project.creationDate || '');
      const lockPeriodInMs = Number(project.lockPeriod) * 15 * 1000;
      const intervalInMs = project.releaseInterval * 15 * 1000;

      const totalReleases =
        details.totalAmount /
        ((details.totalAmount / 100) * project.releasePercentage);
      const firstReleaseDate = new Date(
        createdAt.getTime() + 120 * 1000 + lockPeriodInMs,
      );
      const lastReleaseDate =
        totalReleases > 0
          ? new Date(
              firstReleaseDate.getTime() + (totalReleases - 1) * intervalInMs,
            )
          : firstReleaseDate;

      const now = new Date();
      const x = project.amountRaised > 0 ? details?.amountClaimed > 0 : true;

      const hasEnded = now >= lastReleaseDate;
      console.log(project.id, hasEnded, x, details.isCompleted, 'eeeeeeeeee');
      if (details?.isCompleted && hasEnded && x) {
        console.log('heeeeere', project.id);
        setProjectStatus('completed');
      }
    }
  };

  useEffect(() => {
    getDetailedVestingInfoHandler();
  }, [project]);

  return (
    <Card className="bg-slate-800/80 border-slate-600 text-white overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border-2 hover:border-emerald-500/50">
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={project.image || '/placeholder.svg'}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <ProjectStatus
          project={project}
          status={projectStatus}
          setStatus={setProjectStatus}
        />
        <div className="absolute top-3 right-4">
          <Badge
            className={`text-white border-0`}
            style={{
              backgroundColor: getCategoryColor(project.category),
              height: 28,
            }}
          >
            {project.category}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="text-white text-xl leading-tight line-clamp-1">
          {project.name}
        </CardTitle>
        <p className="text-slate-300 text-xs mb-2 line-clamp-2">
          Owned By{' '}
          <span className="text-teal-300">
            {shortenAddress(project.beneficiary)}
          </span>
        </p>
        <CardDescription className={!isExpanded ? "text-slate-300 text-sm leading-relaxed line-clamp-2": "text-slate-300 text-sm"}>
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-white">
              {project.amountRaised.toLocaleString()} /{' '}
              {project.goalAmount.toLocaleString()} MAS
            </span>
            <span className="font-bold text-emerald-400">
              {percentFunded.toFixed(2)}%
            </span>
          </div>
          <ProgressBar value={percentFunded} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg">
            <Users className="h-4 w-4 mb-1 text-blue-400" />
            <span className="text-white font-bold text-sm text-center">
              {project.supporters}
            </span>
            <span className="text-slate-400 text-xs">Supporters</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg">
            <Clock className="h-4 w-4 mb-1 text-yellow-400" />
            <span className="text-white font-bold text-sm text-center">
              Every{' '}
              {formatPeriodsToHumanReadable(Number(project.releaseInterval))}
            </span>
            <span className="text-slate-400 text-xs">Interval</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg">
            <Coins className="h-4 w-4 mb-1 text-emerald-400" />
            <span className="text-white font-bold text-sm text-center">
              {project.releasePercentage}%
            </span>
            <span className="text-slate-400 text-xs">Release</span>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden space-y-4"
            >
              {/* More Details about the project */}
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-2">
                <p className="text-white text-sm">
                  <span className="font-semibold">Lock Period:</span>{' '}
                  {formatPeriodsToHumanReadable(Number(project.lockPeriod))}
                </p>
                <p className="text-white text-sm">
                  <span className="font-semibold">Release Interval:</span>{' '}
                  {formatPeriodsToHumanReadable(
                    Number(project.releaseInterval),
                  )}
                </p>
                {createdDate && (
                  <p className="text-white text-sm">
                    <span className="font-semibold">Created At:</span>{' '}
                    {createdDate.toLocaleString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                )}
                {lockDate && (
                  <p className="text-white text-sm">
                    <span className="font-semibold">Lock At:</span>{' '}
                    {lockDate.toLocaleString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                )}
                {vestingDetails &&
                vestingDetails.id &&
                projectStatus === 'release' ? (
                  <div className="text-white text-sm space-y-2">
                    <p>
                      <span className="font-semibold">Amount Claimed:</span>{' '}
                      {formatMas(BigInt(vestingDetails.amountClaimed))} MAS
                    </p>
                    <p>
                      <span className="font-semibold">Next Release:</span>{' '}
                      {nextReleaseDate
                        ? nextReleaseDate.toLocaleString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : 'N/A'}
                    </p>
                    <p>
                      <span className="font-semibold">Total Amount:</span>{' '}
                      {formatMas(BigInt(vestingDetails.totalAmount))} MAS
                    </p>
                  </div>
                ) : (
                  <></>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenProjectUpdates(true)}
                className="w-full text-white border-slate-600 hover:bg-slate-600"
              >
                View Updates
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {projectStatus === 'live' && (
          <div className="w-full p-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-lg">
            <div className="text-center space-y-2">
              <div className="text-teal-400 text-xs font-semibold tracking-wider flex items-center justify-center">
                <Clock
                  className="w-3 h-3 mr-2"
                  stroke="#2dd4bf"
                  fill="none"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                FUNDING CLOSES IN
              </div>
              <div className="flex justify-center space-x-2">
                {timeLeft.split(':').map((unit, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-teal-500/20 blur-[3px] rounded-lg transition-all duration-300 group-hover:blur-[4px]"></div>
                      <div className="relative bg-gray-800 text-teal-300 font-mono font-bold text-sm px-3 py-2 rounded-lg border border-teal-500/30 hover:border-teal-400/50 transition-all duration-200">
                        {unit.padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {projectStatus === 'release' && (
          <div className="w-full p-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-lg">
            <div className="text-center space-y-2">
              <div className="text-[#ff9100] text-xs font-semibold tracking-wider flex items-center justify-center">
                <Clock
                  className="w-3 h-3 mr-2"
                  stroke="#ff9100"
                  fill="none"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                NEXT RELEASE DATE
              </div>
              <div className="relative bg-gray-800 text-[#ff9100] font-mono font-bold text-sm px-4 py-2 rounded-lg border border-[#ff9100]/30 hover:border-[#ff9100]/50 transition-all duration-200 inline-block">
                {nextReleaseDate
                  ? nextReleaseDate.toLocaleString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })
                  : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {projectStatus === 'completed' && (
          <div className="w-full p-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-lg">
            <div className="text-center space-y-2">
              <div className="text-[#90a4ae] text-xs font-semibold tracking-wider flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                TOTAL FUNDS DISTRIBUTED
              </div>
              <div className="relative bg-gray-800 text-[#90a4ae] font-mono font-bold text-sm px-4 py-2 rounded-lg border border-[#90a4ae]/30 hover:border-[#90a4ae]/50 transition-all duration-200 inline-block">
                {vestingDetails?.id != null
                  ? formatMas(BigInt(vestingDetails.amountClaimed))
                  : 'N/A'}{' '}
                MAS
              </div>
            </div>
          </div>
        )}
        {projectStatus === 'live' ? (
          <Button
            onClick={() => navigate(`/fund/${project.id}`)}
            className="w-full bg-[#00ff9d] text-slate-900 hover:bg-[#00e68d] transition-colors flex items-center justify-center"
          >
            <Coins className="h-4 w-4 mr-2" /> Fund This Project
          </Button>
        ) : (
          <Button
            onClick={() => setOpenProjectUpdates(true)}
            className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 text-white font-bold py-3 text-lg shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
          >
            <History className="h-4 w-4 mr-2" />
            View Updates
          </Button>
        )}
        {showDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
            onClick={() => setIsExpanded((current) => !current)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show Less Details
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show More Details
              </>
            )}
          </Button>
        )}
      </CardFooter>
      <ProjectUpdates
        projectId={project.id}
        open={openProjectUpdates}
        onClose={() => setOpenProjectUpdates(false)}
      />
    </Card>
  );
};

export default ProjectCard;