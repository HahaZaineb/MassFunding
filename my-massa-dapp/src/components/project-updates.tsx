"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { CalendarDays, CheckCircle2, Clock } from "lucide-react"

interface ProjectUpdatesProps {
  projectId: string
  projectName: string
}

export function ProjectUpdates({ projectId, projectName }: ProjectUpdatesProps) {
  // Mock data for updates
  const updates = [
    {
      id: "update-1",
      date: "2023-06-10",
      title: "Project Kickoff",
      content:
        "We're excited to announce that we've officially started work on this project. Our team has completed the initial planning phase and we're ready to move forward with development.",
      author: "Project Team",
    },
    {
      id: "update-2",
      date: "2023-08-25",
      title: "Prototype Completed",
      content:
        "We've successfully completed the prototype ahead of schedule! Initial feedback has been very positive, and we're now preparing for the testing phase with our target users.",
      author: "Project Team",
    },
    {
      id: "update-3",
      date: "2023-10-15",
      title: "Testing Progress Update",
      content:
        "Testing is well underway with over 50 participants. We've identified some areas for improvement and are making necessary adjustments to ensure the final product meets all requirements.",
      author: "Project Team",
    },
  ]

  // Mock data for milestones
  const milestones = [
    {
      id: "milestone-1",
      title: "Project Planning",
      description: "Complete project planning and initial research",
      deadline: "2023-06-15",
      completed: true,
      progress: 100,
    },
    {
      id: "milestone-2",
      title: "Prototype Development",
      description: "Develop a working prototype of the solution",
      deadline: "2023-08-30",
      completed: true,
      progress: 100,
    },
    {
      id: "milestone-3",
      title: "Testing Phase",
      description: "Conduct thorough testing with target users",
      deadline: "2023-11-15",
      completed: false,
      progress: 65,
    },
  ]

  const [activeTab, setActiveTab] = useState<"updates" | "milestones">("updates")

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const overallProgress = Math.round(
    milestones.reduce((sum, milestone) => sum + milestone.progress, 0) / milestones.length,
  )

  return (
    <Card className="bg-slate-700 border-slate-600 text-white">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{projectName} Updates</CardTitle>
            <CardDescription className="text-slate-300 mt-1">
              Track progress and stay informed about project developments
            </CardDescription>
          </div>
          <Badge className="bg-blue-600">{overallProgress}% Complete</Badge>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button
            variant={activeTab === "updates" ? "default" : "outline"}
            onClick={() => setActiveTab("updates")}
            className={activeTab === "updates" ? "bg-slate-600" : "text-white"}
          >
            Updates
          </Button>
          <Button
            variant={activeTab === "milestones" ? "default" : "outline"}
            onClick={() => setActiveTab("milestones")}
            className={activeTab === "milestones" ? "bg-slate-600" : "text-white"}
          >
            Milestones
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeTab === "updates" ? (
          <div className="space-y-6">
            {updates.map((update) => (
              <div key={update.id} className="border-l-2 border-slate-500 pl-4 pb-6">
                <div className="flex items-center mb-2">
                  <CalendarDays className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-sm text-slate-400">{formatDate(update.date)}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{update.title}</h3>
                <p className="text-slate-300">{update.content}</p>
                <div className="mt-2 text-sm text-slate-400">Posted by {update.author}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>

            {milestones.map((milestone) => (
              <div key={milestone.id} className="bg-slate-800 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{milestone.title}</h3>
                  <Badge className={milestone.completed ? "bg-green-600" : "bg-blue-600"}>
                    {milestone.completed ? "Completed" : `${milestone.progress}%`}
                  </Badge>
                </div>

                <p className="text-slate-300 mt-2">{milestone.description}</p>

                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                </div>

                <div className="flex items-center mt-4 text-sm text-slate-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Deadline: {formatDate(milestone.deadline)}</span>
                </div>

                {milestone.completed && (
                  <div className="flex items-center mt-2 text-green-500 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span>Completed on {formatDate(milestone.deadline)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-slate-400">
        <p>Project updates are provided by the project team and verified by MassFunding.</p>
      </CardFooter>
    </Card>
  )
}
