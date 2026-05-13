import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import heatingReducer from "./slices/heatingSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    heating: heatingReducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
