'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectData } from '@/types/project';
import AddUpdateModal from '../projects/AddUpdateModal';
import ProgressBar from '../ProgressBar';
import { getProjectSupportersCount } from '@/services/projectService';
import ProjectUpdatesModal from '../projects/ProjectUpdatesModal';
import { useNavigate } from 'react-router-dom';

interface MyProjectCardProps {
  project: ProjectData;
}
const MyProjectCard: React.FC<MyProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
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
    <Card
      onClick={() => navigate('/projects/' + project.id)}
      className="cursor-pointer bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20 shadow-xl overflow-hidden"
    >
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
                      Created:{' '}
                      {new Date(project.creationDate).toLocaleString(
                        undefined,
                        {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        },
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-slate-300 text-sm">{project.description}</p>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="p-6 border-b border-[#00ff9d]/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {project.amountRaised.toString()} MAS
              </div>
              <div className="text-xs text-slate-400"> Raised</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {project.goalAmount.toString()} MAS
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
              onClick={(e: any) => {
                e.stopPropagation();
                setOpenAddUpdate(true);
              }}
              variant="outline"
              className="border-[#00ff9d]/30 text-[#00ff9d] hover:bg-[#00ff9d]/10"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add Update
            </Button>
            <Button
              variant="ghost"
              onClick={(e: any) => {
                e.stopPropagation();
                setOpenUpdates(true);
              }}
              className="border-[#00ff9d]/30 text-[#00ff9d] bg-[#00ff9d]/10 hover:bg-[#00ff9d]/20"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Updates
            </Button>
          </div>
        </div>
      </CardContent>
      <ProjectUpdatesModal
        open={openUpdates}
        onClose={(e: any) => {
          e.stopPropagation();
          setOpenUpdates(false);
        }}
        projectId={project.id}
      />
      <AddUpdateModal
        open={openAddUpdate}
        onClose={(e: any) => {
          e.stopPropagation();
          setOpenAddUpdate(false);
        }}
        project={project}
      />
    </Card>
  );
};

export default MyProjectCard;
