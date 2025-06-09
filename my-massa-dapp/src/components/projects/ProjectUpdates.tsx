import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle2, Calendar, User, TrendingUp, Loader2 } from 'lucide-react';
import { ContractProjectMilestoneData, ContractProjectUpdateData, getProjectUpdates, getMilestones } from '@/services/contract-service';

interface ProjectUpdatesProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

const ProjectUpdates: React.FC<ProjectUpdatesProps> = ({ open, onClose, projectId }) => {
  const [activeTab, setActiveTab] = useState('updates');
  const [updates, setUpdates] = useState<ContractProjectUpdateData[]>([]);
  const [milestones, setMilestones] = useState<ContractProjectMilestoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedUpdates = await getProjectUpdates(Number(projectId));
        const fetchedMilestones = await getMilestones(Number(projectId));
        setUpdates(fetchedUpdates);
        setMilestones(fetchedMilestones);
      } catch (err) {
        console.error('Error fetching project updates or milestones:', err);
        setError('Failed to load updates or milestones.');
      } finally {
        setLoading(false);
      }
    };

    if (open && projectId) {
      fetchProjectData();
    }
  }, [open, projectId]);

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

  if (loading) {
    return <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#0f172a',
          border: '1px solid #00ff9d',
          px: 4,
          py: 3,
          minWidth: 350,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px'
        },
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'visible' }}>
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-[#00ff9d]" />
      </DialogContent>
    </Dialog>;
  }

  if (error) {
    return <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#0f172a',
          border: '1px solid #00ff9d',
          px: 4,
          py: 3,
          minWidth: 350,
          color: 'red',
          textAlign: 'center'
        },
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'visible' }}>
        <Typography variant="h6">Error: {error}</Typography>
      </DialogContent>
    </Dialog>;
  }

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
                    Updates ({updates.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="milestones"
                    className="text-slate-300 data-[state=active]:bg-[#00ff9d] data-[state=active]:text-black"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Milestones ({milestones.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="updates" className="mt-4 space-y-3">
                  {updates.map((update) => (
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

                  {updates.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-slate-400 text-sm">
                        No updates posted yet.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="milestones" className="mt-4 space-y-3">
                  {milestones.map((milestone) => (
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
                                : 'bg-gradient-to-r from-red-500 to-orange-500'
                            }`}
                            style={{ width: `${milestone.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {milestones.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-slate-400 text-sm">
                        No milestones defined yet.
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