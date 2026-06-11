import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

export const predictAPI = {
  run: (data) => api.post("/predict/", data),
  history: () => api.get("/predict/history"),
};

export const metricsAPI = {
  log: (data) => api.post("/health-metrics/", data),
  list: (params = {}) => api.get("/health-metrics/", { params }),
};

export const dashboardAPI = {
  get: () => api.get("/dashboard/"),
};

export const recommendationsAPI = {
  list: () => api.get("/recommendations/"),
};

export default api;