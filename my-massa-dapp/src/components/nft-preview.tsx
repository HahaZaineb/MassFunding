import { Button } from "./ui/button"
import { ArrowLeft } from "lucide-react"
import type { ProjectData } from "./types"

interface NFTPreviewProps {
  projectId: string
  amount: string
  nftId: string
  onBack: () => void
  project: ProjectData
}

export function NFTPreview({ projectId, amount, nftId, onBack, project }: NFTPreviewProps) {
  const donationDate = new Date().toLocaleDateString()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center justify-center bg-[#192132] rounded-xl p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center rounded-full mb-6"
            style={{
              width: 200,
              height: 200,
              background: "linear-gradient(135deg, #20e3b2 0%, #3b82f6 100%)"
            }}
          >
            <span className="text-white text-6xl font-bold">{amount}</span>
          </div>
          <div className="text-2xl font-bold text-white text-center mb-2">
            {project.name} Contributor
          </div>
          <div className="text-lg text-slate-200 text-center mb-2">
            {project.category} Project
          </div>
          <div className="text-slate-400 text-center mb-1">
            #{nftId}
          </div>
          <div className="text-slate-400 text-center mb-4">
            Minted on {donationDate}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="flex items-center text-sm text-white mt-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to NFTs
        </Button>
      </div>
    </div>
  )
}
