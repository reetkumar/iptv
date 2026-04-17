import { UserPreferences, WatchHistoryItem, StreamHealth } from '../types';

const KEYS = {
  FAVORITES: 'iptv_favorites_v2',
  WATCH_HISTORY: 'iptv_watch_history_v1',
  PREFERENCES: 'iptv_user_preferences_v1',
  STREAM_HEALTH: 'iptv_stream_health_v1',
  BANDWIDTH: 'iptv_bandwidth_usage_v1',
  CHANNEL_STORE: 'channel-store',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  autoPlay: true,
  keyboardShortcuts: true,
  defaultQuality: 'auto',
  volume: 1,
};

export class StorageService {
  private static getChannelStoreState(): { favorites: string[]; watchHistory: WatchHistoryItem[] } {
    try {
      const raw = localStorage.getItem(KEYS.CHANNEL_STORE);
      if (!raw) {
        return { favorites: [], watchHistory: [] };
      }

      const parsed = JSON.parse(raw) as {
        state?: { favorites?: string[]; watchHistory?: WatchHistoryItem[] };
      };

      return {
        favorites: Array.isArray(parsed.state?.favorites) ? parsed.state!.favorites : [],
        watchHistory: Array.isArray(parsed.state?.watchHistory) ? parsed.state!.watchHistory : [],
      };
    } catch {
      return { favorites: [], watchHistory: [] };
    }
  }

  private static saveChannelStoreState(state: { favorites: string[]; watchHistory: WatchHistoryItem[] }): void {
    try {
      const raw = localStorage.getItem(KEYS.CHANNEL_STORE);
      const parsed = raw ? JSON.parse(raw) as { state?: Record<string, unknown>; version?: number } : {};
      localStorage.setItem(
        KEYS.CHANNEL_STORE,
        JSON.stringify({
          ...parsed,
          state: {
            ...parsed.state,
            favorites: state.favorites,
            watchHistory: state.watchHistory,
          },
        })
      );
    } catch (error) {
      console.error('Failed to save channel store data:', error);
    }
  }

  // Favorites
  static getFavorites(): string[] {
    const storeFavorites = this.getChannelStoreState().favorites;
    if (storeFavorites.length > 0) {
      return storeFavorites;
    }

    try {
      const data = localStorage.getItem(KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveFavorites(favorites: string[]): void {
    this.saveChannelStoreState({
      ...this.getChannelStoreState(),
      favorites,
    });

    try {
      localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  // Watch History
  static getWatchHistory(): WatchHistoryItem[] {
    const storeHistory = this.getChannelStoreState().watchHistory;
    if (storeHistory.length > 0) {
      return storeHistory;
    }

    try {
      const data = localStorage.getItem(KEYS.WATCH_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addToWatchHistory(item: WatchHistoryItem): void {
    const channelStore = this.getChannelStoreState();
    const nextHistory = [item, ...channelStore.watchHistory.filter((entry) => entry.channelId !== item.channelId)].slice(0, 100);
    this.saveChannelStoreState({
      ...channelStore,
      watchHistory: nextHistory,
    });

    try {
      const history = this.getWatchHistory();
      // Remove duplicate if exists
      const filtered = history.filter(h => h.channelId !== item.channelId);
      // Add new item at the beginning
      const updated = [item, ...filtered].slice(0, 50); // Keep last 50
      localStorage.setItem(KEYS.WATCH_HISTORY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to add to watch history:', error);
    }
  }

  static clearWatchHistory(): void {
    this.saveChannelStoreState({
      ...this.getChannelStoreState(),
      watchHistory: [],
    });
    localStorage.removeItem(KEYS.WATCH_HISTORY);
  }

  // User Preferences
  static getUserPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(KEYS.PREFERENCES);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  static saveUserPreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  // Stream Health
  static getStreamHealth(): StreamHealth[] {
    try {
      const data = localStorage.getItem(KEYS.STREAM_HEALTH);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static updateStreamHealth(health: StreamHealth): void {
    try {
      const allHealth = this.getStreamHealth();
      const filtered = allHealth.filter(h => h.channelId !== health.channelId);
      const updated = [health, ...filtered].slice(0, 100);
      localStorage.setItem(KEYS.STREAM_HEALTH, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update stream health:', error);
    }
  }

  // Export all data
  static exportData(): string {
    const data = {
      favorites: this.getFavorites(),
      watchHistory: this.getWatchHistory(),
      preferences: this.getUserPreferences(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  // Import data
  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);

      if (Array.isArray(data.favorites)) {
        this.saveFavorites(data.favorites);
      }

      if (Array.isArray(data.watchHistory)) {
        const sanitizedHistory = data.watchHistory
          .filter((item): item is WatchHistoryItem => {
            return (
              typeof item?.channelId === 'string' &&
              typeof item?.channelName === 'string' &&
              typeof item?.timestamp === 'number' &&
              typeof item?.duration === 'number'
            );
          })
          .slice(0, 50);
        localStorage.setItem(KEYS.WATCH_HISTORY, JSON.stringify(sanitizedHistory));
      }

      if (data.preferences) {
        this.saveUserPreferences({ ...DEFAULT_PREFERENCES, ...data.preferences });
      }

      return true;
    } catch {
      return false;
    }
  }

  // Clear all data
  static clearAllData(): void {
    Object.values(KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}
