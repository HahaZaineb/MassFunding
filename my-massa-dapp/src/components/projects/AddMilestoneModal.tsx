'use client';

import type React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ProjectData } from '@/types';
import { useProjects } from '@/context/project-context';

interface AddMilestoneModalProps {
  project: ProjectData;
  open: boolean;
  onClose: () => void;
}

export default function AddMilestoneModal({
  project,
  open,
  onClose,
}: AddMilestoneModalProps) {
  const { addProjectMilestone } = useProjects();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    progress: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    setFormData((prev) => ({ ...prev, progress: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.deadline
    ) {
      return;
    }
    setIsSubmitting(true);
    try {
      addProjectMilestone(project.id, {
        ...formData,
        id: `milestone-${Date.now()}`,
        completed: false,
      });
      onClose();
    } catch (error) {
      console.error('Failed to add milestone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: '#0f172a',
          border: '1px solid #00ff9d',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ color: '#00ff9d' }}>
          Add Project Milestone
        </DialogTitle>

        <DialogContent dividers className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-[#e2e8f0]">
              Milestone Title
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Beta Launch"
              value={formData.title}
              onChange={handleChange}
              required
              className="bg-slate-800 border border-slate-600 text-white mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-[#e2e8f0]">
              Milestone Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what this milestone entails..."
              value={formData.description}
              onChange={handleChange}
              required
              className="min-h-[80px] bg-slate-800 border border-slate-600 text-white mt-1"
            />
          </div>

          <div>
            <Label htmlFor="deadline" className="text-[#e2e8f0]">
              Target Deadline
            </Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              required
              className="bg-slate-800 border border-slate-600 text-white mt-1"
            />
          </div>

          <div>
            <Label htmlFor="progress" className="text-[#00ff9d] font-medium">
              Current Progress ({formData.progress}%)
            </Label>
            <Input
              id="progress"
              name="progress"
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progress}
              onChange={handleProgressChange}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-white border-slate-600 hover:border-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#2563eb] hover:bg-[#1e40af] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Milestone'}
            </Button>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}