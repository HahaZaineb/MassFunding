"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, ThumbsUp, Users, Clock, Coins } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

// Mock data for projects
const projects = [
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

interface FundProps {
  onBack: () => void
}

export default function Fund({ onBack }: FundProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [showNFT, setShowNFT] = useState(false)
  const [donationAmount, setDonationAmount] = useState("")
  const [connectedWallet, setConnectedWallet] = useState<any>(null)

  const handleDonate = (projectId: string) => {
    setSelectedProject(projectId)
    setShowDonationForm(true)
  }

  const handleDonationSubmit = (amount: string) => {
    console.log(`Donating ${amount} MAS to project ${selectedProject}`)
    setDonationAmount(amount)
    setShowDonationForm(false)
    setShowNFT(true)
    // Here you would call your smart contract
  }

  const handleBackToProjects = () => {
    setSelectedProject(null)
    setShowDonationForm(false)
    setShowNFT(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">Fund Projects</h2>
      </div>

      {!showDonationForm && !showNFT ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4 mt-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDonate={() => handleDonate(project.id)} />
            ))}
          </TabsContent>
          <TabsContent value="environment" className="space-y-4 mt-4">
            {projects
              .filter((p) => p.category.toLowerCase() === "environment")
              .map((project) => (
                <ProjectCard key={project.id} project={project} onDonate={() => handleDonate(project.id)} />
              ))}
          </TabsContent>
          <TabsContent value="education" className="space-y-4 mt-4">
            {projects
              .filter((p) => p.category.toLowerCase() === "education")
              .map((project) => (
                <ProjectCard key={project.id} project={project} onDonate={() => handleDonate(project.id)} />
              ))}
          </TabsContent>
          <TabsContent value="healthcare" className="space-y-4 mt-4">
            {projects
              .filter((p) => p.category.toLowerCase() === "healthcare")
              .map((project) => (
                <ProjectCard key={project.id} project={project} onDonate={() => handleDonate(project.id)} />
              ))}
          </TabsContent>
        </Tabs>
      ) : showNFT ? (
        <div className="text-center p-8 bg-slate-800 rounded-lg">
          <h3 className="text-xl font-bold mb-4">NFT Preview</h3>
          <p>
            Your NFT for project {selectedProject} with donation amount {donationAmount} MAS would be displayed here.
          </p>
          <Button onClick={handleBackToProjects} className="mt-4">
            Back to Projects
          </Button>
        </div>
      ) : (
        <div className="p-8 bg-slate-800 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Donation Form</h3>
          <p>Donation form for project {selectedProject} would be displayed here.</p>
          <div className="flex gap-4 mt-4">
            <Button onClick={handleBackToProjects} variant="outline">
              Cancel
            </Button>
            <Button onClick={() => handleDonationSubmit("100")}>Submit Donation</Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface ProjectCardProps {
  project: (typeof projects)[0]
  onDonate: () => void
}

function ProjectCard({ project, onDonate }: ProjectCardProps) {
  const percentFunded = (project.amountRaised / project.amountNeeded) * 100

  return (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription className="text-slate-300 mt-1">{project.description}</CardDescription>
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
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="text-xs">
          <ExternalLink className="h-3 w-3 mr-1" />
          View Details
        </Button>
        <Button onClick={onDonate} className="bg-green-600 hover:bg-green-700" size="sm">
          <ThumbsUp className="h-3 w-3 mr-1" />
          Fund This Project
        </Button>
      </CardFooter>
    </Card>
  )
}
