import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IPTVChannel } from '../types';
import ChannelCard from './ChannelCard';

interface CategoryRowProps {
  title: string;
  channels: IPTVChannel[];
  favorites: Set<string>;
  onSelect: (channel: IPTVChannel) => void;
  onToggleFavorite: (id: string) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  title,
  channels,
  favorites,
  onSelect,
  onToggleFavorite,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (channels.length === 0) return null;

  return (
    <div className="mb-7 group/row">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <span className="text-[11px] text-muted-foreground">{channels.length}</span>
      </div>
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg bg-background/70 backdrop-blur-sm border border-border/20 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-background/90"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {channels.map((channel, index) => (
            <div key={channel.id} className="flex-shrink-0 w-40 sm:w-44 lg:w-48">
              <ChannelCard
                channel={channel}
                isFavorite={favorites.has(channel.id)}
                onSelect={() => onSelect(channel)}
                onToggleFavorite={() => onToggleFavorite(channel.id)}
                index={index}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg bg-background/70 backdrop-blur-sm border border-border/20 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-background/90"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default CategoryRow;
