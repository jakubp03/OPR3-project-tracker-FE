import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/Api';
import {
  CreateProjectRequest,
  CreateTaskRequest,
  Project,
  Task,
  UpdateProjectRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest
} from '../../types/project';
import { clearAuth } from './authSlice';

/**
 * Project slice state interface
 */
interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Initial state for project slice
 */
const initialState: ProjectState = {
  projects: [],
  isLoading: false,
  error: null,
};

// ==================== PROJECT ASYNC THUNKS ====================

/**
 * Fetch all projects for the authenticated user
 */
export const fetchAllProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Project[]>('/projects');
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching projects:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch a single project by ID
 */
export const fetchProjectById = createAsyncThunk(
  'projects/fetchById',
  async (projectId: number, { rejectWithValue }) => {
    try {
      const response = await api.get<Project>(`/projects/${projectId}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Create a new project
 */
export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData: CreateProjectRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<Project>('/projects', projectData);
      return response.data;
    } catch (error: unknown) {
      console.error('Error creating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update an existing project
 */
export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ projectId, data }: { projectId: number; data: UpdateProjectRequest }, { rejectWithValue }) => {
    try {
      const response = await api.put<Project>(`/projects/${projectId}`, data);
      return response.data;
    } catch (error: unknown) {
      console.error('Error updating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Archive a project
 */
export const archiveProject = createAsyncThunk(
  'projects/archive',
  async (projectId: number, { rejectWithValue }) => {
    try {
      const response = await api.patch<Project>(`/projects/${projectId}/archive`);
      return response.data;
    } catch (error: unknown) {
      console.error('Error archiving project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

// ==================== TASK ASYNC THUNKS ====================

/**
 * Create a new task in a project
 */
export const createTask = createAsyncThunk(
  'projects/createTask',
  async ({ projectId, data }: { projectId: number; data: CreateTaskRequest }, { rejectWithValue }) => {
    try {
      const response = await api.post<Task>(`/projects/${projectId}/tasks`, data);
      return { projectId, task: response.data };
    } catch (error: unknown) {
      console.error('Error creating task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update an existing task
 */
export const updateTask = createAsyncThunk(
  'projects/updateTask',
  async ({ projectId, taskId, data }: { projectId: number; taskId: number; data: UpdateTaskRequest }, { rejectWithValue }) => {
    try {
      const response = await api.put<Task>(`/projects/${projectId}/tasks/${taskId}`, data);
      return { projectId, task: response.data };
    } catch (error: unknown) {
      console.error('Error updating task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update only the status of a task
 */
export const updateTaskStatus = createAsyncThunk(
  'projects/updateTaskStatus',
  async ({ projectId, taskId, status }: { projectId: number; taskId: number; status: UpdateTaskStatusRequest }, { rejectWithValue }) => {
    try {
      const response = await api.patch<Task>(`/projects/${projectId}/tasks/${taskId}/status`, status);
      return { projectId, task: response.data };
    } catch (error: unknown) {
      console.error('Error updating task status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Delete a task from a project
 */
export const deleteTask = createAsyncThunk(
  'projects/deleteTask',
  async ({ projectId, taskId }: { projectId: number; taskId: number }, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      return { projectId, taskId };
    } catch (error: unknown) {
      console.error('Error deleting task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Add a user to a project by email
 */
export const addUserToProject = createAsyncThunk(
  'projects/addUser',
  async ({ projectId, userEmail }: { projectId: number; userEmail: string }, { rejectWithValue }) => {
    try {
      await api.post(`/projects/${projectId}/users`, { userEmail });
      return { projectId };
    } catch (error: unknown) {
      console.error('Error adding user to project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

// ==================== PROJECT SLICE ====================

/**
 * Project slice for managing projects and tasks state
 */
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    /**
     * Clear all project state (used on logout)
     */
    clearProjects: (state) => {
      state.projects = [];
      state.isLoading = false;
      state.error = null;
    },
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== Fetch All Projects ==========
      .addCase(fetchAllProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ========== Fetch Project By ID ==========
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        } else {
          state.projects.push(action.payload);
        }
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ========== Create Project ==========
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ========== Update Project ==========
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ========== Archive Project ==========
      .addCase(archiveProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(archiveProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(archiveProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ========== Create Task ==========
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const project = state.projects.find(p => p.id === action.payload.projectId);
        if (project) {
          project.tasks.push(action.payload.task);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ========== Update Task ==========
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const project = state.projects.find(p => p.id === action.payload.projectId);
        if (project) {
          const taskIndex = project.tasks.findIndex(t => t.id === action.payload.task.id);
          if (taskIndex !== -1) {
            project.tasks[taskIndex] = action.payload.task;
          }
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ========== Update Task Status ==========
      .addCase(updateTaskStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const project = state.projects.find(p => p.id === action.payload.projectId);
        if (project) {
          const taskIndex = project.tasks.findIndex(t => t.id === action.payload.task.id);
          if (taskIndex !== -1) {
            project.tasks[taskIndex] = action.payload.task;
          }
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ========== Delete Task ==========
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const project = state.projects.find(p => p.id === action.payload.projectId);
        if (project) {
          project.tasks = project.tasks.filter(t => t.id !== action.payload.taskId);
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ========== Clear on Logout ==========
      .addCase(clearAuth, (state) => {
        state.projects = [];
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearProjects, clearError } = projectSlice.actions;
export default projectSlice.reducer;
