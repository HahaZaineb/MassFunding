import { configureStore } from '@reduxjs/toolkit'
import projectReducer from './slices/projectSlice'
import accountReducer from './slices/accountSlice';

export const store = configureStore({
  reducer: {
    account: accountReducer,
    projects: projectReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch