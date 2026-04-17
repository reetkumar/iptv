import React, { useState, useMemo, memo } from 'react';
import { TrendingUp, Heart, Compass, Tv } from 'lucide-react';
import { IPTVChannel } from '../types';
import MobileGrid from './MobileGrid';

interface MobileTabsProps {
  channels: IPTVChannel[];
  favorites: Set<string>;
  onSelect: (channel: IPTVChannel) => void;
  onToggleFavorite: (id: string) => void;
}

type TabId = 'trending' | 'favorites' | 'browse';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const tabs: Tab[] = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'browse', label: 'Browse', icon: Compass },
];

const MobileTabs: React.FC<MobileTabsProps> = memo(({
  channels,
  favorites,
  onSelect,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('trending');

  const trendingChannels = useMemo(() => {
    const groupMap = new Map<string, IPTVChannel[]>();
    channels.forEach(ch => {
      const group = ch.group || 'General';
      if (!groupMap.has(group)) groupMap.set(group, []);
      groupMap.get(group)!.push(ch);
    });
    return Array.from(groupMap.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .flatMap(([_, chans]) => chans)
      .slice(0, 12);
  }, [channels]);

  const favoriteChannels = useMemo(() => {
    return channels.filter(c => favorites.has(c.id));
  }, [channels, favorites]);

  const favoriteCount = favorites.size;

  return (
    <div className="h-full flex flex-col">
      {/* Tab Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-primary" />
            <span className="text-lg font-black tracking-tight">REET TV</span>
          </div>
          <span className="text-xs text-muted-foreground">{channels.length} channels</span>
        </div>
        
        {/* Tabs */}
        <div className="flex px-4 pb-3 gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === 'favorites' && favoriteCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                  {favoriteCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Grid Style */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'trending' && (
          <MobileGrid
            channels={trendingChannels}
            favorites={favorites}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
            title="🔥 Trending Now"
            badge="trending"
          />
        )}

        {activeTab === 'favorites' && (
          favoriteChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No favorites yet</h3>
              <p className="text-sm text-muted-foreground">Tap the heart icon on any channel to add it here</p>
            </div>
          ) : (
            <MobileGrid
              channels={favoriteChannels}
              favorites={favorites}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
              title="❤️ Your Favorites"
              badge="favorite"
            />
          )
        )}

        {activeTab === 'browse' && (
          <MobileGrid
            channels={channels}
            favorites={favorites}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
            title="🌐 Browse All"
          />
        )}
      </div>
    </div>
  );
});

MobileTabs.displayName = 'MobileTabs';

export default MobileTabs;