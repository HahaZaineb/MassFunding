"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { ArrowLeft, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { ConnectWallet } from "./connect-wallet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import { useToast } from "../components/ui/use-toast"

interface DonationFormProps {
  project: {
    id: string
    name: string
    description: string
    amountNeeded: number
    amountRaised: number
    beneficiary: string
    lockPeriod: string
    releaseInterval: string
    releasePercentage: number
  }
  onSubmit: (amount: string) => void
  onBack: () => void
}

export function DonationForm({ project, onSubmit, onBack }: DonationFormProps) {
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [isConnected, setIsConnected] = useState(false)

  const percentFunded = (project.amountRaised / project.amountNeeded) * 100

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount && Number.parseFloat(amount) > 0) {
      toast({
        title: "Processing donation...",
        description: `Donating ${amount} MAS to ${project.name}`,
      })
      onSubmit(amount)
    } else {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      })
    }
  }

  const handleConnect = () => {
    setIsConnected(true)
    toast({
      title: "Wallet connected",
      description: "Your wallet has been connected successfully",
    })
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center text-sm">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to projects
      </Button>

      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle>Donate to {project.name}</CardTitle>
          <CardDescription className="text-slate-300">{project.description}</CardDescription>
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

          <div className="bg-slate-800 p-4 rounded-md space-y-2 text-sm">
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

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <div className="flex items-center mb-2">
                <Label htmlFor="amount">Donation Amount (MAS)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-2">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Amount of MAS tokens to donate</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="bg-slate-600 border-slate-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Your voting power will be equivalent to your donation amount.
              </p>
            </div>

            <div className="pt-2">
              {!isConnected ? (
                <ConnectWallet onConnect={handleConnect} />
              ) : (
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!amount || Number.parseFloat(amount) <= 0}
                >
                  Donate {amount} MAS
                </Button>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-slate-400">
          <p>
            By donating, you agree to the vesting schedule. You can vote to cancel the funding if the project doesn't
            meet expectations.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

