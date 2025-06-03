"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ThumbsUp, Users, Clock, Coins, ChevronDown, ChevronUp, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DonationForm } from "@/components/donation-form"
import { NFTPreview } from "@/components/nft-preview"
import { ProjectUpdates } from "@/components/project-updates"
import { useToast } from "@/components/ui/use-toast"
import { useAccountStore } from "@massalabs/react-ui-kit"
import { vestingService } from "@/services/vesting-service"
import Loader from "@/components/Loader"
import { ProjectData } from "@/types"
import { CATEGORIES } from "@/constants"
import { getCategoryColor } from "@/lib/utils"

// Mock data for projects with images
const mockProjects = [
  {
    id: "1",
    name: "Sustainable Energy Initiative",
    description:
      "Funding for renewable energy research and implementation in rural areas. This project aims to bring clean, sustainable energy solutions to communities that need it most.",
    amountNeeded: 5000,
    goalAmount: 5000,
    amountRaised: 2750,
    beneficiary: "AU1264Bah4q6pYLrGBh27V1b9VXL2XmnQCwMhY74HW4dxahpqxkrN",
    lockPeriod: "30",
    releaseInterval: "7",
    releasePercentage: 10,
    supporters: 12,
    category: "Environment",
    deadline: "2024-12-31",
    creator: "AU1264Bah4q6pYLrGBh27V1b9VXL2XmnQCwMhY74HW4dxahpqxkrN",
    image:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
  },
  {
    id: "2",
    name: "Community Education Center",
    description:
      "Building a technology education center for underprivileged communities. We're creating a space where people can learn digital skills and access modern technology.",
    amountNeeded: 8000,
    goalAmount: 8000,
    amountRaised: 3200,
    beneficiary: "AU1264Bah4q6pYLrGBh27V1b9VXL2XmnQCwMhY74HW4dxahpqxkrN",
    lockPeriod: "14",
    releaseInterval: "14",
    releasePercentage: 15,
    supporters: 24,
    category: "Education",
    deadline: "2024-11-30",
    creator: "AU1264Bah4q6pYLrGBh27V1b9VXL2XmnQCwMhY74HW4dxahpqxkrN",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
  },
  {
    id: "3",
    name: "Educational App for Rural Areas",
    description:
      "Developing a mobile app that provides educational content for children in areas with limited internet access. The app will work offline and provide quality education materials.",
    amountNeeded: 25000,
    amountRaised: 12000,
    beneficiary: "AU12YgFH8o2eiLW33c9pZZaXgY8B",
    lockPeriod: "30",
    releaseInterval: "30",
    releasePercentage: 10,
    supporters: 37,
    category: "Education",
    goalAmount: 25000,
    deadline: "2025-01-31",
    creator: "AU12YgFH8o2eiLW33c9pZZaXgY8B",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
  },
  {
    id: "4",
    name: "Healthcare Access Program",
    description:
      "Providing medical services to remote areas through mobile clinics. This initiative will bring essential healthcare services to underserved communities.",
    amountNeeded: 12000,
    amountRaised: 5800,
    beneficiary: "AU1264Bah4q6pYLrGBh27V1b9VXL2XmnQCwMhY74HW4dxahpqxkrN",
    lockPeriod: "7",
    releaseInterval: "30",
    releasePercentage: 20,
    supporters: 31,
    category: "Healthcare",
    goalAmount: 12000,
    deadline: "2024-10-31",
    creator: "AU1264Bah4q6pYLrGBh27V1b9VXL2XmnQCwMhY74HW4dxahpqxkrN",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
  },
  {
    id: "5",
    name: "Clean Water Initiative",
    description:
      "Installing water purification systems in rural communities. Clean water is a basic human right, and this project aims to provide safe drinking water to those who need it.",
    amountNeeded: 15000,
    amountRaised: 8500,
    beneficiary: "AU1264Bah4q6pYLrGBh27V1b9VXL2XmnQCwMhY74HW4dxahpqxkrN",
    lockPeriod: "21",
    releaseInterval: "21",
    releasePercentage: 12,
    supporters: 45,
    category: "Environment",
    goalAmount: 15000,
    deadline: "2024-12-15",
    creator: "AU1264Bah4q6pYLrGBh27V1b9VXL2XmnQCwMhY74HW4dxahpqxkrN",
    image:
      "https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
  },
]

