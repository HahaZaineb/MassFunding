import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ArrowLeft, Info, Loader2 } from "lucide-react"
import { useAccountStore, ConnectMassaWallet } from "@massalabs/react-ui-kit"

import { fundProject } from "../services/contract-service"
import { useToast } from "./ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { ProjectData } from "@/types"

interface DonationFormProps {
  project: ProjectData
  onBack: () => void
  onSubmit: (amount: string) => void
  isProcessing?: boolean
}

export function DonationForm({ project, onBack, onSubmit, isProcessing }: DonationFormProps) {
  const { connectedAccount } = useAccountStore()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // No useEffect for isWalletConnected needed here

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount greater than 0.",
        variant: "destructive",
      })
      return
    }

    if (!connectedAccount) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make a donation.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Starting donation process...")
      console.log("Project:", project)
      console.log("Amount:", amount)

      // Convert amount to BigInt in nanoMAS (1 MAS = 1e9 nanoMAS)
      const amountInNanoMas = BigInt(Math.round(parseFloat(amount) * 1e9));

      // Call the fundProject function from the service
      await fundProject(connectedAccount, Number(project.id), amountInNanoMas);

      console.log(`Project ${project.id} funded successfully.`);

      toast({
        title: "Donation Successful!",
        description: `Your donation of ${amount} MAS to project ${project.name} has been processed.`,
        variant: "default",
      })

      // Update project data locally
      onSubmit(amount)

    } catch (error) {
      console.error("Failed to donate:", error)

      let errorMessage = "Failed to process donation. Please try again."
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Donation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }


  const percentFunded = Math.min(Math.round((project.amountRaised / project.goalAmount) * 100), 100)

  return (
    <div className="max-w-lg mx-auto">
      <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center text-sm text-white mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to projects
      </Button>

      <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20 shadow-2xl">
        <CardHeader className="border-b border-[#00ff9d]/10">
          <CardTitle className="text-white">Donate to {project.name}</CardTitle>
          <CardDescription className="text-slate-300">
            Support this project with a secure vesting schedule
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Project Progress */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Progress</label>
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                  <span>Current: {project.amountRaised} MAS</span>
                  <span>Goal: {project.goalAmount} MAS</span>
                </div>
                <Progress value={percentFunded} className="h-2 bg-slate-800" />
                <div className="text-center text-sm text-slate-400 mt-1">{percentFunded}% funded</div>
              </div>

              {/* Vesting Schedule Info */}
              <div className="bg-[#0f1629] p-4 rounded-lg border border-[#00ff9d]/20">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-[#00ff9d]" />
                  Vesting Schedule Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">Lock Period:</span>
                    <div className="text-white font-medium">{project.lockPeriod} days</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Release Interval:</span>
                    <div className="text-white font-medium">{project.releaseInterval} days</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Release %:</span>
                    <div className="text-white font-medium">{project.releasePercentage}%</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Beneficiary:</span>
                    <div className="text-white font-medium text-xs font-mono">
                      {project.beneficiary.slice(0, 8)}...{project.beneficiary.slice(-6)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  Your funds will be locked for {project.lockPeriod} days, then released {project.releasePercentage}%
                  every {project.releaseInterval} days.
                </div>
              </div>

              {/* Donation Amount */}
              <div>
                <div className="flex items-center mb-2">
                  <label htmlFor="amount" className="text-white font-medium">
                    Donation Amount (MAS)
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-2 text-slate-400">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1a2340] text-white border border-[#00ff9d]/20">
                        <p className="max-w-xs">
                          Amount of MAS tokens to donate. These will be held in a vesting schedule according to the
                          project parameters.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount (e.g., 100)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0.1"
                  step="0.1"
                  className="bg-[#0f1629] border-[#00ff9d]/20 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Minimum donation: 0.1 MAS
                </p>
              </div>

              {/* Wallet Connection and Submit */}
              <div className="mt-6">
                {!connectedAccount ? (
                  <ConnectMassaWallet />
                ) : (
                  <Button
                    type="submit"
                    className="w-full bg-[#00ff9d] text-slate-900 hover:bg-[#00e68f] transition-colors"
                    disabled={isSubmitting || isProcessing}
                  >
                    {isSubmitting || isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Donation...
                      </>
                    ) : (
                      `Donate ${amount || "0"} MAS`
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>

        <div className="px-6 pb-6">
          <div className="text-xs text-slate-400 bg-[#0f1629]/50 p-3 rounded border border-[#00ff9d]/10">
            <p className="mb-1">
              <strong>Important:</strong> By donating, you agree to the vesting schedule terms.
            </p>
            <p>
              Your funds will be securely held in a smart contract and released according to the project's vesting
              schedule.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
