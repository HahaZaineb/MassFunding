import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ArrowLeft } from "lucide-react"
import { useAccountStore, ConnectMassaWallet } from "@massalabs/react-ui-kit"
import type { ProjectData } from "./types"
import { NFTPreview } from "./nft-preview"

interface DonationFormProps {
  project: ProjectData
  onBack: () => void
  onSubmit: (amount: string, nftId: string) => void
}

export function DonationForm({ project, onBack, onSubmit }: DonationFormProps) {
  const { connectedAccount } = useAccountStore()
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(!!connectedAccount)
  const [showNFT, setShowNFT] = useState(false)
  const [nftId, setNftId] = useState("")

  useEffect(() => {
    setIsWalletConnected(!!connectedAccount)
  }, [connectedAccount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || Number.parseFloat(amount) <= 0) {
      return
    }

    if (!connectedAccount) {
      alert("Please connect your wallet first")
      return
    }

    setIsSubmitting(true)

    try {
      // Mock successful donation for development purposes
      // In production, this would call the actual blockchain
      const mockNftId = `MF-${Date.now().toString(36)}`
      
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update project data locally
      onSubmit(amount, mockNftId)
      
      // Show NFT preview
      setNftId(mockNftId)
      setShowNFT(true)
    } catch (error) {
      console.error("Failed to donate:", error)
      alert("Failed to process donation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showNFT) {
    return (
      <NFTPreview 
        projectId={project.id}
        amount={amount}
        nftId={nftId}
        onBack={onBack}
        project={project}
      />
    )
  }

  const percentFunded = Math.min(Math.round((project.amountRaised / project.goalAmount) * 100), 100)

  return (
    <div className="max-w-lg mx-auto">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onBack} 
        className="flex items-center text-sm text-white mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to projects
      </Button>

      <div className="bg-slate-900 rounded-lg overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-white mb-1">Donate to {project.name}</h2>
        <p className="text-slate-400 mb-6">Support this project by making a donation</p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Donation Amount (MAS)
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500 focus:border-blue-500"
                min="0.1"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project Progress
              </label>
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Current: {project.amountRaised} MAS</span>
                <span>Goal: {project.goalAmount} MAS</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${percentFunded}%` }}
                ></div>
              </div>
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
          </div>
        </form>
      </div>
    </div>
  )
}


