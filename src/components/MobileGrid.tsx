import React, { memo, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { IPTVChannel } from '../types';
import MobileChannelCard from './MobileChannelCard';
import { useDebounce } from '../hooks/useDebounce';

interface MobileGridProps {
  channels: IPTVChannel[];
  favorites: Set<string>;
  onSelect: (channel: IPTVChannel) => void;
  onToggleFavorite: (id: string) => void;
  title?: string;
  badge?: 'trending' | 'favorite' | 'new' | undefined;
}

const MobileGrid: React.FC<MobileGridProps> = memo(({
  channels,
  favorites,
  onSelect,
  onToggleFavorite,
  title,
  badge,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 200);

  const filteredChannels = useMemo(() => {
    if (!debouncedSearch) return channels;
    const query = debouncedSearch.toLowerCase();
    return channels.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.group?.toLowerCase().includes(query) ||
      c.language?.toLowerCase().includes(query)
    );
  }, [channels, debouncedSearch]);

  if (channels.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-muted/30 mb-4">
          <span className="text-2xl">📭</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No channels found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your search</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {title && (
        <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
      )}

      {filteredChannels.length > 12 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-muted/30 border border-border/20 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/50"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {filteredChannels.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No channels match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredChannels.map((channel, index) => (
            <MobileChannelCard
              key={channel.id}
              channel={channel}
              isFavorite={favorites.has(channel.id)}
              onSelect={() => onSelect(channel)}
              onToggleFavorite={() => onToggleFavorite(channel.id)}
              index={index}
              badge={badge}
            />
          ))}
        </div>
      )}
    </div>
  );
});

MobileGrid.displayName = 'MobileGrid';

export default MobileGrid;