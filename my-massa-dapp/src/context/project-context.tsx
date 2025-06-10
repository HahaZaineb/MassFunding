import { ProjectData } from "@/types"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getAllProjects as fetchAllProjects } from "@/services/contract-service";

interface ProjectContextType {
  projects: ProjectData[]
  setProjects: (projects: ProjectData[]) => void
  addProject: (project: ProjectData) => void
  updateProject: (project: ProjectData) => void
  addProjectMilestone: (projectId: string, milestone: any) => void
  updateProjectMilestone: (projectId: string, milestone: any) => void
  getProject: (id: string) => ProjectData | undefined
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectData[]>([]) // Initialize with empty array

  // Load projects from localStorage on initial render (if desired), then fetch from blockchain
  useEffect(() => {
    const loadAndFetchProjects = async () => {
      const savedProjects = localStorage.getItem("projects");
      if (savedProjects) {
        try {
          setProjects(JSON.parse(savedProjects));
        } catch (error) {
          console.error("Failed to parse saved projects:", error);
        }
      }

      try {
        const fetchedProjects = await fetchAllProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error fetching projects from contract:", error);
      }
    };

    loadAndFetchProjects();
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects))
  }, [projects])

  const addProject = (project: ProjectData) => {
    setProjects(prev => [...prev, project])
  }

  const updateProject = (updatedProject: ProjectData) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    )
  }

  const addProjectMilestone = (projectId: string, milestone: any) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? { ...project, milestones: [...(project.milestones || []), milestone] }
        : project
    ))
  }

  const updateProjectMilestone = (projectId: string, milestone: any) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? { ...project, milestones: (project.milestones || []).map(m => m.id === milestone.id ? milestone : m) }
        : project
    ))
  }

  const getProject = (id: string) => {
    return projects.find(project => project.id === id)
  }

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      setProjects, 
      addProject, 
      updateProject, 
      addProjectMilestone, 
      updateProjectMilestone, 
      getProject 
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider")
  }
  return context
}



