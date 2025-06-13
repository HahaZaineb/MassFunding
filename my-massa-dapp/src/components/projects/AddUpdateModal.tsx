'use client';

import type React from 'react';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ProjectData } from '@/types/project';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { addUpdate } from '@/services/projectUpdateService';
import { useToast } from '@/contexts/ToastProvider';

interface AddUpdateModalProps {
  project: ProjectData;
  open: boolean;
  onClose: (e: any) => void;
}

export default function AddUpdateModal({
  project,
  open,
  onClose,
}: AddUpdateModalProps) {
  const { showToast } = useToast();
  const { connectedAccount } = useAccountStore();

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    author: string;
    date: string;
    image: string;
  }>({
    title: '',
    content: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
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
    if (!connectedAccount) {
      console.error('Wallet not connected. Cannot add update.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addUpdate(connectedAccount, Number(project.id), {
        title: formData.title,
        content: formData.content,
        author: formData.author || project.creator || 'Anonymous',
        image: formData.image,
      });
      showToast('Project update added successfully!', 'success');
      onClose(e);
    } catch (error) {
      console.error('Failed to add update:', error);
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to add project update. Please try again.',
        'error',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20 mt-1';

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
        <DialogTitle sx={{ color: '#00ff9d' }}>Add Project Update</DialogTitle>

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
              className={inputClass}
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
              className={`${inputClass} min-h-[120px]`}
            />
          </div>

          <div>
            <Label htmlFor="image" className="text-[#e2e8f0]">
              Update Image (optional)
            </Label>
            <Input
              id="image"
              name="image"
              placeholder="Paste an image URL (e.g. https://...)"
              className={inputClass}
              value={formData.image}
              onChange={handleChange}
              type="url"
            />
            {formData.image && formData.image.length > 0 && (
              <img
                src={formData.image || ''}
                alt="Preview"
                className="mt-2 max-h-32 rounded border border-[#00ff9d]/20"
              />
            )}
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
              className={inputClass}
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
              {isSubmitting ? 'Processing...' : 'Add Update'}
            </Button>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}