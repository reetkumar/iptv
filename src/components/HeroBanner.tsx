import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { IPTVChannel } from '../types';
import { MotionDiv } from './motion';

const HERO_CHANNELS = [
  'Aaj Tak',
  '9XM', 
  'Zoom',
  'Zee News',
  'Amar Ujala',
  'India TV',
  'DD National',
  'Bhojpuri Movie',
  'B4U Bholpuri',
  '9X Jalwa',
];

interface HeroBannerProps {
  channels: IPTVChannel[];
  onSelect: (channel: IPTVChannel) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ channels, onSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const featured = useMemo(() => {
    const matched: IPTVChannel[] = [];
    for (const name of HERO_CHANNELS) {
      const found = channels.find(ch => 
        ch.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(ch.name.toLowerCase().split(' ')[0])
      );
      if (found && !matched.find(m => m.id === found.id)) {
        matched.push(found);
      }
      if (matched.length >= 10) break;
    }
    return matched.length > 0 ? matched : channels.slice(0, 5);
  }, [channels]);

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
    <MotionDiv direction="up" className="relative w-full h-48 sm:h-56 lg:h-64 mb-6 rounded-3xl overflow-hidden group bg-card border border-border/10" delay={0.05}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card/80 to-secondary/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      {/* Logo watermark */}
      {current.logo && (
        <div className="absolute top-4 right-6 w-16 h-16 sm:w-24 sm:h-24 opacity-15">
          <img src={current.logo} alt="" className="w-full h-full object-contain" loading="lazy" />
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex items-end p-5 sm:p-7">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-destructive/90 text-destructive-foreground shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
              Live
            </span>
            {current.group && (
              <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">{current.group}</span>
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
          className="flex-shrink-0 w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/30"
        >
          <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
        </button>
      </div>

      {/* Nav arrows */}
      {featured.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/70">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/70">
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
                i === activeIndex ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </MotionDiv>
  );
};

export default HeroBanner;
