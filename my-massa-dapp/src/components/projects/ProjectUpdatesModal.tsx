'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Tooltip,
  Divider,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { Calendar, Loader2 } from 'lucide-react';
import { getProjectUpdates } from '@/services/projectUpdateService';
import { getCurrentMassaPeriod } from '@/services/massaNetworkService';
import { ProjectUpdateData } from '@/types/projectUpdate';

interface ProjectUpdatesModalProps {
  open: boolean;
  onClose: (e: any) => void;
  projectId: string;
}

const ProjectUpdatesModal: React.FC<ProjectUpdatesModalProps> = ({
  open,
  onClose,
  projectId,
}) => {
  const [updates, setUpdates] = useState<ProjectUpdateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMassaPeriod, setCurrentMassaPeriod] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const projectIdNum = Number(projectId);
        if (isNaN(projectIdNum)) throw new Error('Invalid project ID');

        const [fetchedUpdates, currentPeriod] = await Promise.all([
          getProjectUpdates(projectIdNum),
          getCurrentMassaPeriod(),
        ]);

        setUpdates(fetchedUpdates);
        setCurrentMassaPeriod(currentPeriod);
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
    const period =
      typeof updatePeriod === 'string' ? Number(updatePeriod) : updatePeriod;
    const diff = currentMassaPeriod - period;

    if (diff < 0) return 'In the future';
    const seconds = diff * 15;

    if (seconds < 60) return `${Math.floor(seconds)} sec ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-[#00ff9d]" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 py-4">
          <Typography variant="h6">{error}</Typography>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {updates.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-400 text-sm">
            <div className="flex justify-center mb-3">
              <Calendar className="w-6 h-6 text-[#00ff9d]" />
            </div>
            <p className="font-semibold text-slate-300 mb-1">No updates yet</p>
            <p className="text-slate-500 text-xs">
              Project creators haven’t posted any updates at this time.
              <br />
              Stay tuned for future progress!
            </p>
          </div>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className="bg-gradient-to-br from-[#1f2a48] to-[#101827] border border-[#00ff9d]/10 rounded-xl p-5 transition hover:shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <Typography className="text-white font-semibold text-base">
                  {update.title}
                </Typography>
                <div className="flex items-center text-xs text-slate-400">
                  <Calendar className="w-3 h-3 mr-1" />
                  <Tooltip title={`Period ${update.date}`}>
                    <span>{getTimeAgo(update.date)}</span>
                  </Tooltip>
                </div>
              </div>

              {update.image && (
                <img
                  src={update.image}
                  alt="Update Visual"
                  className="w-full mb-3 rounded-lg border border-[#00ff9d]/10 object-cover max-h-56"
                />
              )}

              <Typography className="text-slate-300 text-sm mb-3" component="p">
                {update.content}
              </Typography>

              <Divider sx={{ borderColor: '#00ff9d1a', mb: 1 }} />
              <Typography className="text-slate-500 text-xs">
                Posted by {update.author}
              </Typography>
            </div>
          ))
        )}
      </motion.div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onClick={(e: any) => e.stopPropagation()}
      PaperProps={{
        sx: {
          bgcolor: '#0f172a',
          border: '1px solid #00ff9d',
          px: 0,
          py: 0,
          borderRadius: '16px',
          maxWidth: 600,
          width: '100%',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          py: 1,
          borderBottom: '1px solid #00ff9d1a',
          position: 'relative',
        }}
      >
        <Typography variant="h6" sx={{ color: '#00ff9d', fontWeight: 700 }}>
          Project Updates
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#00ff9d' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Body */}
      <DialogContent sx={{ px: 4, py: 3 }}>{renderContent()}</DialogContent>
    </Dialog>
  );
};

export default ProjectUpdatesModal;
