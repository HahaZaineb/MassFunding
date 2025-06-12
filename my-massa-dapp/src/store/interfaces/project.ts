import { ProjectData } from "@/types/project"

export interface ProjectState {
  list: ProjectData[]
  selected: ProjectData | null
  loading: boolean
  error: string | null
}

export interface FetchProjectsParams {
  searchQuery?: string
  selectedCategory?: string
  status?: 'live' | 'release' | 'completed' | 'all'
}