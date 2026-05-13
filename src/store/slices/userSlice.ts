// src/store/slices/userSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { parseIsModeratorFromToken } from "../utils/jwt";

// ─── Тип состояния ─────────────────────────────────────────────
export interface UserState {
  login: string;
  isAuthenticated: boolean;
  isModerator: boolean;
  loading: boolean;  
  error: string | null;
}


const initialState: UserState = {
  login: "",
  isAuthenticated: false,
  isModerator: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ login: string; token: string }>) => {
      state.login = action.payload.login;
      state.isAuthenticated = true;
      state.isModerator = parseIsModeratorFromToken(action.payload.token);
      state.error = null;
    },
    
    logoutUser: (state) => {
      state.login = "";
      state.isAuthenticated = false;
      state.isModerator = false;
      state.error = null;
      localStorage.removeItem("token");
    },
    
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setUserError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearUserError: (state) => {
      state.error = null;
    },
  },
});

export const { setUser, logoutUser, setUserLoading, setUserError, clearUserError } = userSlice.actions;
export default userSlice.reducer;