"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/button"
import { ThumbsUp, Users, Clock, Coins, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import type { ProjectData } from "../types"

interface ProjectCardProps {
  project: ProjectData
  onDonate: () => void
  onViewUpdates: () => void
  isExpanded: boolean
  onToggleExpand: () => void
  showActions?: boolean
}

export function ProjectCard({
  project,
  onDonate,
  onViewUpdates,
  isExpanded,
  onToggleExpand,
  showActions = true,
}: ProjectCardProps) {
  const percentFunded = (project.amountRaised / project.amountNeeded) * 100

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="bg-slate-700 border-slate-600 text-white h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription className="text-slate-300 mt-1">
                {isExpanded ? project.description : `${project.description.substring(0, 80)}...`}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-slate-600">
              {project.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">
                {project.amountRaised} / {project.amountNeeded} MAS
              </span>
              <span className="text-sm font-medium">{percentFunded.toFixed(0)}%</span>
            </div>
            <Progress value={percentFunded} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex flex-col items-center p-2 bg-slate-800 rounded-md">
              <Users className="h-4 w-4 mb-1" />
              <span>{project.supporters} Supporters</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-slate-800 rounded-md">
              <Clock className="h-4 w-4 mb-1" />
              <span>Every {project.releaseInterval}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-slate-800 rounded-md">
              <Coins className="h-4 w-4 mb-1" />
              <span>{project.releasePercentage}% Release</span>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4"
              >
                <div className="bg-slate-800 p-4 rounded-md space-y-2">
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

                {showActions && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={onViewUpdates} className="text-white">
                      View Updates
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" className="text-xs text-white" onClick={onToggleExpand}>
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show More
              </>
            )}
          </Button>
          {showActions && (
            <Button onClick={onDonate} className="bg-green-600 hover:bg-green-700 text-white" size="sm">
              <ThumbsUp className="h-3 w-3 mr-1" />
              Fund This Project
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
