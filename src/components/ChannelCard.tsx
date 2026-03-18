import React, { useState, memo } from 'react';
import { Heart, Play, Tv, Zap } from 'lucide-react';
import { IPTVChannel } from '../types';
import { motion } from './motion';

interface ChannelCardProps {
  channel: IPTVChannel;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  index: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  news: '#ef4444',
  music: '#f97316',
  movies: '#eab308',
  entertainment: '#22c55e',
  religious: '#8b5cf6',
  sports: '#3b82f6',
  general: '#64748b',
};

function getInitials(name: string): string {
  return name.split(/[\s\-_]+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

function getGradientHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

function getCategoryColor(group: string): string {
  const g = (group || '').toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (g.includes(key)) return color;
  }
  return CATEGORY_COLORS.general;
}

function getLogoSearchUrl(name: string): string {
  const cleanName = name.replace(/\s*(HD|SD|FHD|UHD|4K|\+|Plus)\s*/gi, '').trim();
  const encodedName = encodeURIComponent(cleanName);
  return `https://www.google.com/s2/favicons?domain=${encodedName}&sz=128`;
}

function getAlternativeLogoUrl(name: string): string {
  const cleanName = name.replace(/\s*(HD|SD|FHD|UHD|4K|\+|Plus)\s*/gi, '').trim()
    .toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://logo.clearbit.com/${cleanName}.com`;
}

const ChannelCard: React.FC<ChannelCardProps> = memo(({
  channel,
  isFavorite,
  onSelect,
  onToggleFavorite,
  index,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [fallbackLevel, setFallbackLevel] = useState(0);
  const showOriginal = channel.logo && !imgFailed;
  const showFallback = !showOriginal;
  const hue = getGradientHue(channel.name);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  const categoryColor = getCategoryColor(channel.group || '');

  return (
    <motion.div
      onClick={onSelect}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br from-card to-card/80 border-2 transition-all duration-300 hover:scale-[1.02]`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.01, 0.1), ease: [0.25, 0.1, 0.25, 1] }}
      whileTap={{ scale: 0.97 }}
      layout
      style={{ 
        borderColor: `${categoryColor}40`,
        boxShadow: `0 4px 20px -5px ${categoryColor}20`
      }}
    >
      {/* Decorative gradient overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${categoryColor}30 0%, transparent 60%)` }}
      />

      {/* Thumbnail / Logo area */}
      <div className="relative aspect-video bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '20px 20px' }} />

        {showOriginal && (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        )}
        {showFallback && fallbackLevel < 2 && (
          <img
            src={fallbackLevel === 0 ? getLogoSearchUrl(channel.name) : getAlternativeLogoUrl(channel.name)}
            alt={channel.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setFallbackLevel(prev => prev + 1)}
          />
        )}
        {showFallback && fallbackLevel >= 2 && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: `linear-gradient(135deg, hsl(${hue} 50% 15%) 0%, hsl(${hue + 30} 40% 10%) 100%)` }}
          >
            <Tv className="w-12 h-12 text-foreground/20 mb-2" />
            <span className="text-2xl font-black text-foreground/40 select-none tracking-wider">{getInitials(channel.name)}</span>
          </div>
        )}

        {/* Play overlay with glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <motion.div 
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/50 ring-4 ring-primary/30"
            initial={{ scale: 0.5, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
          </motion.div>
        </div>

        {/* Live badge with pulse */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-red-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            LIVE
          </div>
        </div>

        {/* HD Badge */}
        {(channel.name.toLowerCase().includes('hd') || channel.name.toLowerCase().includes('fhd')) && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg">
              {channel.name.toLowerCase().includes('fhd') ? 'FHD' : 'HD'}
            </span>
          </div>
        )}

        {/* Favorite heart button */}
        <motion.button
          onClick={handleFavoriteClick}
          className={`absolute bottom-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${isFavorite ? 'bg-red-500/90 shadow-lg shadow-red-500/40' : 'bg-black/40 hover:bg-black/60'}`}
          whileTap={{ scale: 0.8 }}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-white fill-white' : 'text-white/80'}`} />
        </motion.button>

        {/* Category indicator */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300"
          style={{ background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}80)` }}
        />
      </div>

      {/* Info section */}
      <div className="p-3 relative">
        {/* Channel name */}
        <h3 className="text-sm font-bold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
          {channel.name}
        </h3>
        
        {/* Category & Language tags */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {channel.group && (
            <span 
              className="text-[10px] font-medium px-2 py-0.5 rounded-full truncate max-w-[80px]"
              style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
            >
              {channel.group}
            </span>
          )}
          {channel.language && (
            <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {channel.language}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}, (prev, next) => (
  prev.channel.id === next.channel.id &&
  prev.isFavorite === next.isFavorite &&
  prev.index === next.index
));

ChannelCard.displayName = 'ChannelCard';

export default ChannelCard;
