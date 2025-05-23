import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Users, Clock, Coins, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import type { ProjectData } from "./types"

interface ProjectCardProps {
  project: ProjectData
  onDonate: () => void
  onViewUpdates: () => void
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function ProjectCard({ 
  project, 
  onDonate, 
  onViewUpdates, 
  isExpanded = false, 
  onToggleExpand = () => {} 
}: ProjectCardProps) {
  const percentFunded = Math.min(Math.round((project.amountRaised / project.goalAmount) * 100), 100)
  
  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden">
      <CardContent className="p-0">
        {project.image && (
          <div className="w-full h-48 overflow-hidden">
            <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-white">{project.name}</h3>
              <Badge variant="outline" className="mt-1 bg-slate-700 text-white border-none">
                {project.category}
              </Badge>
            </div>
          </div>
          
          <p className="text-slate-300 text-sm mt-4 line-clamp-3">
            {project.description}
          </p>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm text-slate-400 mb-1">
              <span>{project.amountRaised} MAS raised</span>
              <span>{percentFunded}%</span>
            </div>
            <Progress value={percentFunded} className="h-2 bg-slate-700" />
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="flex flex-col items-center bg-slate-700 rounded-md p-2">
                <Coins className="h-4 w-4 text-slate-300 mb-1" />
                <span className="text-xs text-slate-300">{project.goalAmount} MAS</span>
              </div>
              <div className="flex flex-col items-center bg-slate-700 rounded-md p-2">
                <Users className="h-4 w-4 text-slate-300 mb-1" />
                <span className="text-xs text-slate-300">{project.supporters} Backers</span>
              </div>
              <div className="flex flex-col items-center bg-slate-700 rounded-md p-2">
                <Clock className="h-4 w-4 text-slate-300 mb-1" />
                <span className="text-xs text-slate-300">{project.deadline}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button 
              variant="default" 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={onDonate}
            >
              Fund this project
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-slate-600 text-white hover:bg-slate-700"
              onClick={onViewUpdates}
            >
              Updates
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
