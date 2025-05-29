
import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { useToast } from "./ui/use-toast"

interface ProjectUpdateFormProps {
  projectId: string
  onSubmit: (update: { title: string; content: string; date: string }) => void
  onCancel: () => void
}

export function ProjectUpdateForm({ projectId, onSubmit, onCancel }: ProjectUpdateFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create a new update
      const newUpdate = {
        title: formData.title,
        content: formData.content,
        date: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
      }

      // Submit the update
      onSubmit(newUpdate)

      toast({
        title: "Update posted!",
        description: "Your project update has been posted successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to post update:", error)
      toast({
        title: "Failed to post update",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-semibold mb-4">Post Project Update</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-white">
            Update Title
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g., Prototype Completed"
            value={formData.title}
            onChange={handleChange}
            required
            className="bg-slate-700 border-slate-600 text-white mt-1"
          />
        </div>

        <div>
          <Label htmlFor="content" className="text-white">
            Update Content
          </Label>
          <Textarea
            id="content"
            name="content"
            placeholder="Share details about your progress, achievements, or challenges..."
            value={formData.content}
            onChange={handleChange}
            required
            className="min-h-[120px] bg-slate-700 border-slate-600 text-white mt-1"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="text-white">
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post Update"}
          </Button>
        </div>
      </form>
    </div>
  )
}
