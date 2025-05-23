import { useState } from "react"
import { Button } from "./ui/button"
import { ArrowLeft } from "lucide-react"
import { useProjects } from "../context/project-context"
import { ProjectCard } from "./project-card"
import { useNavigate } from "../hooks/use-navigate"
import { DonationForm } from "./donation-form"
import { ProjectUpdates } from "./project-updates"
import { MyNFTs } from "./MyNFTs"
import { Input } from "./ui/input"
import { motion } from "framer-motion"

interface FundProps {
  onBack: () => void
}

export default function Fund({ onBack }: FundProps) {
  const { projects, updateProject } = useProjects()
  const { navigate } = useNavigate()
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [showUpdates, setShowUpdates] = useState(false)

  // Visual overhaul states
  const [searchTerm, setSearchTerm] = useState("")
  const allCategories = Array.from(new Set(projects.map(p => p.category))).filter(Boolean)
  const categories = ["All", ...allCategories]
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Filtering logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || project.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDonate = (projectId: string) => {
    setSelectedProject(projectId)
    setShowDonationForm(true)
    setShowUpdates(false)
  }

  const handleViewUpdates = (projectId: string) => {
    setSelectedProject(projectId)
    setShowUpdates(true)
    setShowDonationForm(false)
  }

  const toggleExpand = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId)
  }

  const handleBackToProjects = () => {
    setShowDonationForm(false)
    setShowUpdates(false)
    setSelectedProject(null)
  }

  const handleDonationSubmit = (amount: string, nftId: string) => {
    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject)
      if (project) {
        // Update the project with the new donation
        const updatedProject = {
          ...project,
          amountRaised: project.amountRaised + parseFloat(amount),
          supporters: project.supporters + 1
        }
        updateProject(updatedProject)
      }
    }
    // The NFT display is handled within the DonationForm component
  }

  // Get the selected project data
  const currentProject = selectedProject 
    ? projects.find(p => p.id === selectedProject) 
    : null

  if (showDonationForm && currentProject) {
    return (
      <DonationForm 
        project={currentProject}
        onBack={handleBackToProjects}
        onSubmit={handleDonationSubmit}
      />
    )
  }

  if (showUpdates && currentProject) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBackToProjects} 
          className="flex items-center text-sm text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to projects
        </Button>
        <ProjectUpdates 
          projectId={currentProject.id} 
          projectName={currentProject.name} 
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <MyNFTs />
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate("home")} 
        className="flex items-center text-sm text-white mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to home
      </Button>

      <div className="flex flex-col items-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center animate-fade-in">
          Find Projects to <span className="text-[#00ff9d]">Fund</span>
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl text-center mb-6 animate-fade-in">
          Discover innovative projects building on the Massa blockchain and help bring them to life.
        </p>

        <div className="w-full max-w-xl mb-8 animate-fade-in">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1a2340] border-[#00ff9d]/20 focus:border-[#00ff9d] text-white placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8 animate-fade-in">
          {categories.map((category) => (
            <Button 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "bg-[#00ff9d] text-[#181f36] hover:bg-[#00ff9d]/80" 
                : "border-[#00ff9d]/30 text-slate-300 hover:bg-[#00ff9d]/10 hover:text-[#00ff9d]"
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            className="animate-fade-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <ProjectCard
              project={project}
              onDonate={() => handleDonate(project.id)}
              onViewUpdates={() => handleViewUpdates(project.id)}
              isExpanded={expandedProject === project.id}
              onToggleExpand={() => toggleExpand(project.id)}
            />
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No projects found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
