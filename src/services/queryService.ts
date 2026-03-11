import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IPTVChannel } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useChannelStore } from '@/store/channelStore';
import { useAuthStore } from '@/store/authStore';

// Cast supabase to any to work around missing table type definitions
const db = supabase as any;

const QUERY_KEYS = {
  channels: ['channels'] as const,
  favorites: ['favorites'] as const,
  watchHistory: ['watchHistory'] as const,
  profile: ['profile'] as const,
  preferences: ['preferences'] as const,
  notifications: ['notifications'] as const,
};

// Fetch channels from Supabase or fallback to localStorage
export const useFetchChannels = () => {
  const { channels, setChannels, setIsLoadingChannels, setChannelError } = useChannelStore();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.channels,
    queryFn: async () => {
      try {
        setIsLoadingChannels(true);
        
        // Fetch from IPTV org playlist
        const response = await fetch('https://iptv-org.github.io/iptv/countries/in.m3u');
        if (!response.ok) throw new Error('Failed to fetch channels');
        
        const text = await response.text();
        const parsedChannels = parseM3U(text);
        
        setChannels(parsedChannels);
        setChannelError(null);
        return parsedChannels;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch channels';
        setChannelError(message);
        return channels;
      } finally {
        setIsLoadingChannels(false);
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
  });
};

// Fetch user favorites
export const useFetchFavorites = (userId?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.favorites, userId],
    queryFn: async () => {
      if (!userId) return [];
      
       const { data, error } = await db
        .from('favorites')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch watch history
export const useFetchWatchHistory = (userId?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.watchHistory, userId],
    queryFn: async () => {
      if (!userId) return [];
      
       const { data, error } = await db
        .from('watch_history')
        .select('*')
        .eq('user_id', userId)
        .order('watched_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

// Fetch user profile
export const useFetchUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.profile, userId],
    queryFn: async () => {
      if (!userId) return null;
      
       const { data, error } = await db
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });
};

// Fetch user preferences
export const useFetchUserPreferences = (userId?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.preferences, userId],
    queryFn: async () => {
      if (!userId) return null;
      
       const { data, error } = await db
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30,
  });
};

// Fetch notifications
export const useFetchNotifications = (userId?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.notifications, userId],
    queryFn: async () => {
      if (!userId) return [];
      
       const { data, error } = await db
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 0, // Always refetch notifications
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
};

// Add to favorites mutation
export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (channel: IPTVChannel) => {
      if (!user) throw new Error('Not authenticated');
      
       const { error } = await db
        .from('favorites')
        .insert({
          user_id: user.id,
          channel_id: channel.id,
          channel_name: channel.name,
          channel_logo_url: channel.logo,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites });
    },
  });
};

// Remove from favorites mutation
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (channelId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('channel_id', channelId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites });
    },
  });
};

// Add watch history mutation
export const useAddWatchHistory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: { channelId: string; channelName: string; duration: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('watch_history')
        .insert({
          user_id: user.id,
          channel_id: data.channelId,
          channel_name: data.channelName,
          duration_seconds: data.duration,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.watchHistory });
    },
  });
};

// Update user preferences mutation
export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (preferences: Record<string, any>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_preferences')
        .update(preferences)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.preferences });
    },
  });
};

// Helper function to parse M3U format
function parseM3U(m3uContent: string): IPTVChannel[] {
  const lines = m3uContent.split('\n').filter(line => line.trim());
  const channels: IPTVChannel[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      const infoLine = line;
      const urlLine = lines[i + 1]?.trim();
      
      if (urlLine) {
        const nameMatch = infoLine.match(/,(.*)$/);
        const logoMatch = infoLine.match(/tvg-logo="([^"]*)/);
        const groupMatch = infoLine.match(/group-title="([^"]*)/);
        
        channels.push({
          id: `channel-${channels.length}`,
          name: nameMatch?.[1]?.trim() || 'Unknown',
          url: urlLine,
          logo: logoMatch?.[1],
          group: groupMatch?.[1],
          language: 'en',
          country: 'in',
        });
        
        i++; // Skip the URL line in next iteration
      }
    }
  }
  
  return channels;
}
