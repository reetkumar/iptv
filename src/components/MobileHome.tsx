import React, { useState, useMemo, memo } from 'react';
import { ChevronRight, TrendingUp, Heart, Compass } from 'lucide-react';
import { IPTVChannel } from '../types';
import MobileChannelCard from './MobileChannelCard';

interface MobileHomeProps {
  channels: IPTVChannel[];
  favorites: Set<string>;
  onSelect: (channel: IPTVChannel) => void;
  onToggleFavorite: (id: string) => void;
}

const MobileHome: React.FC<MobileHomeProps> = memo(({
  channels,
  favorites,
  onSelect,
  onToggleFavorite,
}) => {
  const [expandedSection, setExpandedSection] = useState<'trending' | 'favorites' | 'browse' | null>(null);

  // Get trending channels (most popular groups)
  const trendingChannels = useMemo(() => {
    const groupMap = new Map<string, IPTVChannel[]>();
    channels.forEach(ch => {
      const group = ch.group || 'General';
      if (!groupMap.has(group)) groupMap.set(group, []);
      groupMap.get(group)!.push(ch);
    });
    
    const topGroups = Array.from(groupMap.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3);
    
    return topGroups.flatMap(([_, chans]) => chans).slice(0, 6);
  }, [channels]);

  // Get favorite channels
  const favoriteChannels = useMemo(() => {
    return channels.filter(c => favorites.has(c.id)).slice(0, 6);
  }, [channels, favorites]);

  // Get browse channels (all channels for browsing)
  const browseChannels = useMemo(() => {
    return channels.slice(0, 12);
  }, [channels]);

  return (
    <div className="px-4 py-6 space-y-6">
      
      {/* Trending Section */}
      <section className="space-y-3">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setExpandedSection(expandedSection === 'trending' ? null : 'trending')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">🔥 Trending Now</h2>
              <p className="text-xs text-muted-foreground">{trendingChannels.length} channels</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${expandedSection === 'trending' ? 'rotate-90' : ''}`} />
        </div>

        {/* Cards Grid - 2x3 on mobile (2 cols, 3 rows = 6) */}
        <div className={`grid gap-3 transition-all duration-300 overflow-hidden ${expandedSection === 'trending' ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {(expandedSection === 'trending' ? trendingChannels.slice(0, 6) : trendingChannels.slice(0, 4)).map((channel, index) => (
            <MobileChannelCard
              key={channel.id}
              channel={channel}
              isFavorite={favorites.has(channel.id)}
              onSelect={() => onSelect(channel)}
              onToggleFavorite={() => onToggleFavorite(channel.id)}
              index={index}
              badge="trending"
            />
          ))}
        </div>
      </section>

      {/* Favorites Section */}
      <section className="space-y-3">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setExpandedSection(expandedSection === 'favorites' ? null : 'favorites')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">❤️ Your Favorites</h2>
              <p className="text-xs text-muted-foreground">{favoriteChannels.length} channels</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${expandedSection === 'favorites' ? 'rotate-90' : ''}`} />
        </div>

        {favoriteChannels.length === 0 ? (
          <div className="p-6 rounded-2xl bg-muted/30 border border-border/20 text-center">
            <p className="text-sm text-muted-foreground">No favorites yet. Add some channels!</p>
          </div>
        ) : (
          <div className={`grid gap-3 transition-all duration-300 overflow-hidden ${expandedSection === 'favorites' ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {(expandedSection === 'favorites' ? favoriteChannels.slice(0, 6) : favoriteChannels.slice(0, 4)).map((channel, index) => (
              <MobileChannelCard
                key={channel.id}
                channel={channel}
                isFavorite={favorites.has(channel.id)}
                onSelect={() => onSelect(channel)}
                onToggleFavorite={() => onToggleFavorite(channel.id)}
                index={index}
                badge="favorite"
              />
            ))}
          </div>
        )}
      </section>

      {/* Browse Section */}
      <section className="space-y-3">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setExpandedSection(expandedSection === 'browse' ? null : 'browse')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <Compass className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">🌐 Browse All</h2>
              <p className="text-xs text-muted-foreground">{channels.length} total channels</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${expandedSection === 'browse' ? 'rotate-90' : ''}`} />
        </div>

        {/* Cards Grid - 2x3 on mobile */}
        <div className={`grid gap-3 transition-all duration-300 overflow-hidden ${expandedSection === 'browse' ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {(expandedSection === 'browse' ? browseChannels.slice(0, 6) : browseChannels.slice(0, 4)).map((channel, index) => (
            <MobileChannelCard
              key={channel.id}
              channel={channel}
              isFavorite={favorites.has(channel.id)}
              onSelect={() => onSelect(channel)}
              onToggleFavorite={() => onToggleFavorite(channel.id)}
              index={index}
            />
          ))}
        </div>

        {expandedSection === 'browse' && (
          <button className="w-full mt-4 py-3 px-4 rounded-2xl bg-primary text-primary-foreground font-semibold transition-all hover:bg-primary/90 active:scale-95">
            View All {channels.length} Channels
          </button>
        )}
      </section>

      {/* Spacer */}
      <div className="h-20" />
    </div>
  );
});

MobileHome.displayName = 'MobileHome';

export default MobileHome;
