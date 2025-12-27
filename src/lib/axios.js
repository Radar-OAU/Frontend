// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://radar-ufvb.onrender.com",
  headers: {
    "Content-Type": "application/json", // Axios will override if FormData is used
  },
});

// --------------------
// Helper functions
// --------------------
function getToken() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch (err) {
    console.error("Failed to read access token", err);
    return null;
  }
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.refreshToken ?? null;
  } catch (err) {
    console.error("Failed to read refresh token", err);
    return null;
  }
}

// --------------------
// Request interceptor
// --------------------
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// --------------------
// Response interceptor (refresh token handling)
// --------------------
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  response => response,
  (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      isRefreshing = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        localStorage.removeItem("auth-storage");
        isRefreshing = false;
        return Promise.reject(error);
      }

      const refreshUrl = `${api.defaults.baseURL?.replace(/\/$/, "")}/token/refresh/`;

      return new Promise((resolve, reject) => {
        axios.post(refreshUrl, { refresh: refreshToken })
          .then(res => {
            const newAccess = res?.data?.access;
            if (!newAccess) throw new Error("No access token in refresh response");

            // Persist new token in local storage
            try {
              const raw = localStorage.getItem("auth-storage");
              if (raw) {
                const parsed = JSON.parse(raw);
                parsed.state.token = newAccess;
                localStorage.setItem("auth-storage", JSON.stringify(parsed));
              }
            } catch {}

            // Update default header for future requests
            api.defaults.headers.Authorization = `Bearer ${newAccess}`;

            // Process queued requests
            processQueue(null, newAccess);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            resolve(api(originalRequest));
          })
          .catch(err => {
            processQueue(err, null);
            localStorage.removeItem("auth-storage");
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
