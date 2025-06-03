"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Info, Plus, TrendingUp, Users, DollarSign, Calendar, Settings, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { useProjects } from "../context/project-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccountStore } from "@massalabs/react-ui-kit"
import type { ProjectData } from "@/components/types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProjectUpdates } from "@/components/project-updates"
import { MilestoneForm } from "@/components/milestone-form"

export default function RequestFunding() {
  const { toast } = useToast()
  const { addProject, projects, addProjectMilestone } = useProjects()
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
    image: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("request")
  const [showMilestoneForm, setShowMilestoneForm] = useState<string | null>(null)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)

  useEffect(() => {
    setIsWalletConnected(!!connectedAccount)
    if (connectedAccount) {
      console.log("Wallet connected:", connectedAccount.toString())
      setFormData((prev) => ({ ...prev, walletAddress: connectedAccount.toString() }))
    } else {
      console.log("Wallet not connected")
    }
  }, [connectedAccount])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, releasePercentage: value[0] }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const creatorAddress = connectedAccount
        ? connectedAccount.toString().toLowerCase()
        : `AU${Date.now().toString(36)}`
      console.log("[DEBUG] Creating project with creator address:", creatorAddress)

      let imageToUse = formData.image
      if (imageFile && formData.image.startsWith("data:")) {
        imageToUse = formData.image
      }

      const newProject: ProjectData = {
        id: `project-${Date.now()}`,
        name: formData.projectName,
        description: formData.description,
        amountNeeded: Number.parseFloat(formData.amountNeeded),
        goalAmount: Number.parseFloat(formData.amountNeeded),
        amountRaised: 0,
        beneficiary: formData.walletAddress || creatorAddress,
        lockPeriod: formData.lockPeriod,
        releaseInterval: formData.releaseInterval,
        releasePercentage: formData.releasePercentage,
        supporters: 0,
        category: formData.category,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        creator: creatorAddress,
        updates: [],
        milestones: [],
        image: imageToUse || undefined,
      }

      console.log("[DEBUG] Adding project:", newProject)
      addProject(newProject)

      setTimeout(() => {
        const allProjects = localStorage.getItem("projects")
        console.log("[DEBUG] All projects after adding:", allProjects)
      }, 100)

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
        image: "",
      })
      setImageFile(null)

      setActiveTab("my-projects")
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
        const creatorAddress = p.creator?.toLowerCase() || ""
        const connectedAddress = connectedAccount.toString().toLowerCase()
        const match = creatorAddress === connectedAddress

        if (!match) {
          console.log("[DEBUG] Project not matched:", p.id, p.name)
          console.log("[DEBUG] Project creator:", creatorAddress)
          console.log("[DEBUG] Connected wallet:", connectedAddress)
        } else {
          console.log("[DEBUG] Project matched:", p.id, p.name)
        }

        return match
      })
    : []

  const allCategories = Array.from(new Set(myProjectsRaw.map((p) => p.category))).filter(Boolean)
  const categories = ["All", ...allCategories]

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const myProjects = myProjectsRaw.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || project.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculate stats
  const totalProjects = myProjects.length
  const totalFundsRaised = myProjects.reduce((sum, project) => sum + project.amountRaised, 0)
  const totalSupporters = myProjects.reduce((sum, project) => sum + project.supporters, 0)

  return (
    <div className="mx-auto py-8 px-4 bg-[#0f1629]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className='max-w-3xl mx-auto'>
        <TabsList className="mb-8 bg-[#1a2340] border border-[#00ff9d]/20">
          <TabsTrigger
            value="request"
            className="text-slate-300 data-[state=active]:bg-[#00ff9d] data-[state=active]:text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Request Funding
          </TabsTrigger>
          <TabsTrigger
            value="my-projects"
            className="text-slate-300 data-[state=active]:bg-[#00ff9d] data-[state=active]:text-black"
          >
            <Settings className="h-4 w-4 mr-2" />
            My Projects ({totalProjects})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="request">

          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-[#00ff9d] bg-clip-text text-transparent">
                Request Funding
              </h1>
              <p className="text-slate-300 mb-8">
                Fill out the form below to request funding for your project. Your request will be reviewed by the
                community.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20 shadow-2xl">
                <CardHeader className="border-b border-[#00ff9d]/10">
                  <CardTitle className="text-white">Project Details</CardTitle>
                  <CardDescription className="text-slate-400">
                    Provide information about your project and funding requirements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="projectName" className="text-white">
                        Project Name
                      </Label>
                      <Input
                        id="projectName"
                        name="projectName"
                        placeholder="Enter project name"
                        className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
                        value={formData.projectName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white">
                        Project Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe your project and how the funds will be used"
                        className="bg-[#0f1629] border-[#00ff9d]/20 text-white min-h-[120px] focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
                        value={formData.description}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image" className="text-white">
                        Project Image (optional)
                      </Label>
                      <Input
                        id="image"
                        name="image"
                        placeholder="Paste an image URL (e.g. https://...)"
                        className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
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
                          className="text-white text-sm"
                        />
                        {formData.image && formData.image.startsWith("data:") && (
                          <img
                            src={formData.image || "/placeholder.svg"}
                            alt="Preview"
                            className="h-12 w-12 object-cover rounded border border-[#00ff9d]/20"
                          />
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        This image will be shown on your project card. You can paste a URL or upload a file.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amountNeeded" className="text-white">
                          Amount Needed (MAS)
                        </Label>
                        <Input
                          id="amountNeeded"
                          name="amountNeeded"
                          type="number"
                          placeholder="Enter amount"
                          className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
                          value={formData.amountNeeded}
                          onChange={handleChange}
                          min="1"
                          step="1"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-white">
                          Category
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleSelectChange("category", value)}
                        >
                          <SelectTrigger className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a2340] border-[#00ff9d]/20 text-white">
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
                        <Label className="text-white">Vesting Schedule</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1a2340] text-white border border-[#00ff9d]/20">
                              <p className="max-w-xs">
                                Vesting schedules determine how and when funds are released to your project.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lockPeriod" className="text-white">
                            Initial Lock Period (days)
                          </Label>
                          <Select
                            value={formData.lockPeriod}
                            onValueChange={(value) => handleSelectChange("lockPeriod", value)}
                          >
                            <SelectTrigger className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20">
                              <SelectValue placeholder="Select lock period" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a2340] border-[#00ff9d]/20 text-white">
                              <SelectItem value="0">No lock period</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="60">60 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="releaseInterval" className="text-white">
                            Release Interval (days)
                          </Label>
                          <Select
                            value={formData.releaseInterval}
                            onValueChange={(value) => handleSelectChange("releaseInterval", value)}
                          >
                            <SelectTrigger className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20">
                              <SelectValue placeholder="Select release interval" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a2340] border-[#00ff9d]/20 text-white">
                              <SelectItem value="7">Weekly (7 days)</SelectItem>
                              <SelectItem value="30">Monthly (30 days)</SelectItem>
                              <SelectItem value="90">Quarterly (90 days)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="releasePercentage" className="text-white">
                            Release Percentage per Interval
                          </Label>
                          <span className="text-sm text-[#00ff9d] font-semibold">{formData.releasePercentage}%</span>
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

                    <div className="pt-4 border-t border-[#00ff9d]/10">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#00ff9d] to-[#00cc7d] hover:from-[#00cc7d] hover:to-[#00ff9d] text-black font-bold py-3 transition-all duration-300"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating Project..." : "Create Project"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="text-xs text-slate-400 border-t border-[#00ff9d]/10 flex flex-col items-start">
                  <p className="mb-1">
                    By submitting, you agree to the platform's terms and conditions regarding fund distribution.
                  </p>
                  <p>Your project will be visible to potential funders after review.</p>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="my-projects">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                My <span className="text-[#00ff9d]">Projects</span>
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                View and manage your projects on the Massa blockchain.
              </p>
            </div>

            {/* Stats Overview */}
            {totalProjects > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-8 w-8 text-[#00ff9d]" />
                    </div>
                    <div className="text-2xl font-bold text-white">{totalProjects}</div>
                    <div className="text-sm text-slate-400">Total Projects</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="h-8 w-8 text-[#00ff9d]" />
                    </div>
                    <div className="text-2xl font-bold text-white">{totalFundsRaised.toFixed(1)}</div>
                    <div className="text-sm text-slate-400">MAS Raised</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-8 w-8 text-[#00ff9d]" />
                    </div>
                    <div className="text-2xl font-bold text-white">{totalSupporters}</div>
                    <div className="text-sm text-slate-400">Total Supporters</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Projects Grid */}
            {myProjects.length > 0 ? (
              <div className="space-y-8">
                {myProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20 shadow-xl overflow-hidden">
                      <CardContent className="p-0">
                        {/* Project Header */}
                        <div className="p-6 border-b border-[#00ff9d]/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {project.image && (
                                  <img
                                    src={project.image || "/placeholder.svg"}
                                    alt={project.name}
                                    className="w-12 h-12 rounded-lg object-cover border border-[#00ff9d]/20"
                                  />
                                )}
                                <div>
                                  <h3 className="text-xl font-bold text-white">{project.name}</h3>
                                  <span className="inline-block px-2 py-1 text-xs bg-[#00ff9d]/20 text-[#00ff9d] rounded-full">
                                    {project.category}
                                  </span>
                                </div>
                              </div>
                              <p className="text-slate-300 text-sm">{project.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                              className="text-[#00ff9d] hover:bg-[#00ff9d]/10"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {expandedProject === project.id ? "Hide" : "View"} Details
                            </Button>
                          </div>
                        </div>

                        {/* Project Stats */}
                        <div className="p-6 border-b border-[#00ff9d]/10">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-[#00ff9d]">{project.amountRaised}</div>
                              <div className="text-xs text-slate-400">MAS Raised</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{project.goalAmount}</div>
                              <div className="text-xs text-slate-400">Goal</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{project.supporters}</div>
                              <div className="text-xs text-slate-400">Supporters</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">
                                {Math.round((project.amountRaised / project.goalAmount) * 100)}%
                              </div>
                              <div className="text-xs text-slate-400">Funded</div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="w-full bg-[#0f1629] rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-[#00ff9d] to-[#00cc7d] h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min((project.amountRaised / project.goalAmount) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Project Actions */}
                        <div className="p-6 border-b border-[#00ff9d]/10">
                          <div className="flex flex-wrap gap-3">
                            <Button
                              onClick={() => setShowMilestoneForm(showMilestoneForm === project.id ? null : project.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {showMilestoneForm === project.id ? "Cancel" : "Add Milestone"}
                            </Button>
                            <Button
                              variant="outline"
                              className="border-[#00ff9d]/30 text-[#00ff9d] hover:bg-[#00ff9d]/10"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Update
                            </Button>
                          </div>
                        </div>

                        {/* Milestone Form */}
                        {showMilestoneForm === project.id && (
                          <div className="p-6 border-b border-[#00ff9d]/10 bg-[#0f1629]/50">
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
                          </div>
                        )}

                        {/* Project Updates - Only show if expanded */}
                        {expandedProject === project.id && (
                          <div className="p-6">
                            <ProjectUpdates projectId={project.id} projectName={project.name} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                <div className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20 rounded-2xl p-12 max-w-md mx-auto">
                  <TrendingUp className="h-16 w-16 text-[#00ff9d] mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">No Projects Yet</h3>
                  <p className="text-slate-400 mb-6">
                    You haven't created any projects yet. Start by requesting funding for your first project!
                  </p>
                  <Button
                    onClick={() => setActiveTab("request")}
                    className="bg-gradient-to-r from-[#00ff9d] to-[#00cc7d] hover:from-[#00cc7d] hover:to-[#00ff9d] text-black font-bold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
