import React, { memo, useCallback, useMemo, useRef, useEffect, useState } from 'react';
// @ts-ignore - react-window types
import { FixedSizeGrid as Grid } from 'react-window';
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

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(w);
    });
    observer.observe(ref.current);
    setWidth(ref.current.clientWidth);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function getColumnCount(width: number): number {
  if (width >= 1536) return 8;
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
  const containerWidth = useContainerWidth(containerRef);
  const columnCount = getColumnCount(containerWidth);
  const rowCount = Math.ceil(channels.length / columnCount);
  const columnWidth = containerWidth > 0 ? (containerWidth - GAP * (columnCount - 1)) / columnCount : 160;

  const Cell = useCallback(({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= channels.length) return null;
    const channel = channels[index];

    return (
      <div style={{
        ...style,
        left: (style.left as number) + columnIndex * GAP,
        top: (style.top as number) + rowIndex * GAP,
        width: columnWidth,
        height: CARD_HEIGHT,
      }}>
        <ChannelCard
          channel={channel}
          isFavorite={favorites.has(channel.id)}
          onSelect={() => onSelect(channel)}
          onToggleFavorite={() => onToggleFavorite(channel.id)}
          index={index}
        />
      </div>
    );
  }, [channels, favorites, onSelect, onToggleFavorite, columnCount, columnWidth]);

  if (containerWidth === 0) {
    return <div ref={containerRef} className="w-full min-h-[400px]" />;
  }

  return (
    <div ref={containerRef} className="w-full">
      <Grid
        columnCount={columnCount}
        columnWidth={columnWidth + GAP}
        height={Math.min(rowCount * (CARD_HEIGHT + GAP), window.innerHeight - 280)}
        rowCount={rowCount}
        rowHeight={CARD_HEIGHT + GAP}
        width={containerWidth + GAP}
        overscanRowCount={3}
        className="scrollbar-thin"
      >
        {Cell}
      </Grid>
    </div>
  );
});

VirtualizedChannelGrid.displayName = 'VirtualizedChannelGrid';

export default VirtualizedChannelGrid;
