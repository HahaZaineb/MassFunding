"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { ArrowLeft, Download, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import confetti from "canvas-confetti"
import { motion } from "framer-motion"

interface NFTPreviewProps {
  projectId: string
  amount: string
  nftId?: string
  onBack: () => void
  project: {
    id: string
    name: string
    category: string
  }
}

export function NFTPreview({ projectId, amount, nftId, onBack, project }: NFTPreviewProps) {
  const [generatedNftId, setGeneratedNftId] = useState(nftId || "")

  useEffect(() => {
    // If no NFT ID was provided, generate one (this is a fallback for testing)
    if (!nftId) {
      setGeneratedNftId(`MF-${projectId}-${Date.now().toString(36)}`)
    }

    // Trigger confetti animation when NFT is generated
    const triggerConfetti = () => {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#ffffff"],
        startVelocity: 30,
        gravity: 0.8,
        scalar: 1.2,
      })
    }

    triggerConfetti()
  }, [projectId, nftId])

  // Function to view NFT on explorer
  const viewOnExplorer = () => {
    // Since this is a demo app and the Massa Explorer doesn't recognize our NFT IDs,
    // we'll show a modal or alert instead
    alert(`
      This is a demo application.
      
      In a production environment, this button would take you to:
      https://explorer.massa.net/mainnet/operations
      
      Your NFT ID: ${generatedNftId}
      Project: ${project.name}
      Amount: ${amount} MAS
    `)

    // Alternatively, just open the Massa Explorer main page
    // window.open("https://explorer.massa.net/mainnet", "_blank")
  }

  // Function to download NFT image
  const downloadNFT = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      alert("Your browser doesn't support canvas operations. Unable to download NFT image.")
      return
    }

    // Set canvas dimensions
    canvas.width = 500
    canvas.height = 500

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 500, 500)
    gradient.addColorStop(0, "#1e293b")
    gradient.addColorStop(1, "#0f172a")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 500, 500)

    // Draw circle
    ctx.beginPath()
    ctx.arc(250, 180, 100, 0, Math.PI * 2)
    const circleGradient = ctx.createLinearGradient(150, 80, 350, 280)
    circleGradient.addColorStop(0, "#10b981") // Green
    circleGradient.addColorStop(1, "#3b82f6") // Blue
    ctx.fillStyle = circleGradient
    ctx.fill()

    // Draw amount text
    ctx.font = "bold 48px Arial"
    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    ctx.fillText(amount, 250, 200)

    // Draw project name
    ctx.font = "bold 24px Arial"
    ctx.fillText(`${project.name} Contributor`, 250, 320)

    // Draw category
    ctx.font = "18px Arial"
    ctx.fillText(`${project.category} Project`, 250, 350)

    // Draw NFT ID
    ctx.font = "16px Arial"
    ctx.fillText(`#${generatedNftId}`, 250, 380)

    // Draw date
    ctx.font = "14px Arial"
    ctx.fillText(`Minted on ${new Date().toLocaleDateString()}`, 250, 410)

    try {
      // Create download link
      const link = document.createElement("a")
      link.download = `MassFunding-NFT-${generatedNftId}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Error generating NFT image:", error)
      alert("Failed to generate NFT image. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center text-sm text-white">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to projects
      </Button>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white">Donation Successful!</h3>
        <p className="text-slate-300">Your NFT has been generated as proof of your contribution</p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <Card className="max-w-md mx-auto bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 overflow-hidden">
          <div className="relative pt-4">
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-slate-700 border-slate-500">
                #{generatedNftId}
              </Badge>
            </div>
            <div className="h-48 mx-auto flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{amount}</span>
              </div>
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-center text-white">{project.name} Contributor</CardTitle>
            <CardDescription className="text-center text-slate-300">{project.category} Project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-md space-y-2 text-sm text-white">
              <div className="flex justify-between">
                <span>Donation Amount:</span>
                <span>{amount} MAS</span>
              </div>
              <div className="flex justify-between">
                <span>Project ID:</span>
                <span>{projectId}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Voting Power:</span>
                <span>{amount} MAS</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" className="text-xs text-white" onClick={downloadNFT}>
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" className="text-xs text-white" onClick={viewOnExplorer}>
              <ExternalLink className="h-3 w-3 mr-1" />
              View on Explorer
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="text-center mt-6 text-sm text-slate-400">
        <p>This NFT represents your contribution and voting rights.</p>
        <p>You can use it to vote on project decisions and track your funding.</p>
      </div>
    </div>
  )
}

