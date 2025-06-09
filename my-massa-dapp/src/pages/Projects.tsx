'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { CATEGORIES } from '@/constants';
import ProjectCard from '@/components/projects/ProjectCard';
import { useProjects } from '@/context/project-context';
import { fundProject, getAllProjects, getProject } from '@/services/contract-service';
import { useToast } from '@/components/ui/use-toast';
import { ProjectData } from '@/types';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Projects() {
  const { projects, setProjects } = useProjects();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        // Fetch all project data directly
        const fetchedProjects: ProjectData[] = await getAllProjects();
        console.log("Fetched projects:", fetchedProjects);

        // Update the state with the fetched projects
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch projects. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, [setProjects, toast]);

  // Filter projects based on search query and category
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || project.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, selectedCategory]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-emerald-400 text-xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AnimatePresence mode="wait">
        <motion.div
          key="projects-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8 p-6"
        >
          {/* Enhanced Centered Title */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black bg-gradient-to-r from-green-300 via-emerald-400 to-teal-500 bg-clip-text text-transparent mb-4 drop-shadow-2xl tracking-tight"
            >
              Fund Projects
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-32 h-1 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto mb-4 rounded-full"
            />
            <p className="text-slate-300 text-l font-medium">
              Discover and support innovative projects that make a difference
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 h-5 w-5" />
              <Input
                placeholder="Search for projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg bg-slate-800/60 border-2 border-emerald-500/50 text-white placeholder-slate-400 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400/80 shadow-lg shadow-emerald-500/20"
              />
            </div>
          </div>
          {/* Enhanced Category Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            {[{ name: 'All', color: '#00ff9d' }, ...CATEGORIES].map(
              (category) => {
                const count =
                  category.name === 'All'
                    ? projects.length
                    : projects.filter((p) => p.category === category.name)
                        .length;
                const isActive = selectedCategory === category.name;
                return (
                  <motion.button
                    key={category.name}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-2 py-1 rounded-full font-bold transition-all duration-300 shadow-lg text-xs ${
                      isActive
                        ? `shadow-xl`
                        : 'bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 hover:text-white backdrop-blur-sm'
                    }`}
                    style={isActive ? { backgroundColor: category.color } : {}}
                  >
                    {category.name} ({count})
                  </motion.button>
                );
              },
            )}
          </div>

          {/* Projects Grid */}
          <div className="max-w-7xl mx-auto">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-slate-400 text-xl mb-2">
                  No projects found
                </div>
                <div className="text-slate-500">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'No projects in this category yet'}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}