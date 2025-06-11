import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { Calendar,  Loader2 } from 'lucide-react';
import { ContractProjectUpdateData, getProjectUpdates, getCurrentMassaPeriod } from '@/services/contract-service';

interface ProjectUpdatesProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

const ProjectUpdates: React.FC<ProjectUpdatesProps> = ({ open, onClose, projectId }) => {
  const [updates, setUpdates] = useState<ContractProjectUpdateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMassaPeriod, setCurrentMassaPeriod] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const projectIdNum = Number(projectId);
        if (isNaN(projectIdNum)) {
          throw new Error('Invalid project ID');
        }

        const [fetchedUpdates, currentPeriod] = await Promise.all([
          getProjectUpdates(projectIdNum),
          getCurrentMassaPeriod()
        ]);
        
        setUpdates(fetchedUpdates);
        setCurrentMassaPeriod(currentPeriod);
        console.log('Fetched updates:', fetchedUpdates);
        console.log('Current Massa Period:', currentPeriod);

      } catch (err) {
        console.error('Error fetching project updates or current period:', err);
        setError('Failed to load updates.');
      } finally {
        setLoading(false);
      }
    };

    if (open && projectId) {
      fetchData();
    }
  }, [open, projectId]);

  const getTimeAgo = (updatePeriod: string | number): string => {
    if (currentMassaPeriod === null) return 'Loading...';
    
    const period = typeof updatePeriod === 'string' ? Number(updatePeriod) : updatePeriod;
    const diffPeriods = currentMassaPeriod - period;

    if (diffPeriods < 0) return 'In the future'; // Should not happen for updates

    const seconds = diffPeriods * 15; // 1 Massa period = 15 seconds

    if (seconds < 60) {
      return `${Math.floor(seconds)} seconds ago`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} minutes ago`;
    } else if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)} hours ago`;
    } else {
      return `${Math.floor(seconds / 86400)} days ago`;
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
              <div className="text-xl font-bold text-[#00ff9d] mb-2">Project Updates</div>
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
                      {getTimeAgo(update.date)}
                    </div>
                  </div>
                  {update.image && (
                    <img src={update.image} alt="Update" className="mb-2 max-h-48 rounded-lg border border-[#00ff9d]/10" />
                  )}
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
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectUpdates;