"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ConnectWallet } from "./connect-wallet"

interface RequestFundingProps {
  onBack: () => void
}

export default function RequestFunding({ onBack }: RequestFundingProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting funding request:", formData)
    // Here you would call your smart contract
    alert("Funding request submitted successfully!")
    onBack()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">Request Funding</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              name="projectName"
              placeholder="Enter your project name"
              value={formData.projectName}
              onChange={handleChange}
              required
              className="bg-slate-700 border-slate-600"
            />
          </div>

          <div>
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your project and how the funds will be used"
              value={formData.description}
              onChange={handleChange}
              required
              className="min-h-[120px] bg-slate-700 border-slate-600"
            />
          </div>

          <div>
            <Label htmlFor="amountNeeded">Amount Needed (MAS)</Label>
            <Input
              id="amountNeeded"
              name="amountNeeded"
              type="number"
              placeholder="1000"
              value={formData.amountNeeded}
              onChange={handleChange}
              required
              className="bg-slate-700 border-slate-600"
            />
          </div>

          <div>
            <Label htmlFor="walletAddress">Beneficiary Wallet Address</Label>
            <Input
              id="walletAddress"
              name="walletAddress"
              placeholder="AU12..."
              value={formData.walletAddress}
              onChange={handleChange}
              required
              className="bg-slate-700 border-slate-600"
            />
          </div>

          <div>
            <Label htmlFor="tokenAddress">Token Address (MAS)</Label>
            <Input
              id="tokenAddress"
              name="tokenAddress"
              placeholder="AS12..."
              value={formData.tokenAddress}
              onChange={handleChange}
              required
              className="bg-slate-700 border-slate-600"
            />
          </div>

          <div>
            <div className="flex items-center mb-2">
              <Label htmlFor="lockPeriod">Lock Period</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-2">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Time before funds start releasing</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={formData.lockPeriod} onValueChange={(value) => handleSelectChange("lockPeriod", value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
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
              <Label htmlFor="releaseInterval">Release Interval</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-2">
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
              onValueChange={(value) => handleSelectChange("releaseInterval", value)}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue placeholder="Select release interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Daily</SelectItem>
                <SelectItem value="7">Weekly</SelectItem>
                <SelectItem value="14">Bi-weekly</SelectItem>
                <SelectItem value="30">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Label htmlFor="releasePercentage">Release Percentage</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-2">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentage of total funds released each interval</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">{formData.releasePercentage}%</span>
            </div>
            <Slider
              defaultValue={[10]}
              max={100}
              step={5}
              value={[formData.releasePercentage]}
              onValueChange={handleSliderChange}
              className="py-4"
            />
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <ConnectWallet />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Submit Funding Request
          </Button>
        </div>
      </form>
    </div>
  )
}
