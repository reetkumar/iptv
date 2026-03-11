// Export all store hooks
import { useAuthStore, type User, type AuthState } from './authStore';
import { usePlaybackStore, type PlaybackState } from './playbackStore';
import { useUIStore, type ViewMode, type SidebarView, type Theme, type UIState } from './uiStore';
import { useNotificationStore, type Notification, type NotificationState } from './notificationStore';
import { useChannelStore, type ChannelStoreState } from './channelStore';

export { useAuthStore, usePlaybackStore, useUIStore, useNotificationStore, useChannelStore };
export type { User, AuthState, PlaybackState, ViewMode, SidebarView, Theme, UIState, Notification, NotificationState, ChannelStoreState };

// Helper hook to get all store state
export const useAppState = () => {
  const auth = useAuthStore();
  const playback = usePlaybackStore();
  const ui = useUIStore();
  const notifications = useNotificationStore();
  const channels = useChannelStore();

  return { auth, playback, ui, notifications, channels };
};
