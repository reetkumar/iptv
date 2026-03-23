import React, { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
import { Search, RefreshCw, Tv, X, ArrowUp, Mic, MicOff } from 'lucide-react';
import { IPTVChannel } from '../types';
import ChannelCard from './ChannelCard';
import { ChannelGridSkeleton } from './ChannelCardSkeleton';
import HeroBanner from './HeroBanner';
import CategoryRow from './CategoryRow';
import VirtualizedChannelGrid from './VirtualizedChannelGrid';
import { useDebounce } from '../hooks/useDebounce';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface ChannelGalleryProps {
  channels: IPTVChannel[];
  favorites: Set<string>;
  onSelect: (channel: IPTVChannel) => void;
  onToggleFavorite: (id: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  activeView?: 'home' | 'favorites' | 'categories' | 'trending';
  channelCounts?: {
    News: IPTVChannel[];
    Music: IPTVChannel[];
    Movies: IPTVChannel[];
    Entertainment: IPTVChannel[];
    Religious: IPTVChannel[];
    Sports: IPTVChannel[];
    Regional: IPTVChannel[];
  };
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
  channelCounts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 200);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const supportsVoice = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) as boolean;
  const showFavoritesOnly = activeView === 'favorites';

  const toggleVoiceSearch = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    if (!supportsVoice) return;
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setSearchQuery(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, supportsVoice]);

  const groups = useMemo(() => {
    // Use channelCounts if available for proper categorization
    if (channelCounts) {
      const groupList: string[] = [];
      if (channelCounts.News.length > 0) groupList.push('News');
      if (channelCounts.Music.length > 0) groupList.push('Music');
      if (channelCounts.Movies.length > 0) groupList.push('Movies');
      if (channelCounts.Entertainment.length > 0) groupList.push('Entertainment');
      if (channelCounts.Religious.length > 0) groupList.push('Religious');
      if (channelCounts.Sports.length > 0) groupList.push('Sports');
      if (channelCounts.Regional.length > 0) groupList.push('Regional');
      return ['all', ...groupList];
    }
    // Fallback: derive from channels
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
  }, [channels, channelCounts]);

  const categoryRows = useMemo(() => {
    if (debouncedSearch || selectedGroup !== 'all' || showFavoritesOnly) return null;
    
    // Use channelCounts if provided (pre-filtered Hindi/English)
    if (channelCounts) {
      const rows: [string, IPTVChannel[]][] = [
        ['News', channelCounts.News],
        ['Music', channelCounts.Music],
        ['Movies', channelCounts.Movies],
        ['Entertainment', channelCounts.Entertainment],
        ['Religious', channelCounts.Religious],
        ['Sports', channelCounts.Sports],
        ['Regional', channelCounts.Regional],
      ].filter((row): row is [string, IPTVChannel[]] => row[1].length > 0);
      return rows.sort((a, b) => b[1].length - a[1].length);
    }
    
    // Fallback to dynamic grouping
    const map = new Map<string, IPTVChannel[]>();
    channels.forEach(ch => {
      const group = ch.group || 'General';
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(ch);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 8);
  }, [channels, channelCounts, debouncedSearch, selectedGroup, showFavoritesOnly]);

  const filteredChannels = useMemo(() => {
    // Use channelCounts for filtering when available
    if (channelCounts && selectedGroup !== 'all') {
      let result: IPTVChannel[] = [];
      switch (selectedGroup) {
        case 'News': result = channelCounts.News; break;
        case 'Music': result = channelCounts.Music; break;
        case 'Movies': result = channelCounts.Movies; break;
        case 'Entertainment': result = channelCounts.Entertainment; break;
        case 'Religious': result = channelCounts.Religious; break;
        case 'Sports': result = channelCounts.Sports; break;
        case 'Regional': result = channelCounts.Regional; break;
        default: result = channels;
      }
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        result = result.filter(c =>
          c.name.toLowerCase().includes(query) ||
          c.group?.toLowerCase().includes(query)
        );
      }
      return result;
    }
    
    // Default filtering
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
      result = result.filter(c => (c.group || '').toLowerCase() === selectedGroup.toLowerCase());
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
  }, [channels, channelCounts, debouncedSearch, selectedGroup, showFavoritesOnly, sortBy, favorites]);

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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [onRefresh]);

  const handleChannelSelect = useCallback((channel: IPTVChannel) => {
    onSelect(channel);
  }, [onSelect]);

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const showCategoryView = activeView === 'home' && categoryRows && !debouncedSearch && selectedGroup === 'all' && !showFavoritesOnly;
  const showCategoriesGrid = activeView === 'categories';
  const useVirtualized = filteredChannels.length > 100;

  const pageTitle = activeView === 'home' ? 'Home' : activeView === 'favorites' ? 'Favorites' : activeView === 'trending' ? 'Trending' : 'Categories';

  return (
    <div ref={scrollContainerRef} className="h-full w-full overflow-y-auto scrollbar-thin">
      {/* Top bar with search */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/10">
        <div className="flex items-center gap-3 px-4 sm:px-5 h-14">
          {/* Mobile: show logo + title */}
          <div className="flex items-center gap-2 lg:hidden">
            <Tv className="w-4 h-4 text-primary" />
            <span className="text-sm font-black tracking-tight">REET TV</span>
          </div>
          <h2 className="text-lg font-bold text-foreground hidden lg:block min-w-fit">{pageTitle}</h2>
          <div className="flex-1 max-w-lg ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 ${supportsVoice ? 'pr-16' : 'pr-8'} py-2 rounded-full bg-muted/30 border ${isListening ? 'border-primary ring-2 ring-primary/20' : 'border-border/20'} text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-1 rounded-full hover:bg-muted/50 transition-colors">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
                {supportsVoice && (
                  <button
                    onClick={toggleVoiceSearch}
                    className={`p-1.5 rounded-full transition-all ${isListening ? 'bg-primary/20 text-primary animate-pulse' : 'hover:bg-muted/50 text-muted-foreground'}`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
          <button type="button" onClick={handleRefresh} className="p-2 rounded-full hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter chips - show for trending, categories, or when there's a filter/search */}
        {(activeView === 'categories' || activeView === 'trending' || debouncedSearch || selectedGroup !== 'all') && (
          <div className="flex items-center gap-2 px-4 sm:px-5 pb-3 overflow-x-auto scrollbar-hide">
            {groups.map((group) => (
              <button
                type="button"
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedGroup === group
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {group === 'all' ? 'All' : group}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="px-4 sm:px-5 py-4 sm:py-5">
        {isLoading && channels.length === 0 ? (
          <ChannelGridSkeleton count={24} />
        ) : (
          <>
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

            {!showCategoryView && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''}
                  </p>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-1.5 rounded-full bg-muted/30 border border-border/20 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
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
                        className="mt-5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
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
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
          className="fixed bottom-20 lg:bottom-6 right-4 z-50 p-3 rounded-full bg-primary/90 text-primary-foreground shadow-lg hover:bg-primary active:scale-90 transition-all duration-200 animate-fade-in"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

ChannelGallery.displayName = 'ChannelGallery';

export default ChannelGallery;
