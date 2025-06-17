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
  shortenAddress,
} from '@/utils/functions';
import ProgressBar from '@/components/ProgressBar';
import ProjectStatus from '@/components/projects/ProjectStatus';
import Loader from '@/components/Loader';
import StatCard from '@/components/StatCard';
import { Tooltip } from '@mui/material';
import { VestingScheduleData } from '@/types/vestingSchedule';
import { formatMas } from '@massalabs/massa-web3';
import { motion } from 'framer-motion';
import { calculateProjectDetails } from '@/utils/project';

const ProjectDetailsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const [projectStatus, setProjectStatus] = useState<
    'live' | 'release' | 'completed' | ''
  >('live');
  const { selected: project, loading } = useAppSelector(
    (state) => state.projects,
  );
  const [copied, setCopied] = useState(false);
  const [vestingDetails, setVestingDetails] =
    useState<VestingScheduleData | null>(null);
  const [nextReleaseDate, setNextReleaseDate] = useState<Date | null>(null);
  const [lockDate, setLockDate] = useState<Date | null>(null);
  const [createdDate, setCreatedDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

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
        const details = await calculateProjectDetails(project);
        setCreatedDate(details.createdDate);
        setLockDate(details.lockDate);
        setNextReleaseDate(details.nextReleaseDate);
        setProjectStatus(details.projectStatus);
        setVestingDetails(details.vestingDetails);
        setTimeLeft(details.timeLeft);
      }
    };
    fetchAndSetDetails();
  }, [project]);

  if (loading)
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 w-full min-h-screen">
        <Loader />
      </div>
    );

  const percentFunded = project
    ? (Number(project.amountRaised) / Number(project.goalAmount)) * 100
    : 0;

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
              <p className="text-slate-400 mt-2 flex items-center gap-1">
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
                    )}{' '}
                  </button>
                </Tooltip>
              </p>
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
                  {percentFunded.toFixed(2)}%
                </span>
              </div>
              <ProgressBar value={percentFunded} />
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
                {vestingDetails && vestingDetails.id && projectStatus === 'release' ? (
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
            </motion.div>

            {/* Conditional status display */}
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

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              {projectStatus === 'live' && (
                <Button
                  className="bg-[#00ff9d] hover:bg-[#00e68d] text-slate-900"
                  onClick={() => navigate(`/fund/${project.id}`)}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Fund This Project
                </Button>
              )}
            </div>

            <ProjectUpdates projectId={project.id} />
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectDetailsPage;
