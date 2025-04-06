"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { ArrowLeft, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Slider } from "./ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { useToast } from "./ui/use-toast"

interface RequestFundingProps {
  onBack: () => void
}

export default function RequestFunding({ onBack }: RequestFundingProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    amountNeeded: "",
    walletAddress: "",
    lockPeriod: "30",
    releaseInterval: "7",
    releasePercentage: 10,
    tokenAddress: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    try {
      // Convert values to appropriate formats
      const totalAmount = Number.parseInt(formData.amountNeeded)
      const lockPeriod = Number.parseInt(formData.lockPeriod)
      const releaseInterval = Number.parseInt(formData.releaseInterval)

      // In a real implementation, you would call your API or service here
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Funding request submitted!",
        description: "Your funding request has been submitted successfully.",
        variant: "default",
      })

      // Go back to main screen
      onBack()
    } catch (error) {
      console.error("Failed to submit funding request:", error)
      toast({
        title: "Failed to submit funding request",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">Request Funding</h2>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName" className="text-white">
                Project Name
              </Label>
              <Input
                id="projectName"
                name="projectName"
                placeholder="Enter your project name"
                value={formData.projectName}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                Project Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your project and how the funds will be used"
                value={formData.description}
                onChange={handleChange}
                required
                className="min-h-[120px] bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>

            <div>
              <Label htmlFor="amountNeeded" className="text-white">
                Amount Needed (MAS)
              </Label>
              <Input
                id="amountNeeded"
                name="amountNeeded"
                type="number"
                placeholder="1000"
                value={formData.amountNeeded}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>

            <div>
              <Label htmlFor="walletAddress" className="text-white">
                Beneficiary Wallet Address
              </Label>
              <Input
                id="walletAddress"
                name="walletAddress"
                placeholder="AU12..."
                value={formData.walletAddress}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <Label htmlFor="lockPeriod" className="text-white">
                  Lock Period (days)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-2 text-white">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Time before funds start releasing</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={formData.lockPeriod}
                onValueChange={(value: string) => handleSelectChange("lockPeriod", value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select lock period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No lock period</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <Label htmlFor="releaseInterval" className="text-white">
                  Release Interval (days)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-2 text-white">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How often funds are released</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={formData.releaseInterval}
                onValueChange={(value: string) => handleSelectChange("releaseInterval", value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select release interval" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 text-white">
                  <SelectItem value="1" className="focus:bg-slate-700 focus:text-white">
                    Daily
                  </SelectItem>
                  <SelectItem value="7" className="focus:bg-slate-700 focus:text-white">
                    Weekly
                  </SelectItem>
                  <SelectItem value="14" className="focus:bg-slate-700 focus:text-white">
                    Bi-weekly
                  </SelectItem>
                  <SelectItem value="30" className="focus:bg-slate-700 focus:text-white">
                    Monthly
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Label htmlFor="releasePercentage" className="text-white">
                    Release Percentage
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-2 text-white">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Percentage of total funds released each interval</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-sm font-medium text-white">{formData.releasePercentage}%</span>
              </div>
              <Slider
                defaultValue={[10]}
                max={100}
                step={5}
                value={[formData.releasePercentage]}
                onValueChange={handleSliderChange}
                className="py-4 border border-slate-600 rounded-full px-2"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Funding Request"}
            </Button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  )
}

