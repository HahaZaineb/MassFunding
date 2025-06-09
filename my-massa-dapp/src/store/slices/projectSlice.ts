import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getAllProjects, getProject } from '@/services/contract-service'
import { ProjectData } from '@/types'

// Async thunk: Fetch all projects
export const fetchProjects = createAsyncThunk<ProjectData[]>(
  'projects/fetchAll',
  async () => {
    const response = await getAllProjects()
    return response
  }
)

// Async thunk: Fetch a single project by ID
export const fetchProjectById = createAsyncThunk<ProjectData, string>(
  'projects/fetchById',
  async (id: string) => {
    const response = await getProject(Number(id))
    console.log(response, "response ffff")
    return response
  }
)

interface ProjectState {
  list: ProjectData[]
  selected: ProjectData | null
  loading: boolean
  error: string | null
}

const initialState: ProjectState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
}

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearSelectedProject(state) {
      state.selected = null
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProjects.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<ProjectData[]>) => {
        state.list = action.payload
        state.loading = false
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load projects'
      })

      .addCase(fetchProjectById.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<ProjectData>) => {
        state.selected = action.payload
        state.loading = false
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load project'
      })
  },
})

export const { clearSelectedProject } = projectSlice.actions

export default projectSlice.reducer
