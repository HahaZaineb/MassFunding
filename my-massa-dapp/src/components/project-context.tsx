"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { ProjectData, ProjectUpdate, ProjectMilestone } from "../types"

// Initial mock data
const initialProjects = [
  {
    id: "1",
    name: "Sustainable Energy Initiative",
    description: "Funding for renewable energy research and implementation in rural areas.",
    amountNeeded: 5000,
    amountRaised: 2750,
    beneficiary: "AU1264Bah4q6pYLrGBh27V1b9VXL2XmnQCwMhY74HW4dxahpqxkrN",
    lockPeriod: "30 days",
    releaseInterval: "7 days",
    releasePercentage: 10,
    supporters: 12,
    category: "Environment",
    updates: [
      {
        id: "update-1-1",
        date: "2023-06-10",
        title: "Project Kickoff",
        content:
          "We're excited to announce that we've officially started work on this project. Our team has completed the initial planning phase and we're ready to move forward with development.",
        author: "Project Team",
      },
      {
        id: "update-1-2",
        date: "2023-08-25",
        title: "Prototype Completed",
        content:
          "We've successfully completed the prototype ahead of schedule! Initial feedback has been very positive, and we're now preparing for the testing phase with our target users.",
        author: "Project Team",
      },
    ],
    milestones: [
      {
        id: "milestone-1-1",
        title: "Project Planning",
        description: "Complete project planning and initial research",
        deadline: "2023-06-15",
        completed: true,
        progress: 100,
      },
      {
        id: "milestone-1-2",
        title: "Prototype Development",
        description: "Develop a working prototype of the solution",
        deadline: "2023-08-30",
        completed: true,
        progress: 100,
      },
      {
        id: "milestone-1-3",
        title: "Testing Phase",
        description: "Conduct thorough testing with target users",
        deadline: "2023-11-15",
        completed: false,
        progress: 65,
      },
    ],
  },
  {
    id: "2",
    name: "Community Education Center",
    description: "Building a technology education center for underprivileged communities.",
    amountNeeded: 8000,
    amountRaised: 3200,
    beneficiary: "AU1264Bah4q6pYLrGBh27V1b9VXL2XmnQCwMhY74HW4dxahpqxkrN",
    lockPeriod: "14 days",
    releaseInterval: "14 days",
    releasePercentage: 15,
    supporters: 24,
    category: "Education",
    updates: [],
    milestones: [],
  },
  {
    id: "3",
    name: "Healthcare Access Program",
    description: "Providing medical services to remote areas through mobile clinics.",
    amountNeeded: 12000,
    amountRaised: 5800,
    beneficiary: "AU1264Bah4q6pYLrGBh27V1b9VXL2XmnQCwMhY74HW4dxahpqxkrN",
    lockPeriod: "7 days",
    releaseInterval: "30 days",
    releasePercentage: 20,
    supporters: 37,
    category: "Healthcare",
    updates: [],
    milestones: [],
  },
]

type ProjectContextType = {
  projects: ProjectData[]
  addProject: (project: ProjectData) => void
  updateProject: (updatedProject: ProjectData) => void
  addProjectUpdate: (projectId: string, update: ProjectUpdate) => void
  addProjectMilestone: (projectId: string, milestone: ProjectMilestone) => void
  updateProjectMilestone: (projectId: string, milestone: ProjectMilestone) => void
  getProjectById: (id: string) => ProjectData | undefined
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects)

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("projects")
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  // Save projects to localStorage when updated
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects))
  }, [projects])

  const addProject = (project: ProjectData) => {
    // Ensure the project has empty updates and milestones arrays
    const newProject = {
      ...project,
      updates: project.updates || [],
      milestones: project.milestones || [],
    }
    setProjects((prev) => [...prev, newProject])
  }

  const updateProject = (updatedProject: ProjectData) => {
    setProjects((prev) => prev.map((project) => (project.id === updatedProject.id ? updatedProject : project)))
  }

  const addProjectUpdate = (projectId: string, update: ProjectUpdate) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            updates: [...(project.updates || []), update],
          }
        }
        return project
      }),
    )
  }

  const addProjectMilestone = (projectId: string, milestone: ProjectMilestone) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            milestones: [...(project.milestones || []), milestone],
          }
        }
        return project
      }),
    )
  }

  const updateProjectMilestone = (projectId: string, milestone: ProjectMilestone) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            milestones: (project.milestones || []).map((m) => (m.id === milestone.id ? milestone : m)),
          }
        }
        return project
      }),
    )
  }

  const getProjectById = (id: string) => {
    return projects.find((project) => project.id === id)
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        addProjectUpdate,
        addProjectMilestone,
        updateProjectMilestone,
        getProjectById,
      }}
    >
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
