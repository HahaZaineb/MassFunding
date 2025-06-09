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
import { ContractProjectUpdateData } from '@/services/contract-service';

interface AddUpdateModalProps {
  project: ProjectData;
  open: boolean;
  onClose: () => void;
}

export default function AddUpdateModal({
  project,
  open,
  onClose,
}: AddUpdateModalProps) {
  const { addProjectUpdate } = useProjects();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    date: new Date().toISOString().split('T')[0], // Default to today
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await addProjectUpdate(project.id, {
        title: formData.title,
        content: formData.content,
        author: formData.author || project.creator, // Default author to project creator if not provided
        id: `temp-update-${Date.now()}`,
        date: formData.date,
      } as ContractProjectUpdateData);
      onClose();
    } catch (error) {
      console.error('Failed to add update:', error);
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
        <DialogTitle sx={{ color: '#00ff9d' }}>Schedule Project Update</DialogTitle>

        <DialogContent dividers className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-[#e2e8f0]">
              Update Title
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Q2 Progress Report"
              value={formData.title}
              onChange={handleChange}
              required
              className="bg-slate-800 border border-slate-600 text-white mt-1"
            />
          </div>

          <div>
            <Label htmlFor="content" className="text-[#e2e8f0]">
              Update Content
            </Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Share the latest news and developments..."
              value={formData.content}
              onChange={handleChange}
              required
              className="min-h-[120px] bg-slate-800 border border-slate-600 text-white mt-1"
            />
          </div>

          <div>
            <Label htmlFor="date" className="text-[#e2e8f0]">
              Schedule Date
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]} // Prevent scheduling in the past
              className="bg-slate-800 border border-slate-600 text-white mt-1"
            />
          </div>

          <div>
            <Label htmlFor="author" className="text-[#e2e8f0]">
              Author (Optional)
            </Label>
            <Input
              id="author"
              name="author"
              placeholder="e.g., John Doe or Project Team"
              value={formData.author}
              onChange={handleChange}
              className="bg-slate-800 border border-slate-600 text-white mt-1"
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
              {isSubmitting ? 'Scheduling...' : 'Schedule Update'}
            </Button>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
} 