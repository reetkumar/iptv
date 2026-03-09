// Export all store hooks
export { useAuthStore, type User, type AuthState } from './authStore';
export { usePlaybackStore, type PlaybackState } from './playbackStore';
export { useUIStore, type ViewMode, type SidebarView, type Theme, type UIState } from './uiStore';
export { useNotificationStore, type Notification, type NotificationState } from './notificationStore';
export { useChannelStore, type ChannelStoreState } from './channelStore';

// Helper hook to get all store state
export const useAppState = () => {
  const auth = useAuthStore();
  const playback = usePlaybackStore();
  const ui = useUIStore();
  const notifications = useNotificationStore();
  const channels = useChannelStore();

  return {
    auth,
    playback,
    ui,
    notifications,
    channels,
  };
};
