import { getAllProjects } from "@/services/contract-service"
import { ProjectData } from "@/types"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Sample project data
const initialProjects: ProjectData[] = [
  {
    id: "project-1",
    name: "Clean Ocean Initiative",
    description: "A project to clean plastic waste from the oceans and develop sustainable alternatives to single use plastics.",
    amountRaised: 32500,
    goalAmount: 50000,
    amountNeeded: 50000,
    beneficiary: "AU12YgH8o2eiLW33c9jzZaXgY8BVXyj19MqqUMRfVeTiUoB5FCqP",
    lockPeriod: "30",
    releaseInterval: "30",
    releasePercentage: 10,
    supporters: 128,
    category: "Environment",
    deadline: "2023-12-31",
    creator: "AU12nUWgAhJMhDpmPNj3FNDzu7GrEHFZJsiswRWXXqrisAtKu9K4V",
    image: "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    updates: [],
    milestones: []
  },
  {
    id: "project-2",
    name: "Educational App for Rural Areas",
    description: "Developing a mobile app that provides educational content for children in areas with limited internet access.",
    amountRaised: 12000,
    goalAmount: 25000,
    amountNeeded: 25000,
    beneficiary: "AU12YgH8o2eiLW33c9jzZaXgY8BVXyj19MqqUMRfVeTiUoB5FCqP",
    lockPeriod: "30",
    releaseInterval: "30",
    releasePercentage: 10,
    supporters: 75,
    category: "Education",
    deadline: "2023-11-15",
    creator: "AU12nUWgAhJMhDpmPNj3FNDzu7GrEHFZJsiswRWXXqrisAtKu9K4V",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1722&q=80",
    updates: [],
    milestones: []
  },
  {
    id: "project-3",
    name: "Renewable Energy Hub",
    description: "Creating a community-owned renewable energy hub that provides clean electricity to local neighborhoods.",
    amountRaised: 45000,
    goalAmount: 75000,
    amountNeeded: 75000,
    beneficiary: "AU12YgH8o2eiLW33c9jzZaXgY8BVXyj19MqqUMRfVeTiUoB5FCqP",
    lockPeriod: "30",
    releaseInterval: "30",
    releasePercentage: 10,
    supporters: 210,
    category: "Environment",
    deadline: "2024-02-28",
    creator: "AU12YgH8o2eiLW33c9jzZaXgY8BVXyj19MqqUMRfVeTiUoB5FCqP",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    updates: [],
    milestones: []
  },
  {
    id: "project-4",
    name: "Healthcare Access Program",
    description: "Providing medical services to remote areas through mobile clinics and telemedicine solutions.",
    amountRaised: 5800,
    goalAmount: 12000,
    amountNeeded: 12000,
    beneficiary: "AU12YgH8o2eiLW33c9jzZaXgY8BVXyj19MqqUMRfVeTiUoB5FCqP",
    lockPeriod: "30",
    releaseInterval: "30",
    releasePercentage: 20,
    supporters: 37,
    category: "Healthcare",
    deadline: "2024-01-15",
    creator: "AU12YgH8o2eiLW33c9jzZaXgY8BVXyj19MqqUMRfVeTiUoB5FCqP",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    updates: [],
    milestones: []
  },
  {
    id: "project-5",
    name: "Clean Water Project",
    description: "Drilling wells and implementing water purification systems in arid regions to provide clean drinking water.",
    amountRaised: 6500,
    goalAmount: 7000,
    amountNeeded: 7000,
    beneficiary: "AU12YgH8o2eiLW33c9jzZaXgY8BVXyj19MqqUMRfVeTiUoB5FCqP",
    lockPeriod: "30",
    releaseInterval: "15",
    releasePercentage: 10,
    supporters: 50,
    category: "Environment",
    deadline: "2023-10-30",
    creator: "AU12YgH8o2eiLW33c9jzZaXgY8BVXyj19MqqUMRfVeTiUoB5FCqP",
    image: "https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    updates: [],
    milestones: []
  }
]

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
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects)
  // Load projects from localStorage on initial render
  useEffect(() => {
    const savedProjects = localStorage.getItem("projects")
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects))
      } catch (error) {
        console.error("Failed to parse saved projects:", error)
      }
    }
  }, [])

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



