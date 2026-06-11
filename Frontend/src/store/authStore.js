import { create } from "zustand";
import { authAPI } from "../api/client";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("access_token"),
  isAuthenticated: !!localStorage.getItem("access_token"),

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("access_token", data.access_token);
    set({ token: data.access_token, isAuthenticated: true });
    return data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  register: async (payload) => {
    const { data } = await authAPI.register(payload);
    return data;
  },
}));