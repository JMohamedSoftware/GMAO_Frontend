import { configureStore } from '@reduxjs/toolkit';
import gmaoReducer from './gmaoSlice';

export const store = configureStore({
  reducer: {
    gmao: gmaoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
