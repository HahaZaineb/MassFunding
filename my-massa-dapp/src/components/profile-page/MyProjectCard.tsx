'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectData } from '@/types';
import ProjectUpdates from '../projects/ProjectUpdates';
import AddUpdateModal from '../projects/AddUpdateModal';
import { getProjectSupportersCount } from '@/services/contract-service';
import ProgressBar from '../ProgressBar';


interface MyProjectCardProps {
  project: ProjectData;
}
const MyProjectCard: React.FC<MyProjectCardProps> = ({ project }) => {
  const [openUpdates, setOpenUpdates] = useState<boolean>(false);
  const [openAddUpdate, setOpenAddUpdate] = useState<boolean>(false);
  const [supportersCount, setSupportersCount] = useState<number>(0);

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        const count = await getProjectSupportersCount(BigInt(project.id));
        setSupportersCount(count);
      } catch (error) {
        console.error(
          `Error fetching supporters for project ${project.id}:`,
          error,
        );
      }
    };
    fetchSupporters();
  }, [project.id]);

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
                  {project.creationDate && (
                    <div className="text-xs text-slate-400 mt-1 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Created: {project.creationDate}
                    </div>
                  )}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-[#00ff9d]">
                {project.amountRaised.toString()}
              </div>
              <div className="text-xs text-slate-400">MAS Raised</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {project.goalAmount.toString()}
              </div>
              <div className="text-xs text-slate-400">Goal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {supportersCount}
              </div>
              <div className="text-xs text-slate-400">Supporters</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {Math.min(
                  (Number(project.amountRaised) / Number(project.goalAmount)) *
                    100,
                  100,
                ).toFixed(2)}
                %
              </div>
              <div className="text-xs text-slate-400">Funded</div>
            </div>
          </div>
          <ProgressBar
            value={Math.min(
              (Number(project.amountRaised) / Number(project.goalAmount)) * 100,
              100,
            )}
          />
        </div>

        {/* Project Actions */}
        <div className="p-6 border-b border-[#00ff9d]/10">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setOpenAddUpdate(true)}
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
        projectId={project.id}
      />
      <AddUpdateModal
        open={openAddUpdate}
        onClose={() => setOpenAddUpdate(false)}
        project={project}
      />
    </Card>
  );
};

export default MyProjectCard;