export default function Projects() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [donationAmount, setDonationAmount] = useState("")
  const [nftId, setNftId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"projects" | "donation" | "nft" | "updates">("projects")
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false)
  const [deferredCallId, setDeferredCallId] = useState<string | null>(null)
  const { connectedAccount } = useAccountStore()

  // Filter projects based on search query and category
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [projects, searchQuery, selectedCategory])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
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
    setSelectedProject(projectId)
    setCurrentView("donation")
  }

  const processDonation = async (amount: string) => {
    console.log("--- Entering processDonation function ---");
    console.log("Process Donation clicked with amount:", amount);

    if (!connectedAccount || !selectedProject) {
      console.error("No connected account or selected project");
      toast({
        title: "Funding Failed",
        description: "Please connect your wallet and select a project.",
        variant: "destructive",
      })
      return
    }

    setIsProcessingTransaction(true);
    console.log("setIsProcessingTransaction(true)");

    const projectToFund = projects.find((p) => p.id === selectedProject)
    if (!projectToFund) {
      console.error("Selected project not found")
      toast({
        title: "Funding Failed",
        description: "Selected project not found.",
        variant: "destructive",
      })
      setIsProcessingTransaction(false)
      return
    }

    try {
      console.log("Attempting to create vesting schedule...");
      // Use the vesting service to create the vesting schedule
      const vestingParams = {
        beneficiary: projectToFund.beneficiary,
        amount: amount,
        lockPeriod: projectToFund.lockPeriod,
        releaseInterval: projectToFund.releaseInterval,
        releasePercentage: projectToFund.releasePercentage.toString(),
      }

      console.log("Calling vestingService.createVestingSchedule with params:", vestingParams);
      const operationId = await vestingService.createVestingSchedule(connectedAccount, vestingParams)
      console.log("vestingService.createVestingSchedule call completed. Operation ID:", operationId);

      console.log("Vesting schedule created successfully with operation ID:", operationId);

      toast({
        title: "Funding Successful! 🎉",
        description: `Successfully funded ${projectToFund.name}! Vesting schedule created.`,
        variant: "default",
      })

      // Generate NFT ID (you can extract this from events if your contract emits them)
      const generatedNftId = `NFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      setDonationAmount(amount)
      setNftId(generatedNftId)
      setDeferredCallId(operationId)

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

      // Show NFT preview
      setCurrentView("nft")
      console.log("setCurrentView(nft)");
    } catch (error) {
      console.error("Error processing donation:", error)
      toast({
        title: "Funding Failed",
        description: `Error processing donation: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
      console.error("processDonation failed:", error);
    } finally {
      setIsProcessingTransaction(false)
      console.log("setIsProcessingTransaction(false)");
      console.log("--- Exiting processDonation function ---");
    }
  }

  const handleDonationSubmit = (amount: string, generatedNftId = "") => {
    processDonation(amount)
  }

  const handleBackToProjects = () => {
    setSelectedProject(null)
    setCurrentView("projects")
  }

  const handleViewUpdates = (projectId: string) => {
    setSelectedProject(projectId)
    setCurrentView("updates")
  }

  const toggleProjectExpansion = (projectId: string) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null)
    } else {
      setExpandedProjectId(projectId)
    }
  }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
              onSubmit={(amount) => handleDonationSubmit(amount, "")}
              onBack={handleBackToProjects}
              isProcessing={isProcessingTransaction}
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
            <div className="space-y-4 p-6">
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

        {currentView === "projects" && (
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
                style={{
                  textShadow: "0 0 30px rgba(16, 185, 129, 0.5)",
                  filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))",
                }}
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
              {[{name: "All", color: '#00ff9d'}, ...CATEGORIES].map((category) => {
                const count =
                  category.name === "All" ? projects.length : projects.filter((p) => p.category === category.name).length
                const isActive = selectedCategory === category.name
                return (
                  <motion.button
                    key={category.name}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-2 py-1 rounded-full font-bold transition-all duration-300 shadow-lg text-xs ${
                      isActive
                        ? `shadow-xl`
                        : "bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 hover:text-white backdrop-blur-sm"
                    }`}
                    style={isActive ? { backgroundColor: category.color } : {}}
                  >
                    {category.name} ({count})
                  </motion.button>
                )
              })}
            </div>

            {/* Projects Grid */}
            <div className="max-w-7xl mx-auto">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-slate-400 text-xl mb-2">No projects found</div>
                  <div className="text-slate-500">
                    {searchQuery ? "Try adjusting your search terms" : "No projects in this category yet"}
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
                      <ProjectCard
                        project={project}
                        onDonate={() => handleDonate(project.id)}
                        onViewUpdates={() => handleViewUpdates(project.id)}
                        isExpanded={expandedProjectId === project.id}
                        onToggleExpand={() => toggleProjectExpansion(project.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ProjectCardProps {
  project: ProjectData & { image?: string }
  onDonate: () => void
  onViewUpdates: () => void
  isExpanded: boolean
  onToggleExpand: () => void
}

function ProjectCard({ project, onDonate, onViewUpdates, isExpanded, onToggleExpand }: ProjectCardProps) {
  const percentFunded = (project.amountRaised / project.amountNeeded) * 100

  return (
    <Card className="bg-slate-800/80 border-slate-600 text-white overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border-2 hover:border-emerald-500/50">
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        <img src={project.image || "/placeholder.svg"} alt={project.name} className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4">
          <Badge className={`text-white border-0`} style={{backgroundColor: getCategoryColor(project.category)}}>{project.category}</Badge>
        </div>
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="text-white text-xl leading-tight">{project.name}</CardTitle>
        <CardDescription className="text-slate-300 text-sm leading-relaxed">
          {isExpanded ? project.description : `${project.description.substring(0, 100)}...`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-white">
              {project.amountRaised.toLocaleString()} / {project.amountNeeded.toLocaleString()} MAS
            </span>
            <span className="font-bold text-emerald-400">{percentFunded.toFixed(0)}%</span>
          </div>
          <Progress value={percentFunded} className="h-3 bg-slate-700" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg">
            <Users className="h-4 w-4 mb-1 text-blue-400" />
            <span className="text-white font-bold text-lg">{project.supporters}</span>
            <span className="text-slate-400 text-xs">Supporters</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg">
            <Clock className="h-4 w-4 mb-1 text-yellow-400" />
            <span className="text-white font-bold text-lg">Every {project.releaseInterval} days</span>
            <span className="text-slate-400 text-xs">Interval</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg">
            <Coins className="h-4 w-4 mb-1 text-emerald-400" />
            <span className="text-white font-bold text-lg">{project.releasePercentage}% Release</span>
            <span className="text-slate-400 text-xs">Release</span>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Beneficiary:</span>
                  <span className="font-mono text-xs text-white bg-slate-600 px-2 py-1 rounded">
                    {project.beneficiary.slice(0, 8)}...{project.beneficiary.slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Lock Period:</span>
                  <span className="text-white font-medium">{project.lockPeriod} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Release Interval:</span>
                  <span className="text-white font-medium">{project.releaseInterval} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Release Percentage:</span>
                  <span className="text-white font-medium">{project.releasePercentage}%</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onViewUpdates}
                className="w-full text-white border-slate-600 hover:bg-slate-600"
              >
                View Updates
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-4">
        <Button
          onClick={onDonate}
          className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 text-white font-bold py-3 text-lg shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Fund This Project
        </Button>

        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={onToggleExpand}>
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show Less Details
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show More Details
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
