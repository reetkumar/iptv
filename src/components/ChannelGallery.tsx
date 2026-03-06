import React, { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
import { Search, RefreshCw, Tv, X, ArrowUp, Mic, MicOff } from 'lucide-react';
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
  activeView?: 'home' | 'favorites' | 'categories' | 'trending';
}

type SortOption = 'name' | 'group' | 'recent';

const ChannelGallery: React.FC<ChannelGalleryProps> = memo(({
  channels,
  favorites,
  onSelect,
  onToggleFavorite,
  onRefresh,
  isLoading = false,
  activeView = 'home',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 200);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const supportsVoice = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) as boolean;

  // Derive showFavoritesOnly from activeView
  const showFavoritesOnly = activeView === 'favorites';

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

  // Grouped channels for category rows
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

  // Filtered channels
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

  const showCategoryView = activeView === 'home' && categoryRows && !debouncedSearch && selectedGroup === 'all';
  const showCategoriesGrid = activeView === 'categories';
  const useVirtualized = filteredChannels.length > 100;

  // Page title
  const pageTitle = activeView === 'home' ? 'Home' : activeView === 'favorites' ? 'Favorites' : activeView === 'trending' ? 'Trending' : 'Categories';

  return (
    <div ref={scrollContainerRef} className="h-full w-full overflow-y-auto scrollbar-thin">
      {/* Top bar with search */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/20">
        <div className="flex items-center gap-3 px-5 h-14">
          <h2 className="text-lg font-bold text-foreground hidden sm:block min-w-fit">{pageTitle}</h2>
          <div className="flex-1 max-w-lg ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search channels, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 ${supportsVoice ? 'pr-20' : 'pr-10'} py-2 rounded-lg bg-muted/40 border ${isListening ? 'border-primary ring-1 ring-primary/30' : 'border-border/30'} text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-1 rounded-md hover:bg-muted/50 transition-colors">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
                {supportsVoice && (
                  <button
                    onClick={toggleVoiceSearch}
                    className={`p-1.5 rounded-md transition-all ${isListening ? 'bg-primary/20 text-primary animate-pulse' : 'hover:bg-muted/50 text-muted-foreground'}`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
          <button onClick={handleRefresh} className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter chips - show on categories / filtered views */}
        {(activeView === 'categories' || activeView === 'trending' || debouncedSearch) && (
          <div className="flex items-center gap-2 px-5 pb-3 overflow-x-auto scrollbar-hide">
            {groups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedGroup === group
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {group === 'all' ? 'All' : group}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="px-5 py-5">
        {isLoading && channels.length === 0 ? (
          <ChannelGridSkeleton count={24} />
        ) : (
          <>
            {/* Home view: hero + category rows */}
            {showCategoryView && (
              <>
                {channels.length > 0 && (
                  <HeroBanner channels={channels} onSelect={handleChannelSelect} />
                )}
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
            )}

            {/* Grid views (favorites, categories, trending, search results) */}
            {!showCategoryView && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border/30 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="name">Name</option>
                    <option value="group">Group</option>
                  </select>
                </div>

                {filteredChannels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-5">
                      <Tv className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold mb-1.5 text-foreground">No channels found</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      {showFavoritesOnly
                        ? "You haven't added any favorites yet."
                        : "Try adjusting your search or filters."}
                    </p>
                    {(searchQuery || selectedGroup !== 'all') && (
                      <button
                        onClick={() => { setSearchQuery(''); setSelectedGroup('all'); }}
                        className="mt-5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
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
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
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
          className="fixed bottom-6 right-6 z-50 p-3 rounded-xl bg-primary/90 text-primary-foreground shadow-lg hover:bg-primary hover:scale-105 active:scale-95 transition-all duration-200 animate-fade-in"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

ChannelGallery.displayName = 'ChannelGallery';

export default ChannelGallery;
