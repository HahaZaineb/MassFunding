import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getAllProjects,
  getProject,
  getProjectStatus,
} from '@/services/projectService';
import { ProjectData } from '@/types/project';
import { ProjectState } from '../interfaces/project';

// Async thunk: Fetch all projects
export const fetchProjects = createAsyncThunk<ProjectData[]>(
  'projects/fetchAll',
  async () => {
    const response = await getAllProjects();
    return response.reverse();
  },
);

export const filterProjectsByAsyncStatus = createAsyncThunk<
  ProjectData[],
  {
    status: 'live' | 'release' | 'completed' | 'all';
    search?: string;
    category?: string;
  }
>('projects/filterByStatus', async ({ status, search = '', category = 'All' }) => {
  const projects = await getAllProjects();

  // Apply status filter
  let filtered = projects;
  if (status !== 'all') {
    const withStatuses = await Promise.all(
      projects.map(async (project) => ({
        ...project,
        status: await getProjectStatus(project),
      })),
    );
    filtered = withStatuses.filter((project) => project.status === status);
  }

  // Apply search filter
  if (search.trim()) {
    const lowerSearch = search.trim().toLowerCase();
    filtered = filtered.filter(
      (project) =>
        project.name.toLowerCase().includes(lowerSearch) ||
        project.description.toLowerCase().includes(lowerSearch)
    );
  }

  // Apply category filter
  if (category !== 'All') {
    filtered = filtered.filter((project) => project.category === category);
  }

  return filtered.reverse();
});


// Async thunk: Fetch a single project by ID
export const fetchProjectById = createAsyncThunk<ProjectData, string>(
  'projects/fetchById',
  async (id: string) => {
    const response = await getProject(Number(id));
    return response;
  },
);

const initialState: ProjectState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearSelectedProject(state) {
      state.selected = null;
    },
    updateProjectStatus(
      state,
      action: PayloadAction<{
        id: string;
        status: 'live' | 'release' | 'completed';
      }>,
    ) {
      const { id, status } = action.payload;
      const project = state.list.find((p) => p.id === id);
      if (project) {
        project.status = status;
      }

      if (state.selected?.id === id) {
        state.selected.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProjects.fulfilled,
        (state, action: PayloadAction<ProjectData[]>) => {
          state.list = action.payload;
          state.loading = false;
        },
      )
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load projects';
      })

      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProjectById.fulfilled,
        (state, action: PayloadAction<ProjectData>) => {
          state.selected = action.payload;
          state.loading = false;
        },
      )
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load project';
      })
.addCase(filterProjectsByAsyncStatus.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(
  filterProjectsByAsyncStatus.fulfilled,
  (state, action: PayloadAction<ProjectData[]>) => {
    state.list = action.payload;
    state.loading = false;
  },
)
.addCase(filterProjectsByAsyncStatus.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message || 'Failed to filter projects';
});
  },
});

export const { clearSelectedProject, updateProjectStatus } =
  projectSlice.actions;

export default projectSlice.reducer;
