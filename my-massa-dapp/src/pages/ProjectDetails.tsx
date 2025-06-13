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

const ProjectDetailsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const [status, setStatus] = useState<'live' | 'release' | 'completed'>(
    'live',
  );
  const { selected: project, loading } = useAppSelector(
    (state) => state.projects,
  );
  const [copied, setCopied] = useState(false);

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
              <ProjectStatus
                project={project}
                status={status}
                setStatus={setStatus}
              />
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

            {/* Conditional status display */}
            {status === 'release' && (
              <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-600">
                <h3 className="text-[#ff9100] font-semibold flex items-center mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Next Release Date
                </h3>
                <p>
                  {new Date().toLocaleString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}

            {status === 'completed' && (
              <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-600">
                <h3 className="text-[#90a4ae] font-semibold flex items-center mb-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Total Funds Distributed
                </h3>
                <p>{12} MAS</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              {status === 'live' && (
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
