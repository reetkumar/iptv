import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IPTVChannel, WatchHistoryItem } from '@/types';

export interface ChannelStoreState {
  channels: IPTVChannel[];
  favorites: Set<string>;
  watchHistory: WatchHistoryItem[];
  healthyChannelIds: Set<string> | null;
  isLoadingChannels: boolean;
  channelError: string | null;

  // Actions
  setChannels: (channels: IPTVChannel[] | ((currentChannels: IPTVChannel[]) => IPTVChannel[])) => void;
  setHealthyChannelIds: (ids: Set<string> | null) => void;
  toggleFavorite: (channelId: string) => void;
  addToWatchHistory: (item: WatchHistoryItem) => void;
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

      setChannels: (channels) =>
        set((state) => ({
          channels: typeof channels === 'function' ? channels(state.channels) : channels,
        })),

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

      addToWatchHistory: (item) =>
        set((state) => {
          const newHistory = [
            item,
            ...state.watchHistory.filter((entry) => entry.channelId !== item.channelId),
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
      merge: (persistedState: unknown, currentState) => {
        const persisted = persistedState as {
          favorites?: string[];
          watchHistory?: WatchHistoryItem[];
        } | undefined;
        return {
          ...currentState,
          favorites: new Set(persisted?.favorites || []),
          watchHistory: persisted?.watchHistory || [],
        };
      },
    }
  )
);
