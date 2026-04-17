import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, useRef } from 'react';
import { IPTVChannel, UserPreferences } from '../types';
import { fetchAndParseM3U } from '../services/m3uParser';
import { StorageService } from '../services/storageService';
import { ChannelHealthService } from '../services/channelHealthService';
import { KeyboardService } from '../services/keyboardService';
import { useSEO } from '../hooks/useSEO';
import { useChannelStore } from '../store/channelStore';
import { SidebarView } from '../store/uiStore';
import ChannelGallery from '../components/ChannelGallery';
import BottomNavBar from '../components/BottomNavBar';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { Loader2, AlertCircle, Tv, RefreshCw } from 'lucide-react';

const VideoPlayer = lazy(() => import('../components/VideoPlayer'));
const SettingsPanel = lazy(() => import('../components/SettingsPanel'));
const KeyboardShortcuts = lazy(() => import('../components/KeyboardShortcuts'));
const MiniPlayer = lazy(() => import('../components/MiniPlayer'));

const M3U_URL = 'https://iptv-org.github.io/iptv/countries/in.m3u';

type ViewMode = 'gallery' | 'player' | 'mini';

const VIEW_ORDER: SidebarView[] = ['home', 'trending', 'favorites', 'categories'];

const Index: React.FC = () => {
  const {
    channels,
    favorites,
    healthyChannelIds,
    setChannels,
    setHealthyChannelIds,
    toggleFavorite,
    addToWatchHistory,
  } = useChannelStore();
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [sidebarView, setSidebarView] = useState<SidebarView>('home');
  const [transitionDir, setTransitionDir] = useState<'left' | 'right' | null>(null);
  const [isLandscape, setIsLandscape] = useState(() => window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [preferences, setPreferences] = useState<UserPreferences>(StorageService.getUserPreferences());
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [keyboardService] = useState(() => new KeyboardService());
  const [miniPlayerPosition, setMiniPlayerPosition] = useState({ x: 20, y: 20 });
  const [refreshKey, setRefreshKey] = useState(0);
  const healthCheckRunning = useRef(false);
  const healthCheckAbortRef = useRef<AbortController | null>(null);
  const playbackSessionRef = useRef<{ channel: IPTVChannel | null; startedAt: number | null }>({
    channel: null,
    startedAt: null,
  });

  // Filter to only Hindi and English channels
  const filteredChannels = useMemo(() => {
    const hindiEnglish = channels.filter(ch => {
      const lang = (ch.language || '').toLowerCase();
      return lang === 'hindi' || lang === 'english' || lang === 'hin' || lang === 'eng' || lang === 'hi' || lang === 'en';
    });
    return hindiEnglish.length > 0 ? hindiEnglish : channels;
  }, [channels]);

  const currentIndex = useMemo(
    () => (currentChannelId ? filteredChannels.findIndex((channel) => channel.id === currentChannelId) : -1),
    [currentChannelId, filteredChannels]
  );

  const currentChannel = useMemo(
    () => (currentIndex >= 0 ? filteredChannels[currentIndex] : null),
    [currentIndex, filteredChannels]
  );

  // Group channels by category for categories view
  const channelsByCategory = useMemo(() => {
    const categories = {
      News: [] as IPTVChannel[],
      Music: [] as IPTVChannel[],
      Movies: [] as IPTVChannel[],
      Entertainment: [] as IPTVChannel[],
      Religious: [] as IPTVChannel[],
      Sports: [] as IPTVChannel[],
      Regional: [] as IPTVChannel[],
    };
    
    filteredChannels.forEach(ch => {
      const group = (ch.group || '').toLowerCase();
      if (group.includes('news')) categories.News.push(ch);
      else if (group.includes('music')) categories.Music.push(ch);
      else if (group.includes('movie') || group.includes('cinema')) categories.Movies.push(ch);
      else if (group.includes('religious') || group.includes('spirit') || group.includes('devotional')) categories.Religious.push(ch);
      else if (group.includes('sports')) categories.Sports.push(ch);
      else if (group.includes('entertainment') || group.includes('tv') || group.includes('serial')) categories.Entertainment.push(ch);
      else categories.Regional.push(ch);
    });
    
    return categories;
  }, [filteredChannels]);

  // Swipe to navigate between views
  const navigateView = useCallback((direction: 'left' | 'right') => {
    if (viewMode !== 'gallery') return;
    const idx = VIEW_ORDER.indexOf(sidebarView);
    const nextIdx = direction === 'left' ? idx + 1 : idx - 1;
    if (nextIdx >= 0 && nextIdx < VIEW_ORDER.length) {
      setTransitionDir(direction === 'left' ? 'left' : 'right');
      setSidebarView(VIEW_ORDER[nextIdx]);
      setTimeout(() => setTransitionDir(null), 350);
    }
  }, [sidebarView, viewMode]);

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => navigateView('left'),
    onSwipeRight: () => navigateView('right'),
  });

  // Handle view change with transition
  const handleViewChange = useCallback((view: SidebarView) => {
    const fromIdx = VIEW_ORDER.indexOf(sidebarView);
    const toIdx = VIEW_ORDER.indexOf(view);
    setTransitionDir(toIdx > fromIdx ? 'left' : 'right');
    setSidebarView(view);
    setTimeout(() => setTransitionDir(null), 350);
  }, [sidebarView]);

  // Force dark class on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // SEO Hook - Update meta tags based on current view
  useSEO({
    title: sidebarView === 'favorites' 
      ? 'My Favorites' 
      : sidebarView === 'categories' 
      ? 'Categories' 
      : sidebarView === 'trending' 
      ? 'Trending' 
      : 'Home',
    description: 'Stream live TV channels, on-demand content, and more with REET TV. Your favorite entertainment anytime, anywhere with our premium IPTV service.',
    keywords: ['IPTV', 'live TV', 'streaming', 'channels', 'on-demand', 'premium content'],
    url: window.location.href,
    type: 'website',
  });

  useEffect(() => {
    let isCancelled = false;
    
    const initApp = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Show cached channels IMMEDIATELY for instant display
        const cached = ChannelHealthService.getCachedChannels();
        if (cached && cached.length > 0 && !isCancelled) {
          const healthy = ChannelHealthService.filterHealthyChannels(cached);
          setChannels(healthy);
          // Don't set loading false yet - we're fetching fresh data
        }

        // Start fetching fresh data in background (non-blocking)
        const fetchPromise = fetchAndParseM3U(M3U_URL)
          .then(data => {
            if (isCancelled) return null;
            const validChannels = data.filter(channel => channel.url && channel.name && channel.id);
            ChannelHealthService.cacheChannels(validChannels);
            return validChannels;
          })
          .catch(err => {
            if (isCancelled) return null;
            console.error('Fetch error:', err);
            return null;
          });

        // Start background health check IMMEDIATELY (doesn't block UI)
        void (async () => {
          if (healthCheckRunning.current) return;
          healthCheckRunning.current = true;
          
          if (healthCheckAbortRef.current) {
            healthCheckAbortRef.current.abort();
          }
          healthCheckAbortRef.current = new AbortController();
          const abortSignal = healthCheckAbortRef.current.signal;

          try {
            const cachedChannels = await ChannelHealthService.getCachedChannels() || [];
            await ChannelHealthService.checkChannelsBatch(
              cachedChannels,
              (newHealthyIds) => {
                if (!abortSignal.aborted && !isCancelled) {
                  setHealthyChannelIds(newHealthyIds);
                }
              },
              15 // Faster batch processing
            );
          } finally {
            if (!abortSignal.aborted) {
              healthCheckRunning.current = false;
            }
          }
        })();

        // Wait for fetch to complete
        const validChannels = await fetchPromise;
        
        if (isCancelled) return;

        if (validChannels && validChannels.length > 0) {
          const healthFiltered = ChannelHealthService.filterHealthyChannels(validChannels);
          setChannels(healthFiltered);
        }

        setIsLoading(false);

        // Health check continues in background
      } catch (err) {
        console.error('Error loading channels:', err);
        if (channels.length === 0) {
          setError(err instanceof Error ? err.message : 'Connection failed');
        }
        setIsLoading(false);
      }
    };

    initApp();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, setChannels, setHealthyChannelIds]);

  useEffect(() => {
    if (healthyChannelIds === null) return;
    // Debounce the channel update to batch multiple health check updates
    const timeoutId = setTimeout(() => {
      setChannels((prevChannels) => {
        // Sort channels with healthy ones first, but keep ALL channels available
        const sorted = [...prevChannels].sort((a, b) => {
          const aHealthy = healthyChannelIds.has(a.id) ? 0 : 1;
          const bHealthy = healthyChannelIds.has(b.id) ? 0 : 1;
          return aHealthy - bHealthy;
        });
        return sorted;
      });
    }, 500); // Batch updates every 500ms to prevent UI thrashing
    return () => clearTimeout(timeoutId);
  }, [healthyChannelIds, setChannels]);

  const handleRefresh = useCallback(() => {
    localStorage.removeItem('iptv_channel_health_v2');
    setError(null);
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => { 
    return () => {
      keyboardService.destroy();
      // Cancel health check on unmount
      if (healthCheckAbortRef.current) {
        healthCheckAbortRef.current.abort();
      }
    };
  }, [keyboardService]);

  const handlePreferencesChange = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    StorageService.saveUserPreferences(newPreferences);
  };

  useEffect(() => {
    if (!preferences.keyboardShortcuts) { keyboardService.setEnabled(false); return; }
    keyboardService.setEnabled(true);
    keyboardService.clearShortcuts();

    keyboardService.addShortcut({ key: ' ', description: 'Play/Pause', action: () => {
      if (viewMode === 'player' || viewMode === 'mini') {
        const video = document.querySelector('video');
        if (video) { if (video.paused) video.play().catch(console.error); else video.pause(); }
      }
    }});
    keyboardService.addShortcut({ key: 'ArrowLeft', description: 'Previous Channel', action: () => {
      if (viewMode === 'player' && filteredChannels.length > 0 && currentIndex >= 0) {
        const previousIndex = (currentIndex - 1 + filteredChannels.length) % filteredChannels.length;
        setCurrentChannelId(filteredChannels[previousIndex].id);
      }
    }});
    keyboardService.addShortcut({ key: 'ArrowRight', description: 'Next Channel', action: () => {
      if (viewMode === 'player' && filteredChannels.length > 0 && currentIndex >= 0) {
        const nextIndex = (currentIndex + 1) % filteredChannels.length;
        setCurrentChannelId(filteredChannels[nextIndex].id);
      }
    }});
    keyboardService.addShortcut({ key: 'Escape', description: 'Back to Gallery', action: () => setViewMode('gallery') });
    keyboardService.addShortcut({ key: 'h', description: 'Toggle Favorite', action: () => {
      if (currentChannel) toggleFavorite(currentChannel.id);
    }});
    keyboardService.addShortcut({ key: 'm', description: 'Toggle Mute', action: () => {
      const video = document.querySelector('video'); if (video) video.muted = !video.muted;
    }});
    keyboardService.addShortcut({ key: 's', description: 'Settings', action: () => setShowSettings(true) });
    keyboardService.addShortcut({ key: '?', description: 'Show Shortcuts', action: () => setShowKeyboardShortcuts(true) });

    return () => keyboardService.clearShortcuts();
  }, [preferences.keyboardShortcuts, viewMode, currentIndex, filteredChannels, keyboardService, toggleFavorite, currentChannel]);

  const handleNext = useCallback(() => {
    if (filteredChannels.length === 0 || currentIndex < 0) return;
    const nextIndex = (currentIndex + 1) % filteredChannels.length;
    setCurrentChannelId(filteredChannels[nextIndex].id);
  }, [filteredChannels, currentIndex]);

  const handlePrevious = useCallback(() => {
    if (filteredChannels.length === 0 || currentIndex < 0) return;
    const previousIndex = (currentIndex - 1 + filteredChannels.length) % filteredChannels.length;
    setCurrentChannelId(filteredChannels[previousIndex].id);
  }, [filteredChannels, currentIndex]);

  const handleSelectChannel = useCallback((selectedChannel: IPTVChannel) => { 
    const selectedExists = filteredChannels.some((channel) => channel.id === selectedChannel.id);
    if (selectedExists) {
      setCurrentChannelId(selectedChannel.id);
      setViewMode('player');
    }
  }, [filteredChannels]);
  
  const handleMinimizePlayer = useCallback(() => setViewMode('mini'), []);
  const handleMaximizePlayer = useCallback(() => setViewMode('player'), []);
  const handleCloseMiniPlayer = useCallback(() => setViewMode('gallery'), []);
  const handleExitPlayer = useCallback(() => setViewMode('gallery'), []);
  const handleShowKeyboard = useCallback(() => setShowKeyboardShortcuts(true), []);

  // Reset current channel when view changes
  useEffect(() => {
    setCurrentChannelId(null);
  }, [sidebarView]);

  const flushPlaybackSession = useCallback((endedAt = Date.now()) => {
    const activeChannel = playbackSessionRef.current.channel;
    const startedAt = playbackSessionRef.current.startedAt;
    if (!activeChannel || startedAt === null) return;

    const duration = Math.max(0, Math.round((endedAt - startedAt) / 1000));
    if (duration >= 10) {
      addToWatchHistory({
        channelId: activeChannel.id,
        channelName: activeChannel.name,
        timestamp: endedAt,
        duration,
        logo: activeChannel.logo,
      });
    }

    playbackSessionRef.current = { channel: null, startedAt: null };
  }, [addToWatchHistory]);

  useEffect(() => {
    if (viewMode !== 'player' && viewMode !== 'mini') {
      flushPlaybackSession();
      return;
    }

    if (!currentChannel) {
      return;
    }

    const activeId = playbackSessionRef.current.channel?.id;
    if (activeId !== currentChannel.id) {
      flushPlaybackSession();
      playbackSessionRef.current = {
        channel: currentChannel,
        startedAt: Date.now(),
      };
    }
  }, [currentChannel, flushPlaybackSession, viewMode]);

  useEffect(() => {
    return () => {
      flushPlaybackSession();
    };
  }, [flushPlaybackSession]);

  const nextChannelName = useMemo(() => {
    if (filteredChannels.length === 0 || currentIndex < 0) return null;
    return filteredChannels[(currentIndex + 1) % filteredChannels.length].name;
  }, [filteredChannels, currentIndex]);

  // Memoize callbacks for VideoPlayer to prevent re-renders
  const handleToggleFavorite = useCallback(() => {
    if (currentChannel) {
      toggleFavorite(currentChannel.id);
    }
  }, [currentChannel, toggleFavorite]);

  // Transition class for page content
  const transitionClass = transitionDir === 'left'
    ? 'animate-slide-in-left'
    : transitionDir === 'right'
    ? 'animate-slide-in-right'
    : '';

  // Show instant UI - only show full spinner when NO data at all
  if (channels.length === 0 && isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden p-4 md:p-0">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-64 h-48 md:h-64 bg-primary/5 blur-[100px] rounded-full" />
        <div className="relative flex flex-col items-center gap-4 md:gap-6">
          <div className="relative">
            <Loader2 className="w-10 md:w-14 h-10 md:h-14 text-primary animate-spin-slow" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Tv className="w-4 md:w-5 h-4 md:h-5 text-foreground animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-1 md:space-y-1.5">
            <h2 className="text-lg md:text-xl font-black tracking-wider text-foreground uppercase">REET TV</h2>
            <p className="text-muted-foreground text-xs md:text-sm font-medium uppercase tracking-widest">Loading streams...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 md:p-6 text-center">
        <div className="w-12 md:w-14 h-12 md:h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
          <AlertCircle className="w-6 md:w-7 h-6 md:h-7 text-destructive" />
        </div>
        <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight mb-2">Connection Failed</h2>
        <p className="text-muted-foreground mb-6 max-w-sm text-xs md:text-sm">{error}</p>
        <button 
          onClick={handleRetry} 
          className="px-4 md:px-5 py-2 md:py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs md:text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 min-h-[44px] md:min-h-auto justify-center"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground flex">
      <div
        className="flex-1 min-w-0 flex flex-col"
        {...swipeHandlers}
      >
        {viewMode === 'gallery' ? (
          <div className={`h-full w-full pt-12 xs:pt-0 ${!isLandscape ? 'pb-14 xs:pb-16 md:pb-0' : 'pb-0'} ${transitionClass}`} key={sidebarView}>
            <ChannelGallery
              channels={filteredChannels}
              favorites={favorites}
              onSelect={handleSelectChannel}
              onToggleFavorite={toggleFavorite}
              onRefresh={handleRefresh}
              isLoading={isLoading}
              activeView={sidebarView}
              channelCounts={channelsByCategory}
            />
          </div>
        ) : viewMode === 'player' ? (
          <div className="h-full w-full flex flex-col relative bg-black animate-fade-in">
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><Loader2 className="w-6 md:w-8 h-6 md:h-8 animate-spin-slow text-primary" /></div>}>
              <VideoPlayer
                channel={currentChannel}
                nextChannelName={nextChannelName || undefined}
                isFavorite={currentChannel ? favorites.has(currentChannel.id) : false}
                onToggleFavorite={handleToggleFavorite}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onMinimize={handleMinimizePlayer}
                onExit={handleExitPlayer}
                onShowKeyboard={handleShowKeyboard}
              />
            </Suspense>
          </div>
        ) : null}
      </div>

      {/* Bottom nav - mobile only, hidden when playing */}
      {viewMode === 'gallery' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
          <BottomNavBar
            activeView={sidebarView}
            onViewChange={handleViewChange}
            onOpenSettings={() => setShowSettings(true)}
            favoritesCount={favorites.size}
          />
        </div>
      )}

      <Suspense fallback={null}>
        <MiniPlayer
          channel={currentChannel}
          isVisible={viewMode === 'mini'}
          onClose={handleCloseMiniPlayer}
          onMaximize={handleMaximizePlayer}
          position={miniPlayerPosition}
          onPositionChange={setMiniPlayerPosition}
        />
      </Suspense>

      <Suspense fallback={null}>
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          preferences={preferences}
          onPreferencesChange={handlePreferencesChange}
        />
      </Suspense>

      <Suspense fallback={null}>
        <KeyboardShortcuts
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
          shortcuts={keyboardService.getShortcuts()}
        />
      </Suspense>
    </div>
  );
};

export default Index;
