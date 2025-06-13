'use client';

import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Calendar, Loader2 } from 'lucide-react';
import { getProjectUpdates } from '@/services/projectUpdateService';
import { getCurrentMassaPeriod } from '@/services/massaNetworkService';
import { ProjectUpdateData } from '@/types/projectUpdate';

interface ProjectUpdatesProps {
  projectId: string;
}

const ProjectUpdates: React.FC<ProjectUpdatesProps> = ({ projectId }) => {
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
        if (isNaN(projectIdNum)) {
          throw new Error('Invalid project ID');
        }

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

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const getTimeAgo = (updatePeriod: string | number): string => {
    if (currentMassaPeriod === null) return 'Loading...';

    const period =
      typeof updatePeriod === 'string' ? Number(updatePeriod) : updatePeriod;
    const diffPeriods = currentMassaPeriod - period;
    if (diffPeriods < 0) return 'In the future';

    const seconds = diffPeriods * 15;
    if (seconds < 60) return `${Math.floor(seconds)} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <motion.div
      key="updates-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="relative w-full bg-slate-800/80 border border-[#00ff9d33] p-4 rounded-2xl shadow-lg"
    >
      <Typography
        variant="h5"
        sx={{ color: '#00ff9d', mb: 3, fontWeight: 700 }}
      >
        Project Updates
      </Typography>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-[#00ff9d]" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-6 font-medium">{error}</div>
      ) : updates.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-slate-400 text-sm">No updates posted yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {updates.map((update) => (
            <div
              key={update.id}
              className="group relative border border-[#00ff9d22] bg-slate-700/50 rounded-xl p-5 transition-all duration-300 hover:border-[#00ff9d]"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-white font-semibold text-base group-hover:text-[#00ff9d] transition">
                  {update.title}
                </h4>
                <div className="flex items-center text-xs text-slate-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  {getTimeAgo(update.date)}
                </div>
              </div>

              {update.image && (
                <img
                  src={update.image}
                  alt="Update image"
                  className="mb-3 w-full max-h-60 object-cover rounded-lg border border-[#00ff9d22]"
                />
              )}

              <p className="text-slate-300 text-sm leading-relaxed mb-2">
                {update.content}
              </p>

              <div className="text-xs text-slate-500 italic">
                By {update.author}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ProjectUpdates;
