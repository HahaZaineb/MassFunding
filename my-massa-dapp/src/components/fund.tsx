"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/button"
import { ArrowLeft, ThumbsUp, Users, Clock, Coins, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { DonationForm } from "./donation-form"
import { NFTPreview } from "./nft-preview"
import { Voting } from "./voting"
import { ProjectUpdates } from "./project-updates"
import { LoadingSpinner } from "./ui/loading-spinner"
import { Skeleton } from "./ui/skeleton"
import type { ProjectData } from "./types"
import { useToast } from "./ui/use-toast"

interface FundProps {
  onBack: () => void
}

// Mock data for projects - in a real app, you'd fetch this from the blockchain
const mockProjects = [
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
  },
]

export default function Fund({ onBack }: FundProps) {
  const { toast } = useToast()
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [donationAmount, setDonationAmount] = useState("")
  const [nftId, setNftId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"projects" | "donation" | "nft" | "updates" | "voting">("projects")
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, you would fetch projects from the blockchain
    const fetchProjects = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // For demo purposes, we'll just use the mock data
        setProjects(mockProjects)
      } catch (error) {
        console.error("Failed to fetch projects:", error)
        toast({
          title: "Failed to load projects",
          description: "Could not fetch project data from the blockchain",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [toast])

  const handleDonate = (projectId: string) => {
    console.log("handleDonate called with projectId:", projectId)
    setSelectedProject(projectId)
    setCurrentView("donation")
  }

  const handleDonationSubmit = (amount: string, generatedNftId: string) => {
    console.log("handleDonationSubmit called with:", amount, generatedNftId)
    setDonationAmount(amount)
    setNftId(generatedNftId)
    setCurrentView("nft")

    // Update project data to reflect the donation
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        if (project.id === selectedProject) {
          return {
            ...project,
            amountRaised: project.amountRaised + Number(amount),
            supporters: project.supporters + 1,
          }
        }
        return project
      }),
    )
  }

  const handleBackToProjects = () => {
    console.log("handleBackToProjects called")
    setSelectedProject(null)
    setCurrentView("projects")
  }

  const handleViewUpdates = (projectId: string) => {
    console.log("handleViewUpdates called with projectId:", projectId)
    setSelectedProject(projectId)
    setCurrentView("updates")
  }

  const handleViewVoting = (projectId: string) => {
    console.log("handleViewVoting called with projectId:", projectId)
    setSelectedProject(projectId)
    setCurrentView("voting")
  }

  const toggleProjectExpansion = (projectId: string) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null)
    } else {
      setExpandedProjectId(projectId)
    }
  }

  console.log("Current view:", currentView)
  console.log("Selected project:", selectedProject)

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-6 py-8">
        <LoadingSpinner size="lg" text="Loading projects..." />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">Fund Projects</h2>
      </div>

      <AnimatePresence mode="wait">
        {currentView === "nft" && selectedProject && (
          <motion.div
            key="nft-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <NFTPreview
              projectId={selectedProject}
              amount={donationAmount}
              nftId={nftId}
              onBack={handleBackToProjects}
              project={projects.find((p) => p.id === selectedProject) || projects[0]}
            />
          </motion.div>
        )}

        {currentView === "donation" && selectedProject && (
          <motion.div
            key="donation-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DonationForm
              project={projects.find((p) => p.id === selectedProject) || projects[0]}
              onSubmit={handleDonationSubmit}
              onBack={handleBackToProjects}
            />
          </motion.div>
        )}

        {currentView === "updates" && selectedProject && (
          <motion.div
            key="updates-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToProjects}
                className="flex items-center text-sm text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to projects
              </Button>
              <ProjectUpdates
                projectId={selectedProject}
                projectName={projects.find((p) => p.id === selectedProject)?.name || "Project"}
              />
            </div>
          </motion.div>
        )}

        {currentView === "voting" && selectedProject && (
          <motion.div
            key="voting-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToProjects}
                className="flex items-center text-sm text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to projects
              </Button>
              <Voting
                projectId={selectedProject}
                title={`Vote on ${projects.find((p) => p.id === selectedProject)?.name || "Project"}`}
                description="Cast your vote to influence the future of this project"
                deadline={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}
              />
            </div>
          </motion.div>
        )}

        {currentView === "projects" && (
          <motion.div
            key="projects-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="environment">Environment</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4 mt-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDonate={() => handleDonate(project.id)}
                    onViewUpdates={() => handleViewUpdates(project.id)}
                    onViewVoting={() => handleViewVoting(project.id)}
                    isExpanded={expandedProjectId === project.id}
                    onToggleExpand={() => toggleProjectExpansion(project.id)}
                  />
                ))}
              </TabsContent>
              <TabsContent value="environment" className="space-y-4 mt-4">
                {projects
                  .filter((p) => p.category.toLowerCase() === "environment")
                  .map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onDonate={() => handleDonate(project.id)}
                      onViewUpdates={() => handleViewUpdates(project.id)}
                      onViewVoting={() => handleViewVoting(project.id)}
                      isExpanded={expandedProjectId === project.id}
                      onToggleExpand={() => toggleProjectExpansion(project.id)}
                    />
                  ))}
              </TabsContent>
              <TabsContent value="education" className="space-y-4 mt-4">
                {projects
                  .filter((p) => p.category.toLowerCase() === "education")
                  .map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onDonate={() => handleDonate(project.id)}
                      onViewUpdates={() => handleViewUpdates(project.id)}
                      onViewVoting={() => handleViewVoting(project.id)}
                      isExpanded={expandedProjectId === project.id}
                      onToggleExpand={() => toggleProjectExpansion(project.id)}
                    />
                  ))}
              </TabsContent>
              <TabsContent value="healthcare" className="space-y-4 mt-4">
                {projects
                  .filter((p) => p.category.toLowerCase() === "healthcare")
                  .map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onDonate={() => handleDonate(project.id)}
                      onViewUpdates={() => handleViewUpdates(project.id)}
                      onViewVoting={() => handleViewVoting(project.id)}
                      isExpanded={expandedProjectId === project.id}
                      onToggleExpand={() => toggleProjectExpansion(project.id)}
                    />
                  ))}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ProjectCardProps {
  project: ProjectData
  onDonate: () => void
  onViewUpdates: () => void
  onViewVoting: () => void
  isExpanded: boolean
  onToggleExpand: () => void
}

