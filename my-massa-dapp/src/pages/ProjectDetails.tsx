import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Coins, Users, CheckCircle, Copy, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProjectById } from '@/store/slices/projectSlice';
import ProjectUpdates from '@/components/projects/ProjectUpdates';
import {
  formatPeriodsToHumanReadable,
  getCategoryColor,
  getTimeLeft,
  shortenAddress,
} from '@/utils/functions';
import ProgressBar from '@/components/ProgressBar';
import ProjectStatus from '@/components/projects/ProjectStatus';
import Loader from '@/components/Loader';
import StatCard from '@/components/StatCard';
import { Tooltip, Typography } from '@mui/material';
import { formatMas } from '@massalabs/massa-web3';
import { motion } from 'framer-motion';
import VotingSection from '@/components/projects/VotingSection';
import { getProjectDetails } from '@/services/projectService';
import { ProjectDetails } from '@/types/project';
import { getProjectCreationDate } from '@/utils/project';
import { BadgeCheck } from 'lucide-react';
import { getProjectSupporters } from '@/services/votingService';
import { Supporter } from '@/types/voting';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';

const ProjectDetailsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { connectedAccount } = useAccountStore();

  const [projectStatus, setProjectStatus] = useState<
    'live' | 'release' | 'completed' | ''
  >('live');
  const { selected: project, loading } = useAppSelector(
    (state) => state.projects,
  );
  const [copied, setCopied] = useState(false);
  const [vestingDetails, setVestingDetails] = useState<ProjectDetails | null>(
    null,
  );
  const [nextReleaseDate, setNextReleaseDate] = useState<Date | null>(null);
  const [lockDate, setLockDate] = useState<Date | null>(null);
  const [createdDate, setCreatedDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [supporters, setSupporters] = useState<Supporter[] | null>(null);
  const [isSupporter, setIsSupporter] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id as string));
    }
  }, [id]);

  useEffect(() => {
    const fetchAndSetDetails = async () => {
      if (project) {
        const projectSupporters = await getProjectSupporters(project.id);
        setSupporters(projectSupporters);

        let status: 'live' | 'release' | 'completed' | '' = '';
        const res = await getProjectDetails(Number(project.id));
        setCreatedDate(getProjectCreationDate(res.createdPeriod));
        if (res.isLocked) {
          status = 'live';
        } else if (
          (!res.isLocked && res.totalAmount === 0) ||
          res.isVestingCompleted
        ) {
          status = 'completed';
        } else if (!res.isLocked) {
          status = 'release';
        } else {
          status = 'live';
        }
        setProjectStatus(status);
        setNextReleaseDate(getProjectCreationDate(res.nextReleasePeriod));
        const lockDate = getProjectCreationDate(res.lockEndPeriod);
        setLockDate(lockDate);

        const timeLeftDate = getTimeLeft(lockDate);
        setTimeLeft(timeLeftDate);
        setVestingDetails(res);
      }
    };

    fetchAndSetDetails();
  }, [project]);

  useEffect(() => {
    if (connectedAccount && supporters && supporters?.length > 0) {
      const match = supporters.some(
        (supporter) => supporter.address === connectedAccount.address,
      );
      setIsSupporter(match);
    } else {
      setIsSupporter(false);
    }
  }, [supporters, connectedAccount]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (lockDate) setTimeLeft(getTimeLeft(lockDate));
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [lockDate]);

  if (loading)
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 w-full min-h-screen">
        <Loader />
      </div>
    );

  return (
    <>
      {project && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 w-full min-h-screen">
          <div className=" max-w-5xl mx-auto px-4 py-8 space-y-6 text-white">
            {/* Project Header */}
            <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg">
              <img
                src={project.image || '/placeholder.svg'}
                alt={project.name}
                className="w-full h-full object-cover"
              />
              <ProjectStatus status={projectStatus} />
              <div className="absolute top-4 right-4">
                <Badge
                  style={{
                    backgroundColor: getCategoryColor(project.category),
                    height: 28,
                  }}
                >
                  {project.category}
                </Badge>
              </div>
            </div>

            {/* Title and Description */}
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>

              {/* Owned by and copy icon */}
              <p className="text-slate-400 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1">
                  Owned by{' '}
                  <span className="text-teal-300">
                    {shortenAddress(project.beneficiary)}
                  </span>
                  <Tooltip title={copied ? 'Copied!' : 'Copy address'}>
                    <button
                      onClick={() => handleCopy(project.beneficiary)}
                      className="text-teal-300 hover:text-teal-400 transition"
                    >
                      {copied ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-teal-300" />
                      )}
                    </button>
                  </Tooltip>
                </span>

                {createdDate && (
                  <span className="flex items-center gap-1">
                    📅 Created on{' '}
                    <span className="text-slate-300 font-medium">
                      {createdDate.toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </span>
                )}
              </p>

              {/* Description */}
              <p className="text-slate-300 mt-4 text-lg">
                {project.description}
              </p>
            </div>

            {/* Funding Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {project.amountRaised} / {project.goalAmount} MAS
                </span>
                <span className="font-bold text-emerald-400">
                  {(
                    (Number(project.amountRaised) /
                      Number(project.goalAmount)) *
                    100
                  ).toFixed(2)}
                  %
                </span>
              </div>
              <ProgressBar
                value={Math.min(
                  (Number(project.amountRaised) / Number(project.goalAmount)) *
                    100,
                  100,
                )}
              />
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                icon={<Users className="text-blue-400" />}
                label="Supporters"
                value={project.supporters}
              />
              <StatCard
                icon={<Clock className="text-yellow-400" />}
                label="Interval"
                value={
                  'Every ' +
                  formatPeriodsToHumanReadable(Number(project.releaseInterval))
                }
              />
              <StatCard
                icon={<Coins className="text-emerald-400" />}
                label="Release %"
                value={`${project.releasePercentage}%`}
              />
            </div>
            {/* Vesting Info Section */}
            {projectStatus === 'release' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden bg-slate-800/40 rounded-xl border border-slate-600 shadow-inner backdrop-blur-lg p-6"
              >
                <div>
                  <Typography variant="h5" fontWeight={700}>
                    ⏳ Vesting Schedule
                  </Typography>
                  <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 mt-6">
                    <MiniCard
                      icon="💰"
                      label="Amount Claimed"
                      value={`${
                        vestingDetails?.claimedAmount
                          ? formatMas(BigInt(vestingDetails?.claimedAmount))
                          : 0
                      } MAS`}
                    />
                    <MiniCard
                      icon="📤"
                      label="Next Release"
                      value={
                        nextReleaseDate
                          ? nextReleaseDate.toLocaleString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : 'N/A'
                      }
                    />
                    <MiniCard
                      icon="💼"
                      label="Total Amount"
                      value={`${
                        vestingDetails?.totalAmount
                          ? formatMas(BigInt(vestingDetails.totalAmount))
                          : 0
                      } MAS`}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            {projectStatus === 'live' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl border border-cyan-500/20 shadow-2xl backdrop-blur-xl p-8"
              >
                <div className="space-y-8 text-center text-white">
                  {/* Section Title */}
                  <Typography variant="h5" fontWeight={700}>
                    {' '}
                    🚀 Support This Project
                  </Typography>

                  {/* Locked Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-300">
                    <div className="flex flex-col items-center">
                      <span className="text-cyan-400 text-xs font-semibold tracking-wide uppercase">
                        🔒 Locked At
                      </span>
                      <span className="mt-2 font-mono text-sm">
                        {lockDate?.toLocaleString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-cyan-400 text-xs font-semibold tracking-wide uppercase">
                        📅 Lock Period
                      </span>
                      <span className="mt-2 font-mono text-sm">
                        {formatPeriodsToHumanReadable(
                          Number(project.lockPeriod),
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Countdown Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center text-cyan-300 text-xs font-semibold tracking-widest uppercase">
                      <Clock className="w-5 h-5 mr-2" strokeWidth={2} />
                      Funding closes in
                    </div>

                    <div className="flex justify-center gap-4">
                      {timeLeft.split(' ').map((unit, index) => {
                        const [_, num, label] =
                          unit.match(/(\d+)([a-z])/i) || [];
                        const readable =
                          label === 'd'
                            ? 'Days'
                            : label === 'h'
                            ? 'Hrs'
                            : label === 'm'
                            ? 'Min'
                            : label === 's'
                            ? 'Sec'
                            : '';

                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            <div className="relative group">
                              <div className="absolute inset-0 bg-cyan-500/20 blur-sm rounded-lg group-hover:blur-md transition-all duration-300"></div>
                              <div className="relative bg-black/40 text-cyan-300 font-mono font-bold text-lg px-4 py-3 rounded-xl border border-cyan-500/30 shadow-md hover:border-cyan-400/50 transition-all duration-200">
                                {num?.padStart(2, '0') ?? '00'}
                              </div>
                            </div>
                            <span className="text-[11px] text-cyan-400 mt-1 font-medium">
                              {readable}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fund Button */}
                  <div className="pt-4">
                    <Button
                      className="bg-[#00ff9d] hover:bg-[#00e68d] text-slate-900"
                      onClick={() => navigate(`/fund/${project.id}`)}
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      Fund This Project
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {projectStatus === 'completed' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl border border-green-500/20 shadow-2xl backdrop-blur-xl p-8"
              >
                <div className="space-y-8 text-center text-white">
                  {/* Section Title */}
                  <h2 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-wide bg-gradient-to-r from-green-400 to-lime-400 text-transparent bg-clip-text">
                    <BadgeCheck
                      className="w-6 h-6 text-green-400"
                      strokeWidth={2}
                    />
                    Project Completed
                  </h2>

                  {/* Completion Message */}
                  {project.amountRaised > 0 ? (
                    <>
                      <div className="flex items-center justify-center text-green-300 text-sm font-semibold tracking-wide uppercase">
                        <CheckCircle className="w-5 h-5 mr-2" strokeWidth={2} />
                        All funds successfully distributed
                      </div>

                      {/* Total Claimed */}
                      <div className="flex flex-col items-center space-y-2">
                        <span className="text-xs text-green-400 uppercase tracking-widest">
                          Total Claimed
                        </span>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-green-500/20 blur-[3px] rounded-xl transition-all duration-300 group-hover:blur-md"></div>
                          <div className="relative bg-black/40 text-green-300 font-mono text-lg font-bold px-6 py-3 rounded-xl border border-green-500/30 hover:border-green-400/50 transition-all duration-200">
                            {vestingDetails?.claimedAmount != null
                              ? `${formatMas(
                                  BigInt(vestingDetails.claimedAmount),
                                )} MAS`
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center text-yellow-300 text-sm font-semibold tracking-wide uppercase">
                        <CheckCircle className="w-5 h-5 mr-2" strokeWidth={2} />
                        Project closed with no raised funds
                      </div>
                      <p className="text-sm text-slate-300">
                        The funding period ended but no supporters contributed
                        to this project.
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {(projectStatus === 'release' || projectStatus === 'completed') && (
              <VotingSection
                vestingId={project?.vestingScheduleId}
                canVote={isSupporter}
              />
            )}
            <ProjectUpdates projectId={project.id} />
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectDetailsPage;

interface MiniCardProps {
  icon: string;
  label: string;
  value: string;
}
const MiniCard: React.FC<MiniCardProps> = ({ icon, label, value }) => (
  <div className="p-4 rounded-xl border border-slate-600 bg-gradient-to-br from-slate-700/30 to-slate-800/50 backdrop-blur-md transition hover:shadow-lg hover:border-orange-400 group">
    <div className="flex items-center gap-2 mb-3 text-orange-400">
      <div className="text-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-sm font-medium uppercase tracking-wide text-orange-300">
        {label}
      </span>
    </div>
    <p className="text-base text-slate-100 font-semibold truncate">{value}</p>
  </div>
);
