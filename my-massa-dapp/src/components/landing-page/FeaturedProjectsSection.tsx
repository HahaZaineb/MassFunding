'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProjectMiniCard from '../projects/ProjectMiniCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProjects } from '@/store/slices/projectSlice'

const FeaturedProjectsSection = () => {
  const navigate = useNavigate();
    const { list, loading, error } = useAppSelector(state => state.projects)

  const featuredProjects = list.slice(0, 3);
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])
  return (
    <>{list?.length > 0 && <section className="py-16 bg-[#0f1629]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Featured Projects
        </h2>
        <p className="text-slate-300 text-center max-w-2xl mx-auto mb-12">
          Discover innovative projects building on the Massa blockchain and help
          bring them to life.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProjects.map((project, index) => (
            <ProjectMiniCard project={project} key={index} />
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
    </section>}</>
  );
};

export default FeaturedProjectsSection;