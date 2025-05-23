import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { CheckCircle2 } from "lucide-react"

// Define the types directly in this file
interface ProjectUpdate {
  id: string
  date: string
  title: string
  content: string
  author: string
}

interface ProjectMilestone {
  id: string
  title: string
  description: string
  deadline: string
  completed: boolean
  progress: number
}

interface ProjectUpdatesProps {
  projectId: string
  projectName: string
}

export function ProjectUpdates({ projectId, projectName }: ProjectUpdatesProps) {
  const [activeTab, setActiveTab] = useState("updates")
  
  // Mock data for updates
  const mockUpdates: ProjectUpdate[] = [
    {
      id: "update-1",
      date: "2023-05-15",
      title: "Development Started",
      content: "We've begun development on the core features of our project. The team is excited to bring this vision to life!",
      author: "Project Team"
    },
    {
      id: "update-2",
      date: "2023-06-01",
      title: "First Milestone Reached",
      content: "We're happy to announce that we've completed our first major milestone. The prototype is now functional and we're moving on to the next phase.",
      author: "Project Team"
    }
  ]
  
  // Mock data for milestones
  const mockMilestones: ProjectMilestone[] = [
    {
      id: "milestone-1",
      title: "Initial Research",
      description: "Complete market research and feasibility studies",
      deadline: "2023-04-30",
      completed: true,
      progress: 100
    },
    {
      id: "milestone-2",
      title: "Prototype Development",
      description: "Develop a working prototype of the core functionality",
      deadline: "2023-06-15",
      completed: true,
      progress: 100
    },
    {
      id: "milestone-3",
      title: "Beta Testing",
      description: "Release beta version for testing with a limited user group",
      deadline: "2023-08-30",
      completed: false,
      progress: 45
    }
  ]

  // Custom date formatter function that doesn't rely on date-fns
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{projectName} Updates</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="updates" className="text-white">
            Updates
          </TabsTrigger>
          <TabsTrigger value="milestones" className="text-white">
            Milestones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="mt-4 space-y-4">
          {mockUpdates.map((update) => (
            <Card key={update.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white">{update.title}</CardTitle>
                  <div className="text-sm text-slate-400">{formatDate(update.date)}</div>
                </div>
                <CardDescription className="text-slate-400">Posted by {update.author}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{update.content}</p>
              </CardContent>
            </Card>
          ))}
          
          {mockUpdates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">No updates have been posted yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="milestones" className="mt-4 space-y-4">
          {mockMilestones.map((milestone) => (
            <Card key={milestone.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {milestone.completed && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    )}
                    <CardTitle className="text-white">{milestone.title}</CardTitle>
                  </div>
                  <div className="text-sm text-slate-400">Due: {formatDate(milestone.deadline)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">{milestone.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-slate-400">{milestone.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-blue-600'}`}
                      style={{ width: `${milestone.progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {mockMilestones.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">No milestones have been set for this project.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
