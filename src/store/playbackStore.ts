import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IPTVChannel } from '@/types';

export interface PlaybackState {
  currentChannel: IPTVChannel | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  quality: 'auto' | '1080p' | '720p' | '480p';
  isMuted: boolean;
  autoPlay: boolean;

  // Actions
  setCurrentChannel: (channel: IPTVChannel | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setQuality: (quality: PlaybackState['quality']) => void;
  toggleMute: () => void;
  setAutoPlay: (autoPlay: boolean) => void;
  reset: () => void;
}

export const usePlaybackStore = create<PlaybackState>()(
  persist(
    (set) => ({
      currentChannel: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      quality: 'auto',
      isMuted: false,
      autoPlay: true,

      setCurrentChannel: (currentChannel) => set({ currentChannel, currentTime: 0 }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      setQuality: (quality) => set({ quality }),
      toggleMute: () =>
        set((state) => ({
          isMuted: !state.isMuted,
          volume: state.isMuted ? 1 : 0,
        })),
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      reset: () =>
        set({
          currentChannel: null,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
        }),
    }),
    {
      name: 'playback-store',
      partialize: (state) => ({
        volume: state.volume,
        quality: state.quality,
        autoPlay: state.autoPlay,
      }),
    }
  )
);
