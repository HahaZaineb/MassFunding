'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { createProject } from '@/services/contract-service';
import { CATEGORIES } from '@/constants';
import { Slider } from '@mui/material';

export default function RequestFunding() {
  const { toast } = useToast();
  const { connectedAccount } = useAccountStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    amountNeeded: '',
    walletAddress: '',
    lockPeriod: '30',
    releaseInterval: '30',
    releasePercentage: 10,
    category: 'Environment',
    image: '',
  });

  useEffect(() => {
          console.log(connectedAccount, "connectedAccount")

    if (connectedAccount) {
      setFormData((prev) => ({
        ...prev,
        walletAddress: connectedAccount.toString(),
      }));
    }
  }, [connectedAccount]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e: any, value: number) => {
    setFormData((prev) => ({ ...prev, releasePercentage: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!connectedAccount) {
        throw new Error('Please connect your wallet first');
      }
      const response = await createProject(connectedAccount, {
        title: formData.projectName,
        description: formData.description,
        fundingGoal: formData.amountNeeded,
        beneficiaryAddress:
          formData.walletAddress || connectedAccount.toString(),
        category: formData.category,
        lockPeriod: formData.lockPeriod,
        releaseInterval: formData.releaseInterval,
        releasePercentage: formData.releasePercentage,
        image: formData.image,
      });

      console.log('Project creation response:', response);

      toast({
        title: 'Project Created',
        description: 'Your funding request has been submitted successfully.',
        variant: 'default',
      });

      setFormData({
        projectName: '',
        description: '',
        amountNeeded: '',
        walletAddress: connectedAccount ? connectedAccount.toString() : '',
        lockPeriod: '30',
        releaseInterval: '30',
        releasePercentage: 10,
        category: 'Environment',
        image: '',
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-4 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-[#00ff9d] bg-clip-text text-transparent">
            Request Funding
          </h1>
          <p className="text-slate-300 mb-8">
            Fill out the form below to request funding for your project. Your
            request will be reviewed by the community.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20 shadow-2xl">
            <CardHeader className="border-b border-[#00ff9d]/10">
              <CardTitle className="text-white">Project Details</CardTitle>
              <CardDescription className="text-slate-400">
                Provide information about your project and funding requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-white">
                    Project Name
                  </Label>
                  <Input
                    id="projectName"
                    name="projectName"
                    placeholder="Enter project name"
                    className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
                    value={formData.projectName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Project Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your project and how the funds will be used"
                    className="bg-[#0f1629] border-[#00ff9d]/20 text-white min-h-[120px] focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-white">
                    Project Image (optional)
                  </Label>
                  <Input
                    id="image"
                    name="image"
                    placeholder="Paste an image URL (e.g. https://...)"
                    className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
                    value={formData.image}
                    onChange={handleChange}
                    type="url"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id="imageFile"
                      name="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-white text-sm"
                    />
                    {formData.image && formData.image.startsWith('data:') && (
                      <img
                        src={formData.image || '/placeholder.svg'}
                        alt="Preview"
                        className="h-12 w-12 object-cover rounded border border-[#00ff9d]/20"
                      />
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    This image will be shown on your project card. You can paste
                    a URL or upload a file.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amountNeeded" className="text-white">
                      Amount Needed (MAS)
                    </Label>
                    <Input
                      id="amountNeeded"
                      name="amountNeeded"
                      type="number"
                      placeholder="Enter amount"
                      className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
                      value={formData.amountNeeded}
                      onChange={handleChange}
                      min="1"
                      step="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-white">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleSelectChange('category', value)
                      }
                    >
                      <SelectTrigger className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2340] border-[#00ff9d]/20 text-white max-h-[300px] overflow-y-auto">
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Vesting Schedule</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1a2340] text-white border border-[#00ff9d]/20">
                          <p className="max-w-xs">
                            Vesting schedules determine how and when funds are
                            released to your project.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lockPeriod" className="text-white">
                        Initial Lock Period (days)
                      </Label>
                      <Select
                        value={formData.lockPeriod}
                        onValueChange={(value) =>
                          handleSelectChange('lockPeriod', value)
                        }
                      >
                        <SelectTrigger className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20">
                          <SelectValue placeholder="Select lock period" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2340] border-[#00ff9d]/20 text-white">
                          <SelectItem value="0">No lock period</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="releaseInterval" className="text-white">
                        Release Interval (days)
                      </Label>
                      <Select
                        value={formData.releaseInterval}
                        onValueChange={(value) =>
                          handleSelectChange('releaseInterval', value)
                        }
                      >
                        <SelectTrigger className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20">
                          <SelectValue placeholder="Select release interval" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2340] border-[#00ff9d]/20 text-white">
                          <SelectItem value="7">Weekly (7 days)</SelectItem>
                          <SelectItem value="30">Monthly (30 days)</SelectItem>
                          <SelectItem value="90">
                            Quarterly (90 days)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="releasePercentage" className="text-white">
                        Release Percentage per Interval
                      </Label>
                      <span className="text-sm text-[#00ff9d] font-semibold">
                        {formData.releasePercentage}%
                      </span>
                    </div>
                    <Slider
                      aria-label="releasePercentage"
                      defaultValue={formData.releasePercentage}
                      valueLabelDisplay="auto"
                      step={5}
                      marks
                      min={5}
                      max={50}
                      onChange={handleSliderChange}
                    />
                    <p className="text-xs text-slate-400">
                      This determines what percentage of the total funds will be
                      released at each interval.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#00ff9d]/10">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#00ff9d] to-[#00cc7d] hover:from-[#00cc7d] hover:to-[#00ff9d] text-black font-bold py-3 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Project...' : 'Create Project'}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="text-xs text-slate-400 border-t border-[#00ff9d]/10 flex flex-col items-start pt-4">
              <p className="mb-1">
                By submitting, you agree to the platform's terms and conditions
                regarding fund distribution.
              </p>
              <p>
                Your project will be visible to potential funders after review.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
