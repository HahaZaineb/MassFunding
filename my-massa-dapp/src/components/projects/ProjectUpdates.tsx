import React, { useState } from 'react';
import { Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle2, Calendar, User, TrendingUp } from 'lucide-react';
import { ProjectMilestone, ProjectUpdate } from '@/types';

interface ProjectUpdatesProps {
  open: boolean;
  onClose: () => void;
}

const ProjectUpdates: React.FC<ProjectUpdatesProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState('updates');

  // Mock data for updates
  const mockUpdates: ProjectUpdate[] = [
    {
      id: 'update-1',
      date: '2023-05-15',
      title: 'Development Started',
      content:
        "We've begun development on the core features of our project. The team is excited to bring this vision to life!",
      author: 'Project Team',
    },
    {
      id: 'update-2',
      date: '2023-06-01',
      title: 'First Milestone Reached',
      content:
        "We're happy to announce that we've completed our first major milestone. The prototype is now functional and we're moving on to the next phase.",
      author: 'Project Team',
    },
  ];

  // Mock data for milestones
  const mockMilestones: ProjectMilestone[] = [
    {
      id: 'milestone-1',
      title: 'Initial Research',
      description: 'Complete market research and feasibility studies',
      deadline: '2023-04-30',
      completed: true,
      progress: 100,
    },
    {
      id: 'milestone-2',
      title: 'Prototype Development',
      description: 'Develop a working prototype of the core functionality',
      deadline: '2023-06-15',
      completed: true,
      progress: 100,
    },
    {
      id: 'milestone-3',
      title: 'Beta Testing',
      description: 'Release beta version for testing with a limited user group',
      deadline: '2023-08-30',
      completed: false,
      progress: 45,
    },
  ];

  // Custom date formatter function
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#0f172a',
          border: '1px solid #00ff9d',
          px: 4,
          py: 3,
          minWidth: 350,
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8, color: '#00ff9d' }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0, overflow: 'visible' }}>
        <motion.div
          key="updates-view"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-4 p-6">
            <div className="space-y-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-[#1a2340] border border-[#00ff9d]/20">
                  <TabsTrigger
                    value="updates"
                    className="text-slate-300 data-[state=active]:bg-[#00ff9d] data-[state=active]:text-black"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Updates ({mockUpdates.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="milestones"
                    className="text-slate-300 data-[state=active]:bg-[#00ff9d] data-[state=active]:text-black"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Milestones ({mockMilestones.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="updates" className="mt-4 space-y-3">
                  {mockUpdates.map((update) => (
                    <div
                      key={update.id}
                      className="bg-[#1a2340] border border-[#00ff9d]/10 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white text-sm">
                          {update.title}
                        </h4>
                        <div className="flex items-center text-xs text-slate-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(update.date)}
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed mb-2">
                        {update.content}
                      </p>
                      <div className="text-xs text-slate-500">
                        By {update.author}
                      </div>
                    </div>
                  ))}

                  {mockUpdates.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-slate-400 text-sm">
                        No updates posted yet.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="milestones" className="mt-4 space-y-3">
                  {mockMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="bg-[#1a2340] border border-[#00ff9d]/10 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          {milestone.completed && (
                            <CheckCircle2 className="h-4 w-4 text-[#00ff9d] mr-2" />
                          )}
                          <h4 className="font-semibold text-white text-sm">
                            {milestone.title}
                          </h4>
                        </div>
                        <div className="flex items-center text-xs text-slate-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(milestone.deadline)}
                        </div>
                      </div>

                      <p className="text-slate-300 text-xs mb-3">
                        {milestone.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-slate-400">
                            {milestone.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-[#0f1629] rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              milestone.completed
                                ? 'bg-gradient-to-r from-[#00ff9d] to-[#00cc7d]'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600'
                            }`}
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {mockMilestones.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-slate-400 text-sm">
                        No milestones set yet.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectUpdates;