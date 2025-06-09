'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ProjectData } from '@/types';
import { getCategoryColor } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../ProgressBar';
import { Clock, Coins, Users } from 'lucide-react';

interface ProjectMiniCardProps {
  project: ProjectData & { image?: string };
  showFundBtn?: boolean
}

const ProjectMiniCard = ({ project, showFundBtn = true }: ProjectMiniCardProps) => {
  const navigate = useNavigate();
  const percentFunded = (project.amountRaised / project.amountNeeded) * 100;

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
              {project.amountRaised} / {project.amountNeeded} MAS
            </span>
            <span className="text-[#ffffff]">{percentFunded.toFixed(0)}%</span>
          </div>
          <ProgressBar value={percentFunded}/>
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
              Every {project.releaseInterval} days
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

        {showFundBtn && <Button
          onClick={() => navigate('/projects')}
          className="w-full bg-[#00ff9d] mt-3 hover:bg-[#00ff9d]/90 text-[#0f1629] font-medium"
        >
          Fund This Project
        </Button>}
      </div>
    </motion.div>
  );
};

export default ProjectMiniCard;