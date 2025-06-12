'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ProjectData } from '@/types';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../ProgressBar';
import {
  
  Clock,
  Coins,
  History,
 
  Users,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { getCategoryColor } from '@/utils/functions';
import ProjectStatus from './ProjectStatus';
import ProjectUpdates from './ProjectUpdates';
import { useEffect, useState } from 'react';
import {
  DetailedVestingInfo,
  getDetailedVestingInfo,
  formatPeriodsToHumanReadable,
  getCurrentMassaPeriod,
  isProjectVestingCompleted,
} from '@/services/contract-service';

interface ProjectMiniCardProps {
  project: ProjectData & { image?: string };
  showFundBtn?: boolean;
}

const ProjectMiniCard = ({
  project,
  showFundBtn = true,
}: ProjectMiniCardProps) => {
  const navigate = useNavigate();
  const percentFunded = (project.amountRaised / project.goalAmount) * 100;
  const [openProjectUpdates, setOpenProjectUpdates] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [vestionDetails, setVestingDetails] =
    useState<DetailedVestingInfo | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMassaPeriod, setCurrentMassaPeriod] = useState<number | null>(null);
  const [isVestingActuallyCompleted, setIsVestingActuallyCompleted] = useState<boolean>(false);

  function getProjectStatus(
    project: ProjectData,
    currentPeriod: number | null
  ): 'funding_active' | 'lock_period_ended' | 'funded_and_locked' {
    const isFundedToGoal = project.amountRaised >= project.goalAmount;

    let isLockPeriodActive = true;
    if (project?.creationPeriod !== undefined && project.lockPeriod !== undefined && currentPeriod !== null) {
      const lockEndPeriod = project.creationPeriod + Number(project.lockPeriod); 
      isLockPeriodActive = currentPeriod < lockEndPeriod;
    } else {
        isLockPeriodActive = false;
    }

    if (isLockPeriodActive) {
      if (isFundedToGoal) {
        return 'funded_and_locked';
      } else {
        return 'funding_active';
      }
    } else {
      return 'lock_period_ended';
    }
  }

  useEffect(() => {
    const createdAt = new Date(project.creationDate || '');
    const lockPeriodInSeconds = Number(project.lockPeriod) * 15; // Convert periods to seconds
    const lockEnd = new Date(
      createdAt.getTime() + lockPeriodInSeconds * 1000,
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

    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [project]);

  const getDetailedVestingInfoHandler = async () => {
    const details = await getDetailedVestingInfo(Number(project.id));
    console.log(details, 'details...');
    setVestingDetails(details);

    const currentPeriod = await getCurrentMassaPeriod();
    setCurrentMassaPeriod(currentPeriod);

    const completed = await isProjectVestingCompleted(Number(project.id));
    setIsVestingActuallyCompleted(completed);
  };

  useEffect(() => {
    getDetailedVestingInfoHandler();
  }, [project]);

  const projectLifecycleStatus = getProjectStatus(project, currentMassaPeriod);

  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-lg border border-[#00ff9d]/20 bg-[#1a1a2e] shadow-lg hover:shadow-[0_0_15px_rgba(0,255,157,0.3)] transition-all duration-300"
    >
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={project.image || '/placeholder.svg'}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <ProjectStatus project={project} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent opacity-70"></div>
        <div
          style={{ backgroundColor: `${getCategoryColor(project.category)}` }}
          className={`absolute top-3 right-3 bg-[#00ff9d] text-[#0f1629] font-semibold text-xs px-2 py-1 rounded`}
        >
          {project.category}
        </div>
      </div>

      {/* Project Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#00ff9d] mb-2 line-clamp-1">
          {project.name}
        </h3>
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white">
              {project.amountRaised} / {project.goalAmount} MAS
            </span>
            <span className="text-[#ffffff]">{percentFunded.toFixed(2)}%</span>
          </div>
          <ProgressBar value={percentFunded} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg">
            <Users className="h-4 w-4 mb-1 text-blue-400" />
            <span className="text-white text-center font-bold text-xs">
              {project.supporters}
            </span>
            <span className="text-slate-400 text-xs">Supporters</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg">
            <Clock className="h-4 w-4 mb-1 text-yellow-400" />
            <span className="text-white text-center font-bold text-xs">
              Every {formatPeriodsToHumanReadable(Number(project.releaseInterval))}
            </span>
            <span className="text-slate-400 text-xs">Interval</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg">
            <Coins className="h-4 w-4 mb-1 text-emerald-400" />
            <span className="text-white text-center font-bold text-xs">
              {project.releasePercentage}%
            </span>
            <span className="text-slate-400 text-xs">Release</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {projectLifecycleStatus === 'funding_active' && (
            <div className="w-full p-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-lg">
              <div className="text-center space-y-2">
                <div className="text-teal-400 text-xs font-semibold tracking-wider flex items-center justify-center">
                  <svg
                    className="w-3 h-3 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
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

          {projectLifecycleStatus === 'lock_period_ended' && !isVestingActuallyCompleted && (
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
                  {vestionDetails?.nextRelease
                    ? new Date().toLocaleString(undefined, {
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

          {projectLifecycleStatus === 'lock_period_ended' && isVestingActuallyCompleted && (
            <div className="w-full p-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-lg">
              <div className="text-center space-y-2">
                <div className="text-[#90a4ae] text-xs font-semibold tracking-wider flex items-center justify-center">
                  <History className="w-4 h-4 mr-2" />
                  TOTAL FUNDS DISTRIBUTED
                </div>
                <div className="relative bg-gray-800 text-[#90a4ae] font-mono font-bold text-sm px-4 py-2 rounded-lg border border-[#90a4ae]/30 hover:border-[#90a4ae]/50 transition-all duration-200 inline-block">
                  {project.totalAmountRaisedAtLockEnd != null ? project.totalAmountRaisedAtLockEnd : 'N/A'} MAS
                </div>
              </div>
            </div>
          )}

          {projectLifecycleStatus === 'funding_active' ? (
            <Button
              onClick={() => navigate(`/fund/${project.id}`)}
              className="w-full bg-[#00ff9d] text-slate-900 hover:bg-[#00e68d] transition-colors flex items-center justify-center py-3 text-base font-semibold"
            >
              <Coins className="h-5 w-5 mr-2" /> Fund This Project
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-white border-slate-600 hover:bg-slate-600 flex items-center justify-center"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" /> Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" /> Show More Details
              </>
            )}
          </Button>
        </div>
      </div>
      <ProjectUpdates
        projectId={project.id}
        open={openProjectUpdates}
        onClose={() => setOpenProjectUpdates(false)}
      />
    </motion.div>
  );
};

export default ProjectMiniCard;
