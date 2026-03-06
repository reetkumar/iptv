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

function getInitials(name: string): string {
  return name.split(/[\s\-_]+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

function getGradientHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
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
  const hue = getGradientHue(channel.name);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <div
      onClick={onSelect}
      className="group relative rounded-xl overflow-hidden cursor-pointer bg-card/50 border border-border/20 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Thumbnail / Logo area */}
      <div className="relative aspect-video bg-muted/30 flex items-center justify-center overflow-hidden">
        {showOriginal && (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        )}
        {showLookup && (
          <img
            src={getLogoSearchUrl(channel.name)}
            alt={channel.name}
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => setLookupFailed(true)}
          />
        )}
        {showFallback && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 25%), hsl(${(hue + 40) % 360} 50% 20%))` }}
          >
            <span className="text-2xl font-black text-foreground/60 select-none">{getInitials(channel.name)}</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* LIVE badge */}
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-destructive/80 text-destructive-foreground">
            <span className="w-1 h-1 rounded-full bg-destructive-foreground animate-pulse" />
            Live
          </span>
        </div>

        {/* Favorite */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/60"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'text-red-400 fill-red-400' : 'text-white/80'}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="text-sm font-semibold text-foreground truncate leading-snug">{channel.name}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          {channel.group && (
            <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{channel.group}</span>
          )}
          {channel.language && (
            <span className="text-[10px] text-muted-foreground">{channel.language}</span>
          )}
        </div>
      </div>
    </div>
  );
}, (prev, next) => (
  prev.channel.id === next.channel.id &&
  prev.isFavorite === next.isFavorite &&
  prev.index === next.index
));

ChannelCard.displayName = 'ChannelCard';

export default ChannelCard;
