import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IPTVChannel } from '@/types';

export interface ChannelStoreState {
  channels: IPTVChannel[];
  favorites: Set<string>;
  watchHistory: Array<{ channelId: string; timestamp: number; duration: number }>;
  healthyChannelIds: Set<string> | null;
  isLoadingChannels: boolean;
  channelError: string | null;

  // Actions
  setChannels: (channels: IPTVChannel[]) => void;
  setHealthyChannelIds: (ids: Set<string> | null) => void;
  toggleFavorite: (channelId: string) => void;
  addToWatchHistory: (channelId: string, duration: number) => void;
  clearWatchHistory: () => void;
  setIsLoadingChannels: (isLoading: boolean) => void;
  setChannelError: (error: string | null) => void;
  isFavorite: (channelId: string) => boolean;
}

export const useChannelStore = create<ChannelStoreState>()(
  persist(
    (set, get) => ({
      channels: [],
      favorites: new Set<string>(),
      watchHistory: [],
      healthyChannelIds: null,
      isLoadingChannels: false,
      channelError: null,

      setChannels: (channels) => set({ channels }),

      setHealthyChannelIds: (healthyChannelIds) => set({ healthyChannelIds }),

      toggleFavorite: (channelId) =>
        set((state) => {
          const newFavorites = new Set(state.favorites);
          if (newFavorites.has(channelId)) {
            newFavorites.delete(channelId);
          } else {
            newFavorites.add(channelId);
          }
          return { favorites: newFavorites };
        }),

      addToWatchHistory: (channelId, duration) =>
        set((state) => {
          const newHistory = [
            { channelId, timestamp: Date.now(), duration },
            ...state.watchHistory.filter((item) => item.channelId !== channelId),
          ].slice(0, 100);
          return { watchHistory: newHistory };
        }),

      clearWatchHistory: () => set({ watchHistory: [] }),

      setIsLoadingChannels: (isLoadingChannels) => set({ isLoadingChannels }),

      setChannelError: (channelError) => set({ channelError }),

      isFavorite: (channelId) => get().favorites.has(channelId),
    }),
    {
      name: 'channel-store',
      partialize: (state) => ({
        favorites: Array.from(state.favorites),
        watchHistory: state.watchHistory,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        favorites: new Set(persistedState.favorites || []),
        watchHistory: persistedState.watchHistory || [],
      }),
    }
  )
);
