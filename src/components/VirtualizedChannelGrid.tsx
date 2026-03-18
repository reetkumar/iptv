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
const GAP_MOBILE = 12;
const OVERSCAN = 5;

function getColumnCount(width: number): number {
  // TV and ultra-wide: 6-8 columns
  if (width >= 2560) return 8;
  if (width >= 1920) return 7;
  // Desktop: 6 columns
  if (width >= 1440) return 6;
  // Laptop: 4-5 columns
  if (width >= 1024) return 5;
  // Tablet: 3-4 columns
  if (width >= 768) return 4;
  // Mobile landscape: 3 columns
  if (width >= 640) return 3;
  // Mobile portrait: 2 columns
  if (width >= 480) return 2;
  // Small phones: 2 columns (match home page grid)
  return 2;
}

function getCardHeight(width: number): number {
  if (width >= 1440) return 220;
  if (width >= 768) return 200;
  if (width >= 480) return 180;
  return 160;
}

function getGap(width: number): number {
  if (width >= 768) return GAP;
  return GAP_MOBILE;
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
  const cardHeight = getCardHeight(containerWidth);
  const gap = getGap(containerWidth);
  const rowHeight = cardHeight + gap;
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
            left: `calc(${(col / columnCount) * 100}% + ${col > 0 ? gap / 2 : 0}px)`,
            width: `calc(${100 / columnCount}% - ${gap}px)`,
            height: cardHeight,
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
      style={{ height: Math.min(totalHeight + gap, window.innerHeight - 280) }}
    >
      <div style={{ position: 'relative', height: totalHeight, width: '100%' }}>
        {visibleItems}
      </div>
    </div>
  );
});

VirtualizedChannelGrid.displayName = 'VirtualizedChannelGrid';

export default VirtualizedChannelGrid;
