import React, { useState, memo } from 'react';
import { Heart, Play } from 'lucide-react';
import { IPTVChannel } from '../types';

interface ChannelCardProps {
  channel: IPTVChannel;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  index: number;
}

const GRADIENT_COLORS = [
  'from-primary/40 to-secondary/40',
  'from-secondary/40 to-accent/40',
  'from-accent/40 to-primary/40',
  'from-primary/30 to-accent/30',
  'from-secondary/30 to-primary/30',
];

function getInitials(name: string): string {
  return name
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');
}

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
}

function getLogoSearchUrl(name: string): string {
  const cleanName = name.replace(/\s*(HD|SD|FHD|UHD|4K|\+)\s*/gi, '').trim();
  const domain = cleanName.toLowerCase().replace(/\s+/g, '') + '.com';
  return `https://img.logo.dev/${domain}?token=pk_anonymous&size=120&format=png`;
}

const ChannelCard: React.FC<ChannelCardProps> = memo(({
  channel,
  isFavorite,
  onSelect,
  onToggleFavorite,
  index,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [lookupFailed, setLookupFailed] = useState(false);
  const showOriginal = channel.logo && !imgFailed;
  const showLookup = !showOriginal && !lookupFailed;
  const showFallback = !showOriginal && lookupFailed;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <div
      onClick={onSelect}
      className="channel-card p-3 cursor-pointer"
    >
      {/* Logo Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-2.5 group flex items-center justify-center">
        {showOriginal && (
          <img
            src={channel.logo}
            alt={channel.name}
            className="channel-logo w-full h-full object-contain p-3 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        )}
        {showLookup && (
          <img
            src={getLogoSearchUrl(channel.name)}
            alt={channel.name}
            className="channel-logo w-full h-full object-contain p-3 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            onError={() => setLookupFailed(true)}
          />
        )}
        {showFallback && (
          <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${getGradient(channel.name)}`}>
            <span className="text-xl font-black text-foreground/80 select-none">
              {getInitials(channel.name)}
            </span>
          </div>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-premium flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Live Badge */}
        <div className="absolute top-2 left-2">
          <span className="badge-live text-[10px] px-2 py-0.5">
            <span className="w-1 h-1 rounded-full bg-destructive animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-border/20 transition-all duration-300 hover:bg-black/60 hover:scale-110 active:scale-95"
        >
          <Heart
            className={`w-3 h-3 transition-colors ${
              isFavorite ? 'text-accent fill-accent' : 'text-primary-foreground'
            }`}
          />
        </button>
      </div>

      {/* Channel Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-sm text-foreground truncate">
          {channel.name}
        </h3>
        <div className="flex items-center gap-1 flex-wrap">
          {channel.group && (
            <span className="badge-category text-[10px] px-2 py-0.5">{channel.group}</span>
          )}
          {channel.language && (
            <span className="badge-category text-[10px] px-2 py-0.5">{channel.language}</span>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.channel.id === nextProps.channel.id &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.index === nextProps.index
  );
});

ChannelCard.displayName = 'ChannelCard';

export default ChannelCard;
