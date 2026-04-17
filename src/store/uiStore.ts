import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'gallery' | 'player' | 'mini';
export type SidebarView = 'home' | 'favorites' | 'trending' | 'categories';
export type Theme = 'dark' | 'light';

export interface UIState {
  viewMode: ViewMode;
  sidebarView: SidebarView;
  theme: Theme;
  isSidebarOpen: boolean;
  showSettings: boolean;
  showKeyboardHelp: boolean;
  showSearchAdvanced: boolean;
  searchQuery: string;
  miniPlayerPosition: { x: number; y: number };
  miniPlayerSize: { width: number; height: number };

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setSidebarView: (view: SidebarView) => void;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowKeyboardHelp: (show: boolean) => void;
  setShowSearchAdvanced: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setMiniPlayerPosition: (position: { x: number; y: number }) => void;
  setMiniPlayerSize: (size: { width: number; height: number }) => void;
}

const getDefaultMiniPlayerPosition = () => {
  if (typeof window === 'undefined') {
    return { x: 20, y: 20 };
  }

  return { x: Math.max(20, window.innerWidth - 320), y: Math.max(20, window.innerHeight - 240) };
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      viewMode: 'gallery',
      sidebarView: 'home',
      theme: 'dark',
      isSidebarOpen: true,
      showSettings: false,
      showKeyboardHelp: false,
      showSearchAdvanced: false,
      searchQuery: '',
      miniPlayerPosition: getDefaultMiniPlayerPosition(),
      miniPlayerSize: { width: 300, height: 200 },

      setViewMode: (viewMode) => set({ viewMode }),
      setSidebarView: (sidebarView) => set({ sidebarView }),
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      setShowSettings: (showSettings) => set({ showSettings }),
      setShowKeyboardHelp: (showKeyboardHelp) => set({ showKeyboardHelp }),
      setShowSearchAdvanced: (showSearchAdvanced) => set({ showSearchAdvanced }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setMiniPlayerPosition: (miniPlayerPosition) => set({ miniPlayerPosition }),
      setMiniPlayerSize: (miniPlayerSize) => set({ miniPlayerSize }),
    }),
    {
      name: 'ui-store',
    }
  )
);
