import React, { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
import { Search, Heart, RefreshCw, Tv, X, ArrowUp, Mic, MicOff } from 'lucide-react';
import { IPTVChannel } from '../types';
import ChannelCard from './ChannelCard';
import { ChannelGridSkeleton } from './ChannelCardSkeleton';
import HeroBanner from './HeroBanner';
import CategoryRow from './CategoryRow';
import VirtualizedChannelGrid from './VirtualizedChannelGrid';
import { useDebounce } from '../hooks/useDebounce';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChannelGalleryProps {
  channels: IPTVChannel[];
  favorites: Set<string>;
  onSelect: (index: number) => void;
  onToggleFavorite: (id: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

type SortOption = 'name' | 'group' | 'recent';

const ChannelGallery: React.FC<ChannelGalleryProps> = memo(({
  channels,
  favorites,
  onSelect,
  onToggleFavorite,
  onRefresh,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 200);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const supportsVoice = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) as boolean;

  const toggleVoiceSearch = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    if (!supportsVoice) return;
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as SpeechRecognitionResultList)
        .map((r: any) => r[0].transcript)
        .join('');
      setSearchQuery(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, supportsVoice]);

  // Groups for filter tabs
  const groups = useMemo(() => {
    const groupCounts = new Map<string, number>();
    channels.forEach(c => {
      const group = c.group || 'General';
      groupCounts.set(group, (groupCounts.get(group) || 0) + 1);
    });
    const sortedGroups = Array.from(groupCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([group]) => group);
    return ['all', ...sortedGroups];
  }, [channels]);

  // Grouped channels for category rows (when no search/filter)
  const categoryRows = useMemo(() => {
    if (debouncedSearch || selectedGroup !== 'all' || showFavoritesOnly) return null;
    const map = new Map<string, IPTVChannel[]>();
    channels.forEach(ch => {
      const group = ch.group || 'General';
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(ch);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 8);
  }, [channels, debouncedSearch, selectedGroup, showFavoritesOnly]);

  // Filtered channels — uses debounced search
  const filteredChannels = useMemo(() => {
    let result = channels;
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.group?.toLowerCase().includes(query) ||
        c.language?.toLowerCase().includes(query)
      );
    }
    if (selectedGroup !== 'all') {
      result = result.filter(c => c.group === selectedGroup);
    }
    if (showFavoritesOnly) {
      result = result.filter(c => favorites.has(c.id));
    }
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'group': return (a.group || '').localeCompare(b.group || '');
        default: return 0;
      }
    });
    return result;
  }, [channels, debouncedSearch, selectedGroup, showFavoritesOnly, sortBy, favorites]);

  // Scroll detection for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      setShowScrollTop(scrollContainerRef.current.scrollTop > 500);
    };
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleChannelSelect = useCallback((channel: IPTVChannel) => {
    const index = channels.findIndex(c => c.id === channel.id);
    if (index !== -1) onSelect(index);
  }, [channels, onSelect]);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showCategoryView = categoryRows && !debouncedSearch && selectedGroup === 'all' && !showFavoritesOnly;
  const useVirtualized = filteredChannels.length > 100;

  return (
    <div ref={scrollContainerRef} className="h-screen w-full bg-background safe-top safe-bottom overflow-y-auto scrollbar-thin">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-premium">
                <Tv className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tight">REET TV</h1>
                <p className="text-xs text-muted-foreground font-medium">Premium Streams</p>
              </div>
            </div>

            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 ${supportsVoice ? 'pr-20' : 'pr-10'} py-2.5 rounded-xl bg-muted/50 border ${isListening ? 'border-accent ring-2 ring-accent/30' : 'border-border/50'} text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-1 rounded-lg hover:bg-muted transition-colors">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  {supportsVoice && (
                    <button
                      onClick={toggleVoiceSearch}
                      className={`p-1.5 rounded-lg transition-all ${isListening ? 'bg-accent/20 text-accent animate-pulse' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleRefresh} className="btn-icon" title="Refresh channels">
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`btn-icon ${showFavoritesOnly ? 'bg-accent/20 border-accent/30' : ''}`}
                title="Toggle favorites"
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'text-accent fill-accent' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 pb-4 overflow-x-auto scrollbar-hide">
            {groups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedGroup === group
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {group === 'all' ? 'All Channels' : group}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading skeleton */}
        {isLoading && channels.length === 0 ? (
          <ChannelGridSkeleton count={24} />
        ) : (
          <>
            {/* Hero Banner */}
            {showCategoryView && channels.length > 0 && (
              <HeroBanner channels={channels} onSelect={handleChannelSelect} />
            )}

            {/* Category rows or grid */}
            {showCategoryView ? (
              <>
                {favorites.size > 0 && (
                  <CategoryRow
                    title="❤️ Your Favorites"
                    channels={channels.filter(c => favorites.has(c.id))}
                    favorites={favorites}
                    onSelect={handleChannelSelect}
                    onToggleFavorite={onToggleFavorite}
                  />
                )}
                {categoryRows?.map(([group, groupChannels]) => (
                  <CategoryRow
                    key={group}
                    title={group}
                    channels={groupChannels}
                    favorites={favorites}
                    onSelect={handleChannelSelect}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </>
            ) : (
              <>
                {/* Results header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {showFavoritesOnly ? 'Favorites' : selectedGroup === 'all' ? 'All Channels' : selectedGroup}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="group">Sort by Group</option>
                  </select>
                </div>

                {filteredChannels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                      <Tv className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No channels found</h3>
                    <p className="text-muted-foreground max-w-sm">
                      {showFavoritesOnly
                        ? "You haven't added any favorites yet."
                        : "Try adjusting your search or filters."}
                    </p>
                    {(searchQuery || selectedGroup !== 'all' || showFavoritesOnly) && (
                      <button
                        onClick={() => { setSearchQuery(''); setSelectedGroup('all'); setShowFavoritesOnly(false); }}
                        className="btn-primary mt-6"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : useVirtualized ? (
                  <VirtualizedChannelGrid
                    channels={filteredChannels}
                    favorites={favorites}
                    onSelect={handleChannelSelect}
                    onToggleFavorite={onToggleFavorite}
                  />
                ) : (
                  <div className="grid gap-4 sm:gap-6 grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-8">
                    {filteredChannels.map((channel, index) => (
                      <ChannelCard
                        key={channel.id}
                        channel={channel}
                        isFavorite={favorites.has(channel.id)}
                        onSelect={() => handleChannelSelect(channel)}
                        onToggleFavorite={() => onToggleFavorite(channel.id)}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-premium shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 animate-fade-in"
        >
          <ArrowUp className="w-5 h-5 text-primary-foreground" />
        </button>
      )}
    </div>
  );
});

ChannelGallery.displayName = 'ChannelGallery';

export default ChannelGallery;
