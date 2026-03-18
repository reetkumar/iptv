import React, { useState, memo } from 'react';
import { Heart, Play, TrendingUp, Star } from 'lucide-react';
import { IPTVChannel } from '../types';

interface MobileChannelCardProps {
  channel: IPTVChannel;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  index: number;
  badge?: 'trending' | 'favorite' | 'new';
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

const MobileChannelCard: React.FC<MobileChannelCardProps> = memo(({
  channel,
  isFavorite,
  onSelect,
  onToggleFavorite,
  index,
  badge,
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

  const getBadgeIcon = () => {
    switch (badge) {
      case 'trending':
        return <TrendingUp className="w-3 h-3" />;
      case 'favorite':
        return <Star className="w-3 h-3 fill-current" />;
      case 'new':
        return <span className="text-[10px] font-bold">NEW</span>;
      default:
        return null;
    }
  };

  const getBadgeLabel = () => {
    switch (badge) {
      case 'trending':
        return 'Trending';
      case 'favorite':
        return 'Favorite';
      case 'new':
        return 'New';
      default:
        return '';
    }
  };

  return (
    <div
      onClick={onSelect}
      className="group relative cursor-pointer transition-all duration-150 active:scale-[0.97]"
      style={{ animationDelay: `${Math.min(index * 15, 150)}ms` }}
    >
      {/* Card Container with rounded corners */}
      <div className="relative rounded-3xl overflow-hidden bg-card border border-border/20 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300">
        
        {/* Thumbnail / Logo area - Rounded top corners */}
        <div className="relative aspect-video bg-muted/20 flex items-center justify-center overflow-hidden rounded-t-3xl">
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
              className="absolute inset-0 flex items-center justify-center rounded-t-3xl"
              style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 25%), hsl(${(hue + 40) % 360} 50% 20%))` }}
            >
              <span className="text-2xl font-black text-foreground/60 select-none">{getInitials(channel.name)}</span>
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
            </div>
          </div>

          {/* LIVE badge - top left */}
          <div className="absolute top-3 left-3 z-20">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-destructive/90 text-destructive-foreground backdrop-blur-sm shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
              Live
            </span>
          </div>

          {/* Badge (Trending/Favorite/New) - top right */}
          {badge && (
            <div className="absolute top-3 right-3 z-20">
              <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase backdrop-blur-sm shadow-sm ${
                badge === 'trending' 
                  ? 'bg-orange-500/90 text-white'
                  : badge === 'favorite'
                  ? 'bg-rose-500/90 text-white'
                  : 'bg-blue-500/90 text-white'
              }`}>
                {getBadgeIcon()}
                {getBadgeLabel()}
              </div>
            </div>
          )}

          {/* Favorite button - bottom right */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute bottom-3 right-3 p-2.5 rounded-full bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/60 active:scale-90 z-20 ${isFavorite ? 'animate-heartbeat' : ''}`}
          >
            <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'text-red-400 fill-red-400' : 'text-white/90'}`} />
          </button>
        </div>

        {/* Info section */}
        <div className="p-3.5">
          <h3 className="text-sm font-bold text-foreground truncate leading-tight mb-2">{channel.name}</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {channel.group && (
              <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg truncate">{channel.group}</span>
            )}
            {channel.language && (
              <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">{channel.language}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}, (prev, next) => (
  prev.channel.id === next.channel.id &&
  prev.isFavorite === next.isFavorite &&
  prev.badge === next.badge &&
  prev.index === next.index
));

MobileChannelCard.displayName = 'MobileChannelCard';

export default MobileChannelCard;
