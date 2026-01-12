import { create } from "zustand";
import { persist } from "zustand/middleware";

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
        // Clear organizer store when a new user logs in
        if (typeof window !== 'undefined') {
          localStorage.removeItem('organizer-storage');
          
          // Only clear PIN data if it's a different user (different email)
          const storedPinKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('radar_pin_') || key.startsWith('radar_org_first_welcome:')
          );
          
          // Clear welcome flags for different users
          storedPinKeys.forEach(key => {
            if (key.startsWith('radar_org_first_welcome:')) {
              const emailInKey = key.split(':')[1];
              if (emailInKey !== userData.email) {
                localStorage.removeItem(key);
              }
            }
          });
          
          // Clear PIN reminder dismissal (let each session decide)
          localStorage.removeItem('radar_pin_reminder_dismissed');
        }
        
        set({
          user: userData,
          token,
          refreshToken: refresh,
          role,
          isAuthenticated: true,
        });
      },
      logout: () =>
        set({
          user: null,
          role: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
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
