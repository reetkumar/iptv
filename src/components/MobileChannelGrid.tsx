import React, { memo } from 'react';
import { IPTVChannel } from '../types';
import MobileChannelCard from './MobileChannelCard';

interface MobileChannelGridProps {
  channels: IPTVChannel[];
  favorites: Set<string>;
  onSelect: (channel: IPTVChannel) => void;
  onToggleFavorite: (id: string) => void;
  title?: string;
  sectionType?: 'trending' | 'favorites' | 'browse';
  showBadges?: boolean;
}

const MobileChannelGrid: React.FC<MobileChannelGridProps> = memo(({
  channels,
  favorites,
  onSelect,
  onToggleFavorite,
  title,
  sectionType = 'browse',
  showBadges = true,
}) => {
  if (channels.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-muted/30 mb-4">
          <span className="text-2xl">📭</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No channels found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {title && (
        <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
      )}
      
      {/* Responsive Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {channels.map((channel, index) => (
          <MobileChannelCard
            key={channel.id}
            channel={channel}
            isFavorite={favorites.has(channel.id)}
            onSelect={() => onSelect(channel)}
            onToggleFavorite={() => onToggleFavorite(channel.id)}
            index={index}
            badge={showBadges ? sectionType : undefined}
          />
        ))}
      </div>
    </div>
  );
});

MobileChannelGrid.displayName = 'MobileChannelGrid';

export default MobileChannelGrid;
