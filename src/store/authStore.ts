import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
}

const LEGACY_GUEST_ID = 'local-guest';

const normalizePersistedUser = (user: User | null | undefined): User | null => {
  if (!user || user.id === LEGACY_GUEST_ID) {
    return null;
  }

  return user;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set((state) => ({ session, isAuthenticated: !!state.user && !!session })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, session: null, isAuthenticated: false, error: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
      merge: (persistedState: unknown, currentState) => {
        const persisted = persistedState as { user?: User | null; session?: string | null } | undefined;
        const user = normalizePersistedUser(persisted?.user);
        const session = persisted?.session ?? null;

        return {
          ...currentState,
          user,
          session,
          isAuthenticated: !!user && !!session,
        };
      },
    }
  )
);
