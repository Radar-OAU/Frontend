import { create } from "zustand";
import { persist } from "zustand/middleware";

// Import token refresh timer functions (dynamic import to avoid circular dependency)
let startTokenRefreshTimer, stopTokenRefreshTimer;
if (typeof window !== 'undefined') {
  import("../lib/axios").then((module) => {
    startTokenRefreshTimer = module.startTokenRefreshTimer;
    stopTokenRefreshTimer = module.stopTokenRefreshTimer;
  });
}

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      token: null,
      refreshToken: null,
      hydrated: false,
      isAuthenticated: false,
      login: (userData, token, refresh, role) => {
        // FIRST: Clear organizer store and user-specific data BEFORE setting new user
        if (typeof window !== 'undefined') {
          // Clear the organizer Zustand store
          localStorage.removeItem('organizer-storage');
          
          // IMPORTANT: Clear PIN reminder dismissal so new users see it
          localStorage.removeItem('radar_pin_reminder_dismissed');
        }
        
        // THEN: Set new user data
        set({
          user: userData,
          token,
          refreshToken: refresh,
          role,
          isAuthenticated: true,
        });

        // Start automatic token refresh timer (14min intervals)
        if (startTokenRefreshTimer) {
          startTokenRefreshTimer();
        }
      },
      logout: () => {
        // Stop automatic token refresh
        if (stopTokenRefreshTimer) {
          stopTokenRefreshTimer();
        }

        set({
          user: null,
          role: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      setHydrated: () => set({ hydrated: true }),
      setUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),
    }),
    {
      name: "auth-storage", // name of the item in the storage (e need dey unique)
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
      },
    }
  )
);

export default useAuthStore;
