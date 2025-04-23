import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { ArrowLeft, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import {
  ConnectMassaWallet,
  useAccountStore,
} from '@massalabs/react-ui-kit';



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
    category: string
  }
  onSubmit: (amount: string, nftId: string) => void
  onBack: () => void
}

export function DonationForm({ project, onSubmit, onBack }: DonationFormProps) {
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  //const [isConnected, setIsConnected] = useState(false)
  const { connectedAccount } = useAccountStore();  
  const percentFunded = (project.amountRaised / project.amountNeeded) * 100
  const [isWalletConnected, setIsWalletConnected] = useState(!!connectedAccount)

  useEffect(() => {
    setIsWalletConnected(!!connectedAccount)
    if (connectedAccount) {
      console.log("Wallet connected:")
    } else {
      console.log("Wallet not connected")
    }
  }, [connectedAccount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connectedAccount) {
      console.error('No connected account');
      return;
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid donation amount")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Starting donation process...")
      console.log("Project:", project)
      console.log("Amount:", amount)

      // Simulate donation process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate a mock NFT ID
      const mockNftId = `MF-${Date.now().toString(36)}`

      // Call onSubmit with the amount and NFT ID
      onSubmit(amount, mockNftId)
    } catch (error) {
      console.error("Failed to donate:", error)
      alert("Failed to process donation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  /*const handleConnect = () => {
    setIsConnected(true)
  }*/

  return (
    <div className="space-y-6 text-white">
      <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center text-sm text-white">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to projects
      </Button>

      <Card className="bg-slate-700 border-slate-600 text-white">
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
                <Label htmlFor="amount" className="text-white">
                  Donation Amount (MAS)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-2 text-white">
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
                className="bg-slate-600 border-slate-500 text-white"
              />
              <p className="text-xs text-slate-400 mt-1">
                Your voting power will be equivalent to your donation amount.
              </p>
            </div>

            
            
            <div className="theme-light">
                <ConnectMassaWallet />
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                  disabled={isSubmitting || !amount || Number.parseFloat(amount) <= 0}
                >
                  {isSubmitting ? "Processing..." : `Donate ${amount || "0"} MAS`}
                </Button>
              
              </div>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-slate-400">
          <p>By donating, you agree to the vesting schedule. You will receive an NFT as proof of your contribution.</p>
        </CardFooter>
      </Card>
    </div>
  )
}
