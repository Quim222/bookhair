"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getToken } from "./api";
import { clearToken, isTokenValid } from "./token";

export type Role = "CLIENTE" | "FUNCIONARIO" | "ADMIN";
export interface User{
    userId: string;
    name: string;
    email: string;
    userRole: Role;
    statusUser: 'PENDENTE' | 'ATIVO';
    photoUrl?: string | null;
    phone?: string | null;
    hasPhoto?: boolean;
}

type AuthState = {
  user: User | null;
  isHydrated: boolean;
  authReady?: boolean; // para indicar que a autenticação está pronta (ex: após tentativa automática)
};

const initialState: AuthState = { user: null, isHydrated: false, authReady: false };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateFromStorage(state) {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem("bh:user");
      const storedUser = raw ? JSON.parse(raw) as User : null;

      const token = getToken();
      const valid = isTokenValid(token);

      if (storedUser && valid) {
        state.user = storedUser;
      } else {
        // Se não houver token válido, limpa também o user persistido
        state.user = null;
        localStorage.removeItem("bh:user");
        clearToken();
      }
      state.isHydrated = true;
      state.authReady = true;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("bh:user", JSON.stringify(action.payload));
      }
    },
    clearUser(state) {
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("bh:user");
      }
      clearToken();
    },
    setAuthReady(state, action: PayloadAction<boolean>) {
      state.authReady = action.payload;
    },
  },
});

export const { hydrateFromStorage, setUser, clearUser, setAuthReady } = authSlice.actions;

export default authSlice.reducer;