function ProjectCard({ project, onDonate, onViewUpdates, onViewVoting, isExpanded, onToggleExpand }: ProjectCardProps) {
  const percentFunded = (project.amountRaised / project.amountNeeded) * 100

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="bg-slate-700 border-slate-600 text-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription className="text-slate-300 mt-1">
                {isExpanded ? project.description : `${project.description.substring(0, 80)}...`}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-slate-600">
              {project.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">
                {project.amountRaised} / {project.amountNeeded} MAS
              </span>
              <span className="text-sm font-medium">{percentFunded.toFixed(0)}%</span>
            </div>
            <Progress value={percentFunded} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex flex-col items-center p-2 bg-slate-800 rounded-md">
              <Users className="h-4 w-4 mb-1" />
              <span>{project.supporters} Supporters</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-slate-800 rounded-md">
              <Clock className="h-4 w-4 mb-1" />
              <span>Every {project.releaseInterval}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-slate-800 rounded-md">
              <Coins className="h-4 w-4 mb-1" />
              <span>{project.releasePercentage}% Release</span>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4"
              >
                <div className="bg-slate-800 p-4 rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span>Beneficiary:</span>
                    <span className="font-mono text-xs truncate max-w-[200px]">{project.beneficiary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lock Period:</span>
                    <span>{project.lockPeriod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Release Interval:</span>
                    <span>{project.releaseInterval}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Release Percentage:</span>
                    <span>{project.releasePercentage}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={onViewUpdates} className="text-white">
                    View Updates
                  </Button>
                  <Button variant="outline" size="sm" onClick={onViewVoting} className="text-white">
                    Vote on Project
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" className="text-xs text-white" onClick={onToggleExpand}>
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show More
              </>
            )}
          </Button>
          <Button onClick={onDonate} className="bg-green-600 hover:bg-green-700 text-white" size="sm">
            <ThumbsUp className="h-3 w-3 mr-1" />
            Fund This Project
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

