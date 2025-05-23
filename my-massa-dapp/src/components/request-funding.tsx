"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { ArrowLeft, Info } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Slider } from "./ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { useToast } from "./ui/use-toast"
import { useProjects } from "../context/project-context"
import { useNavigate } from "../hooks/use-navigate"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Connect } from "./connect-massa-wallet"
import { useAccountStore } from "@massalabs/react-ui-kit"
import type { ProjectData } from "./types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { ProjectUpdates } from "./project-updates"
import { MilestoneForm } from "./milestone-form"
import { ProjectCard } from "./project-card"

interface RequestFundingProps {
  onBack: () => void
}

export function RequestFunding({ onBack }: RequestFundingProps) {
  const { toast } = useToast()
  const { addProject, projects, addProjectMilestone } = useProjects()
  const { navigate } = useNavigate()
  const { connectedAccount } = useAccountStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(!!connectedAccount)
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    amountNeeded: "",
    walletAddress: "",
    lockPeriod: "30",
    releaseInterval: "30",
    releasePercentage: 10,
    category: "Environment",
    image: ""
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("request")
  const [showMilestoneForm, setShowMilestoneForm] = useState<string | null>(null)

  useEffect(() => {
    setIsWalletConnected(!!connectedAccount)
    if (connectedAccount) {
      console.log("Wallet connected:", connectedAccount.toString())
      // Set the wallet address in the form
      setFormData(prev => ({ ...prev, walletAddress: connectedAccount.toString() }))
    } else {
      console.log("Wallet not connected")
    }
  }, [connectedAccount])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, releasePercentage: value[0] }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      setImageFile(file)
      // Preview: convert to data URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Debug: log connectedAccount and formData
      console.log("[DEBUG] Creating project with connectedAccount:", connectedAccount?.toString())
      console.log("[DEBUG] Form data:", formData)
      // Use file image if present, otherwise URL
      let imageToUse = formData.image
      if (imageFile && formData.image.startsWith("data:")) {
        imageToUse = formData.image
      }
      const creatorAddress = connectedAccount ? connectedAccount.toString() : `AU${Date.now().toString(36)}`
      const newProject: ProjectData = {
        id: `project-${Date.now()}`,
        name: formData.projectName,
        description: formData.description,
        amountNeeded: parseFloat(formData.amountNeeded),
        goalAmount: parseFloat(formData.amountNeeded),
        amountRaised: 0,
        beneficiary: formData.walletAddress || `AU${Date.now().toString(36)}`,
        lockPeriod: formData.lockPeriod,
        releaseInterval: formData.releaseInterval,
        releasePercentage: formData.releasePercentage,
        supporters: 0,
        category: formData.category,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        creator: creatorAddress,
        updates: [],
        milestones: [],
        image: imageToUse || undefined
      }
      console.log("[DEBUG] Adding project:", newProject)
      addProject(newProject)
      // Show success toast
      toast({
        title: "Project Created",
        description: "Your funding request has been submitted successfully.",
        variant: "default",
      })
      setFormData({
        projectName: "",
        description: "",
        amountNeeded: "",
        walletAddress: connectedAccount ? connectedAccount.toString() : "",
        lockPeriod: "30",
        releaseInterval: "30",
        releasePercentage: 10,
        category: "Environment",
        image: ""
      })
      setImageFile(null)
      setTimeout(() => {
        navigate("home")
      }, 1500)
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter projects created by the connected user
  const myProjectsRaw = connectedAccount
    ? projects.filter((p) => {
        const match = p.creator?.toLowerCase() === connectedAccount.toString().toLowerCase()
        if (!match) {
          console.log("[DEBUG] Project not matched:", p, "Wallet:", connectedAccount.toString())
        }
        return match
      })
    : []

  // Gather all categories from user's projects
  const allCategories = Array.from(new Set(myProjectsRaw.map(p => p.category))).filter(Boolean)
  const categories = ["All", ...allCategories]

  // State for search and category filter
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Filtered projects
  const myProjects = myProjectsRaw.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || project.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="request">Request Funding</TabsTrigger>
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="request">
          <Button variant="ghost" size="sm" onClick={() => navigate("home")} className="flex items-center text-sm text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Button>

          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Request Funding</h1>
            <p className="text-slate-300 mb-8">
              Fill out the form below to request funding for your project. Your request will be reviewed by the community.
            </p>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription className="text-slate-400">
                  Provide information about your project and funding requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      name="projectName"
                      placeholder="Enter project name"
                      className="bg-slate-700 border-slate-600 text-white"
                      value={formData.projectName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your project and how the funds will be used"
                      className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Project Image (optional)</Label>
                    <Input
                      id="image"
                      name="image"
                      placeholder="Paste an image URL (e.g. https://...)"
                      className="bg-slate-700 border-slate-600 text-white"
                      value={formData.image}
                      onChange={handleChange}
                      type="url"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        id="imageFile"
                        name="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="text-white"
                      />
                      {formData.image && formData.image.startsWith("data:") && (
                        <img src={formData.image} alt="Preview" className="h-12 w-12 object-cover rounded" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400">This image will be shown on your project card. You can paste a URL or upload a file. File takes precedence.</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amountNeeded">Amount Needed (MAS)</Label>
                      <Input
                        id="amountNeeded"
                        name="amountNeeded"
                        type="number"
                        placeholder="Enter amount"
                        className="bg-slate-700 border-slate-600 text-white"
                        value={formData.amountNeeded}
                        onChange={handleChange}
                        min="1"
                        step="1"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange("category", value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600 text-white">
                          <SelectItem value="Environment">Environment</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Community">Community</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Vesting Schedule</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-700 text-white">
                            <p className="max-w-xs">
                              Vesting schedules determine how and when funds are released to your project.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lockPeriod">Initial Lock Period (days)</Label>
                        <Select
                          value={formData.lockPeriod}
                          onValueChange={(value) => handleSelectChange("lockPeriod", value)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select lock period" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600 text-white">
                            <SelectItem value="0">No lock period</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="180">180 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="releaseInterval">Release Interval (days)</Label>
                        <Select
                          value={formData.releaseInterval}
                          onValueChange={(value) => handleSelectChange("releaseInterval", value)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select release interval" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600 text-white">
                            <SelectItem value="7">Weekly (7 days)</SelectItem>
                            <SelectItem value="30">Monthly (30 days)</SelectItem>
                            <SelectItem value="90">Quarterly (90 days)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="releasePercentage">Release Percentage per Interval</Label>
                        <span className="text-sm text-slate-400">{formData.releasePercentage}%</span>
                      </div>
                      <Slider
                        id="releasePercentage"
                        min={5}
                        max={50}
                        step={5}
                        value={[formData.releasePercentage]}
                        onValueChange={handleSliderChange}
                        className="py-4"
                      />
                      <p className="text-xs text-slate-400">
                        This determines what percentage of the total funds will be released at each interval.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating Project..." : "Create Project"}
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="text-xs text-slate-400 border-t border-slate-700 flex flex-col items-start">
                <p className="mb-1">
                  By submitting, you agree to the platform's terms and conditions regarding fund distribution.
                </p>
                <p>
                  Your project will be visible to potential funders after review.
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="my-projects">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center animate-fade-in">
            My <span className="text-[#00ff9d]">Projects</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl text-center mb-6 animate-fade-in mx-auto">
            View and manage your projects on the Massa blockchain.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className="animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <ProjectCard
                  project={project}
                  onDonate={() => {}}
                  onViewUpdates={() => {}}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                    onClick={() => setShowMilestoneForm(project.id)}
                  >
                    Add Milestone
                  </Button>
                </div>
                {showMilestoneForm === project.id && (
                  <MilestoneForm
                    projectId={project.id}
                    onSubmit={(milestone) => {
                      addProjectMilestone(project.id, {
                        ...milestone,
                        id: `milestone-${Date.now()}`,
                        completed: false,
                      })
                      setShowMilestoneForm(null)
                    }}
                    onCancel={() => setShowMilestoneForm(null)}
                  />
                )}
                <ProjectUpdates projectId={project.id} projectName={project.name} />
              </motion.div>
            ))}
          </div>

          {myProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No projects found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
