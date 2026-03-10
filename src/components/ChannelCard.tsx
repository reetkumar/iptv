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
      className="group relative rounded-3xl overflow-hidden cursor-pointer bg-card border border-border/20 hover:border-primary/30 transition-all duration-300 active:scale-[0.97] hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:animate-glow"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      {/* Thumbnail / Logo area */}
      <div className="relative aspect-[4/3] sm:aspect-video bg-muted/20 flex items-center justify-center overflow-hidden rounded-t-3xl">
        {showOriginal && (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-5 transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        )}
        {showLookup && (
          <img
            src={getLogoSearchUrl(channel.name)}
            alt={channel.name}
            className="w-full h-full object-contain p-5 transition-transform duration-500 group-hover:scale-110"
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
            <span className="text-3xl font-black text-foreground/50 select-none">{getInitials(channel.name)}</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 group-hover:animate-pop transition-transform duration-300 shadow-lg">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* LIVE badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-destructive/90 text-destructive-foreground backdrop-blur-sm shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
            Live
          </span>
        </div>

        {/* Favorite */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/50 active:scale-90 ${isFavorite ? 'animate-heartbeat' : ''}`}
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'text-red-400 fill-red-400' : 'text-white/80'}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground truncate leading-snug">{channel.name}</h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          {channel.group && (
            <span className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{channel.group}</span>
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
