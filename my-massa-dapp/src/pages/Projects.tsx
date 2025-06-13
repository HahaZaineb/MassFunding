'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { CATEGORIES } from '@/constants';
import ProjectCard from '@/components/projects/ProjectCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { filterProjectsByAsyncStatus } from '@/store/slices/projectSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Projects() {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { list, loading } = useAppSelector((state) => state.projects);
  const [status, setStatus] = useState<
    'live' | 'release' | 'completed' | 'all'
  >('all');

  useEffect(() => {
    dispatch(
      filterProjectsByAsyncStatus({
        status,
        search: searchQuery,
        category: selectedCategory,
      }),
    );
  }, [dispatch, status, searchQuery, selectedCategory]);

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
          <div className="flex flex-row flex-wrap gap-3">
            {' '}
            {/* Enhanced Search Bar */}
            <div className="flex-grow">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 h-5 w-5" />
                <Input
                  placeholder="Search for projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg bg-slate-800/60 border-2 border-emerald-500/50 text-white placeholder-slate-400 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400/80 shadow-lg shadow-emerald-500/20"
                />
              </div>
            </div>{' '}
            <div className="space-y-2 min-w-[300px] ">
              <Select
                value={status}
                onValueChange={(
                  value: 'live' | 'release' | 'completed' | 'all',
                ) => setStatus(value)}
              >
                <SelectTrigger className="bg-slate-800/60 border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20 border-2 border-emerald-500/50 text-white placeholder-slate-400 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400/80 shadow-lg shadow-emerald-500/20 h-[50px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2340] border-[#00ff9d]/20 text-white max-h-[300px] overflow-y-auto">
                  <SelectItem value="all">Show All</SelectItem>
                  <SelectItem value="live">Live (Ongoing Projects)</SelectItem>
                  <SelectItem value="release">
                    Released (Recently Deployed)
                  </SelectItem>
                  <SelectItem value="completed">
                    Completed (Wrapped Up)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Enhanced Category Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            {[{ name: 'All', color: '#00ff9d' }, ...CATEGORIES].map(
              (category) => {
                const count =
                  category.name === 'All'
                    ? list.length
                    : list.filter((p) => p.category === category.name).length;
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
          {loading && (
            <div className="flex flex-col items-center space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00ff9d]"></div>
              <p className="text-white text-lg">Loading...</p>
            </div>
          )}
          {!loading && (
            <div className="max-w-7xl mx-auto">
              {list.length === 0 ? (
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
                  {list.map((project, index) => (
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
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
