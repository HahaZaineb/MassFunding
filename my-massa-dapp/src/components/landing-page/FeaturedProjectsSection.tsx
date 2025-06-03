'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/context/project-context';

const FeaturedProjectsSection = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const featuredProjects = projects.slice(0, 3);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Environment":
        return "bg-emerald-500"
      case "Education":
        return "bg-blue-500"
      case "Healthcare":
        return "bg-red-500"
      case "Technology":
        return "bg-purple-500"
      default:
        return "bg-slate-500"
    }
  }

  return (
    <section className="py-16 bg-[#0f1629]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Featured Projects
        </h2>
        <p className="text-slate-300 text-center max-w-2xl mx-auto mb-12">
          Discover innovative projects building on the Massa blockchain and help
          bring them to life.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-lg border border-[#00ff9d]/20 bg-[#1a1a2e] shadow-lg hover:shadow-[0_0_15px_rgba(0,255,157,0.3)] transition-all duration-300"
            >
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={
                    project.image ||
                    'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80'
                  }
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent opacity-70"></div>
                <div className={`absolute top-3 right-3 bg-[#00ff9d] text-[#0f1629] font-semibold text-xs px-2 py-1 rounded ${getCategoryColor(project.category)}`}>
                  {project.category}
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#00ff9d] mb-2">
                  {project.name}
                </h3>
                <p className="text-slate-300 text-sm mb-4">
                  {project.description.substring(0, 100)}...
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">
                      {project.amountRaised} / {project.amountNeeded} MAS
                    </span>
                    <span className="text-[#00ff9d]">
                      {(
                        (project.amountRaised / project.amountNeeded) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0f1629] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00ff9d]"
                      style={{
                        width: `${Math.min(
                          (project.amountRaised / project.amountNeeded) * 100,
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/projects')}
                  className="w-full bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-[#0f1629] font-medium"
                >
                  Fund This Project
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            onClick={() => navigate('/projects')}
            variant="outline"
            className="border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10"
          >
            View All Projects <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProjectsSection
