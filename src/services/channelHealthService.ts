import { IPTVChannel } from '../types';

const CACHE_KEY = 'iptv_channels_cache_v1';
const HEALTH_KEY = 'iptv_channel_health_v2';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

interface ChannelCache {
  channels: IPTVChannel[];
  timestamp: number;
}

interface HealthRecord {
  [channelId: string]: {
    healthy: boolean;
    checkedAt: number;
  };
}

export class ChannelHealthService {
  // Cache management
  static getCachedChannels(): IPTVChannel[] | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cache: ChannelCache = JSON.parse(raw);
      if (Date.now() - cache.timestamp > CACHE_TTL) return null;
      return cache.channels;
    } catch {
      return null;
    }
  }

  static cacheChannels(channels: IPTVChannel[]): void {
    try {
      const cache: ChannelCache = { channels, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.error('Failed to cache channels:', e);
    }
  }

  // Health tracking
  static getHealthRecords(): HealthRecord {
    try {
      const raw = localStorage.getItem(HEALTH_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  static saveHealthRecords(records: HealthRecord): void {
    try {
      localStorage.setItem(HEALTH_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save health records:', e);
    }
  }

  static filterHealthyChannels(channels: IPTVChannel[]): IPTVChannel[] {
    // Client-side probes are too unreliable to hide channels from the user.
    // Health data is treated as advisory metadata only.
    return channels;
  }

  // Surface only recent health metadata; do not probe third-party streams from the browser.
  static async checkChannelsBatch(
    channels: IPTVChannel[],
    onUpdate: (healthyIds: Set<string>) => void,
    _batchSize = 10
  ): Promise<void> {
    const records = this.getHealthRecords();
    const healthCheckTTL = 2 * 60 * 60 * 1000;
    const healthyIds = new Set<string>();

    channels.forEach((ch) => {
      const record = records[ch.id];
      if (record && Date.now() - record.checkedAt < healthCheckTTL) {
        if (record.healthy) {
          healthyIds.add(ch.id);
        }
      }
    });

    onUpdate(healthyIds);
  }
}
