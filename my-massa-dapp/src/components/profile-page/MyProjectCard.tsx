'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectData } from '@/types';
import MilestoneFormModal from '../projects/AddMilestoneModal';
import ProjectUpdates from '../projects/ProjectUpdates';

interface MyProjectCardProps {
  project: ProjectData;
}
const MyProjectCard: React.FC<MyProjectCardProps> = ({ project }) => {
  const [openAddMilestone, setOpenAddMilestone] = useState<boolean>(false);
  const [openUpdates, setOpenUpdates] = useState<boolean>(false);

  return (
    <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20 shadow-xl overflow-hidden">
      <CardContent className="p-0">
        {/* Project Header */}
        <div className="p-6 border-b border-[#00ff9d]/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {project.image && (
                  <img
                    src={project.image || '/placeholder.svg'}
                    alt={project.name}
                    className="w-12 h-12 rounded-lg object-cover border border-[#00ff9d]/20"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {project.name}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs bg-[#00ff9d]/20 text-[#00ff9d] rounded-full">
                    {project.category}
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm">{project.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenUpdates(true)}
              className="text-[#00ff9d] hover:bg-[#00ff9d]/10"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="p-6 border-b border-[#00ff9d]/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-[#00ff9d]">
                {project.amountRaised}
              </div>
              <div className="text-xs text-slate-400">MAS Raised</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {project.goalAmount}
              </div>
              <div className="text-xs text-slate-400">Goal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {project.supporters}
              </div>
              <div className="text-xs text-slate-400">Supporters</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {Math.round((project.amountRaised / project.goalAmount) * 100)}%
              </div>
              <div className="text-xs text-slate-400">Funded</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-[#0f1629] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#00ff9d] to-[#00cc7d] h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (project.amountRaised / project.goalAmount) * 100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Project Actions */}
        <div className="p-6 border-b border-[#00ff9d]/10">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setOpenAddMilestone(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
            <Button
              variant="outline"
              className="border-[#00ff9d]/30 text-[#00ff9d] hover:bg-[#00ff9d]/10"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Update
            </Button>
          </div>
        </div>
      </CardContent>
      <ProjectUpdates
        open={openUpdates}
        onClose={() => setOpenUpdates(false)}
      />
      <MilestoneFormModal
        open={openAddMilestone}
        onClose={() => setOpenAddMilestone(false)}
        project={project}
      />{' '}
    </Card>
  );
};

export default MyProjectCard;
