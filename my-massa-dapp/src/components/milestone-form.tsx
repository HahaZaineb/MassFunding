"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { useToast } from "./ui/use-toast"

interface MilestoneFormProps {
  projectId: string
  onSubmit: (milestone: {
    title: string
    description: string
    deadline: string
    progress: number
  }) => void
  onCancel: () => void
}

export function MilestoneForm({ projectId, onSubmit, onCancel }: MilestoneFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    progress: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    setFormData((prev) => ({ ...prev, progress: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim() || !formData.deadline) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create a new milestone
      const newMilestone = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        progress: formData.progress,
      }

      // Submit the milestone
      onSubmit(newMilestone)

      toast({
        title: "Milestone added!",
        description: "Your project milestone has been added successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to add milestone:", error)
      toast({
        title: "Failed to add milestone",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-semibold mb-4">Add Project Milestone</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-white">
            Milestone Title
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g., Beta Launch"
            value={formData.title}
            onChange={handleChange}
            required
            className="bg-slate-700 border-slate-600 text-white mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-white">
            Milestone Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe what this milestone entails..."
            value={formData.description}
            onChange={handleChange}
            required
            className="min-h-[80px] bg-slate-700 border-slate-600 text-white mt-1"
          />
        </div>

        <div>
          <Label htmlFor="deadline" className="text-white">
            Target Deadline
          </Label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            required
            className="bg-slate-700 border-slate-600 text-white mt-1"
          />
        </div>

        <div>
          <Label htmlFor="progress" className="text-white">
            Current Progress ({formData.progress}%)
          </Label>
          <Input
            id="progress"
            name="progress"
            type="range"
            min="0"
            max="100"
            step="5"
            value={formData.progress}
            onChange={handleProgressChange}
            className="mt-1"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="text-white">
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Milestone"}
          </Button>
        </div>
      </form>
    </div>
  )
}
