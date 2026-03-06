import React, { useState, useEffect, useCallback } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { IPTVChannel } from '../types';

interface HeroBannerProps {
  channels: IPTVChannel[];
  onSelect: (channel: IPTVChannel) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ channels, onSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = channels.slice(0, 5);

  const next = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % featured.length);
  }, [featured.length]);

  const prev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + featured.length) % featured.length);
  }, [featured.length]);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, featured.length]);

  if (featured.length === 0) return null;
  const current = featured[activeIndex];

  return (
    <div className="relative w-full h-44 sm:h-52 lg:h-60 mb-6 rounded-2xl overflow-hidden group bg-card/40 border border-border/20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-card/60 to-secondary/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

      {/* Logo watermark */}
      {current.logo && (
        <div className="absolute top-4 right-6 w-16 h-16 sm:w-20 sm:h-20 opacity-20">
          <img src={current.logo} alt="" className="w-full h-full object-contain" loading="lazy" />
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex items-end p-5 sm:p-7">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-destructive/80 text-destructive-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
              Live
            </span>
            {current.group && (
              <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">{current.group}</span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground truncate mb-0.5">
            {current.name}
          </h2>
          {current.language && (
            <p className="text-xs text-muted-foreground">{current.language}</p>
          )}
        </div>

        <button
          onClick={() => onSelect(current)}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-md"
        >
          <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
        </button>
      </div>

      {/* Nav arrows */}
      {featured.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-background/50 backdrop-blur-sm border border-border/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/70">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-background/50 backdrop-blur-sm border border-border/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/70">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </>
      )}

      {/* Progress dots */}
      {featured.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
