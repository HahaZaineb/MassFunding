import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Project } from '@/types/Project'
import { getAllProjects } from '@/services/contract-service'

// Async thunk to fetch projects
export const fetchProjects = createAsyncThunk<Project[]>(
  'projects/fetchAll',
  async () => {
// const rawProjects: Project[] = await getAllProjects()
//     const sanitized = rawProjects.map(p => p.toPlainObject())
//     return sanitized
return []
  }
)

interface ProjectState {
  list: Project[]
  loading: boolean
  error: string | null
}

const initialState: ProjectState = {
  list: [],
  loading: false,
  error: null,
}

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchProjects.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.list = action.payload
        state.loading = false
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load projects'
      })
  },
})

export default projectSlice.reducer
