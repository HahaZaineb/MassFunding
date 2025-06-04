"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react"
import { useToast } from "./ui/use-toast"
import { ProjectData } from "@/types"

interface NFTPreviewProps {
  projectId: string
  amount: string
  nftId: string
  onBack: () => void
  project: ProjectData
  transactionId?: string
}

export function NFTPreview({ projectId, amount, nftId, onBack, project, transactionId }: NFTPreviewProps) {
  const { toast } = useToast()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
        variant: "default",
      })
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const donationDate = new Date().toLocaleDateString()

  return (
    <div className="max-w-lg mx-auto">
      <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center text-sm text-white mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to projects
      </Button>

      <Card className="bg-gradient-to-br from-[#1a2340] to-[#0f1629] border border-[#00ff9d]/20 shadow-2xl">
        <CardHeader className="text-center border-b border-[#00ff9d]/10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#00ff9d] to-[#00cc7d] rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-black">✓</span>
          </div>
          <CardTitle className="text-white text-2xl">Donation Successful!</CardTitle>
          <CardDescription className="text-slate-300">
            Your contribution has been processed and secured in a vesting schedule
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* NFT Certificate */}
          <div className="bg-gradient-to-br from-[#00ff9d]/10 to-[#00cc7d]/10 border border-[#00ff9d]/20 rounded-lg p-6">
            <h3 className="text-white font-bold text-lg mb-4 text-center">Contribution Certificate NFT</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">NFT ID:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono text-sm">{nftId}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-[#00ff9d]"
                    onClick={() => copyToClipboard(nftId, "NFT ID")}
                  >
                    {copiedField === "NFT ID" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Project:</span>
                <span className="text-white font-medium">{project.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Amount:</span>
                <span className="text-[#00ff9d] font-bold">{amount} MAS</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Date:</span>
                <span className="text-white">{donationDate}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Category:</span>
                <Badge variant="outline" className="bg-[#00ff9d]/20 text-[#00ff9d] border-[#00ff9d]/30">
                  {project.category}
                </Badge>
              </div>
            </div>
          </div>

          {/* Vesting Schedule Details */}
          <div className="bg-[#0f1629] border border-[#00ff9d]/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">Vesting Schedule Created</h4>
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
                <span className="text-slate-400">Release Percentage:</span>
                <div className="text-white font-medium">{project.releasePercentage}%</div>
              </div>
              <div>
                <span className="text-slate-400">Beneficiary:</span>
                <div className="text-white font-medium text-xs font-mono">
                  {project.beneficiary.slice(0, 8)}...{project.beneficiary.slice(-6)}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {transactionId && (
            <div className="bg-[#0f1629] border border-[#00ff9d]/20 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Transaction Details</h4>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transaction ID:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono text-xs">
                    {transactionId.slice(0, 8)}...{transactionId.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-[#00ff9d]"
                    onClick={() => copyToClipboard(transactionId, "Transaction ID")}
                  >
                    {copiedField === "Transaction ID" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-[#00ff9d]"
                    onClick={() => window.open(`https://massascan.io/tx/${transactionId}`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="text-center space-y-2">
            <p className="text-slate-300 text-sm">
              Your {amount} MAS donation has been secured in a smart contract vesting schedule.
            </p>
            <p className="text-slate-400 text-xs">
              Funds will be released to the project creator according to the vesting schedule above.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-[#00ff9d]/30 text-[#00ff9d] hover:bg-[#00ff9d]/10"
            >
              View More Projects
            </Button>
            <Button
              onClick={() => {
                // In a real implementation, this would open the NFT in a wallet or marketplace
                toast({
                  title: "NFT Saved",
                  description: "Your contribution certificate has been saved to your wallet",
                  variant: "default",
                })
              }}
              className="bg-gradient-to-r from-[#00ff9d] to-[#00cc7d] hover:from-[#00cc7d] hover:to-[#00ff9d] text-black font-bold"
            >
              View in Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
