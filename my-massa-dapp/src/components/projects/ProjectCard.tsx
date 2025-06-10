'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ThumbsUp,
  Users,
  Clock,
  Coins,
  ChevronDown,
  ChevronUp,
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
import { ProjectData } from '@/types';
import ProgressBar from '../ProgressBar';
import ProjectUpdates from './ProjectUpdates';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategoryColor } from '@/utils/functions';
import { Chip } from '@mui/material';

interface ProjectCardProps {
  project: ProjectData & { image?: string };
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();
  const percentFunded = (project.amountRaised / project.amountNeeded) * 100;
  const [openProjectUpdates, setOpenProjectUpdates] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'success';
      case 'release':
        return 'warning';
      case 'vesting':
        return 'info';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'live':
        return 'Live';
      case 'release':
        return 'In Release';
      case 'vesting':
        return 'Vesting';
      case 'completed':
        return 'Completed';
      default:
        return '';
    }
  };
  function getProjectStatus(
    project: ProjectData,
  ): 'live' | 'release' | 'vesting' | 'completed' {
    const now = Date.now();
    const lockEnd = Date.now();
    const vestingEnd = Date.now();

    if (project.amountRaised < project.goalAmount) {
      return 'live';
    } else if (now < lockEnd) {
      return 'release';
    } else if (now < vestingEnd) {
      return 'vesting';
    } else {
      return 'completed';
    }
  }
  return (
    <Card className="bg-slate-800/80 border-slate-600 text-white overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border-2 hover:border-emerald-500/50">
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={project.image || '/placeholder.svg'}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <Chip
          label={getStatusLabel(getProjectStatus(project))}
          color={getStatusColor(getProjectStatus(project))}
          size="small"
          className="absolute top-4 left-4"
        />
        <div className="absolute top-4 right-4">
          <Badge
            className={`text-white border-0`}
            style={{ backgroundColor: getCategoryColor(project.category) }}
          >
            {project.category}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="text-white text-xl leading-tight line-clamp-1">
          {project.name}
        </CardTitle>
        <CardDescription className="text-slate-300 text-sm leading-relaxed line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-white">
              {project.amountRaised.toLocaleString()} /{' '}
              {project.amountNeeded.toLocaleString()} MAS
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
              Every {project.releaseInterval} days
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
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Beneficiary:</span>
                  <span className="font-mono text-xs text-white bg-slate-600 px-2 py-1 rounded">
                    {project.beneficiary.slice(0, 8)}...
                    {project.beneficiary.slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Lock Period:</span>
                  <span className="text-white font-medium">
                    {project.lockPeriod} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Release Interval:</span>
                  <span className="text-white font-medium">
                    {project.releaseInterval} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Release Percentage:</span>
                  <span className="text-white font-medium">
                    {project.releasePercentage}%
                  </span>
                </div>
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

      <CardFooter className="flex flex-col gap-3 pt-4">
        <Button
          onClick={() => navigate('/fund/' + project.id)}
          className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 text-white font-bold py-3 text-lg shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Fund This Project
        </Button>

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
