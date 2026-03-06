import React, { memo, useCallback, useRef, useEffect, useState } from 'react';
import { IPTVChannel } from '../types';
import ChannelCard from './ChannelCard';

interface VirtualizedChannelGridProps {
  channels: IPTVChannel[];
  favorites: Set<string>;
  onSelect: (channel: IPTVChannel) => void;
  onToggleFavorite: (id: string) => void;
}

const CARD_HEIGHT = 220;
const GAP = 16;
const OVERSCAN = 5;

function getColumnCount(width: number): number {
  if (width >= 1280) return 8;
  if (width >= 1024) return 6;
  if (width >= 640) return 4;
  return 3;
}

const VirtualizedChannelGrid: React.FC<VirtualizedChannelGridProps> = memo(({
  channels,
  favorites,
  onSelect,
  onToggleFavorite,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect) {
        setContainerWidth(rect.width);
        setContainerHeight(rect.height);
      }
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    setContainerHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const columnCount = getColumnCount(containerWidth);
  const rowHeight = CARD_HEIGHT + GAP;
  const rowCount = Math.ceil(channels.length / columnCount);
  const totalHeight = rowCount * rowHeight;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN);
  const endRow = Math.min(rowCount, Math.ceil((scrollTop + containerHeight) / rowHeight) + OVERSCAN);

  const visibleItems: React.ReactNode[] = [];
  for (let row = startRow; row < endRow; row++) {
    for (let col = 0; col < columnCount; col++) {
      const index = row * columnCount + col;
      if (index >= channels.length) break;
      const channel = channels[index];
      visibleItems.push(
        <div
          key={channel.id}
          style={{
            position: 'absolute',
            top: row * rowHeight,
            left: `calc(${(col / columnCount) * 100}% + ${col > 0 ? GAP / 2 : 0}px)`,
            width: `calc(${100 / columnCount}% - ${GAP}px)`,
            height: CARD_HEIGHT,
          }}
        >
          <ChannelCard
            channel={channel}
            isFavorite={favorites.has(channel.id)}
            onSelect={() => onSelect(channel)}
            onToggleFavorite={() => onToggleFavorite(channel.id)}
            index={index}
          />
        </div>
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-y-auto scrollbar-thin"
      style={{ height: Math.min(totalHeight + GAP, window.innerHeight - 280) }}
    >
      <div style={{ position: 'relative', height: totalHeight, width: '100%' }}>
        {visibleItems}
      </div>
    </div>
  );
});

VirtualizedChannelGrid.displayName = 'VirtualizedChannelGrid';

export default VirtualizedChannelGrid;
