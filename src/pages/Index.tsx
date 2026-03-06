import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, useRef } from 'react';
import { IPTVChannel, UserPreferences } from '../types';
import { fetchAndParseM3U } from '../services/m3uParser';
import { StorageService } from '../services/storageService';
import { ChannelHealthService } from '../services/channelHealthService';
import { KeyboardService } from '../services/keyboardService';
import ChannelGallery from '../components/ChannelGallery';
import AppSidebar, { SidebarView } from '../components/AppSidebar';
import { Loader2, AlertCircle, Tv, RefreshCw, Menu } from 'lucide-react';

const VideoPlayer = lazy(() => import('../components/VideoPlayer'));
const SettingsPanel = lazy(() => import('../components/SettingsPanel'));
const KeyboardShortcuts = lazy(() => import('../components/KeyboardShortcuts'));
const MiniPlayer = lazy(() => import('../components/MiniPlayer'));

const M3U_URL = 'https://iptv-org.github.io/iptv/countries/in.m3u';

type ViewMode = 'gallery' | 'player' | 'mini';

const Index: React.FC = () => {
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [healthyIds, setHealthyIds] = useState<Set<string> | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [sidebarView, setSidebarView] = useState<SidebarView>('home');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const [preferences, setPreferences] = useState<UserPreferences>(StorageService.getUserPreferences());
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [keyboardService] = useState(() => new KeyboardService());
  const [miniPlayerPosition, setMiniPlayerPosition] = useState({ x: 20, y: 20 });
  const [refreshKey, setRefreshKey] = useState(0);
  const healthCheckRunning = useRef(false);

  // Force dark class on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const savedFavorites = StorageService.getFavorites();
        setFavorites(new Set(savedFavorites));

        const cached = ChannelHealthService.getCachedChannels();
        if (cached && cached.length > 0) {
          const healthy = ChannelHealthService.filterHealthyChannels(cached);
          setChannels(healthy);
          setIsLoading(false);
        }

        const data = await fetchAndParseM3U(M3U_URL);
        const validChannels = data.filter(channel => channel.url && channel.name && channel.id);

        ChannelHealthService.cacheChannels(validChannels);

        const healthFiltered = ChannelHealthService.filterHealthyChannels(validChannels);
        setChannels(healthFiltered);
        setIsLoading(false);

        if (!healthCheckRunning.current) {
          healthCheckRunning.current = true;
          ChannelHealthService.checkChannelsBatch(
            validChannels,
            (newHealthyIds) => setHealthyIds(new Set(newHealthyIds)),
            8
          ).finally(() => { healthCheckRunning.current = false; });
        }
      } catch (err) {
        console.error('Error loading channels:', err);
        if (channels.length === 0) {
          setError(err instanceof Error ? err.message : 'Connection failed');
        }
        setIsLoading(false);
      }
    };
    initApp();
  }, [refreshKey]);

  useEffect(() => {
    if (healthyIds === null) return;
    setChannels(() => {
      const cached = ChannelHealthService.getCachedChannels();
      if (!cached) return [];
      return cached.filter(ch => ch.url && ch.name && ch.id && healthyIds.has(ch.id));
    });
  }, [healthyIds]);

  const handleRefresh = useCallback(() => {
    localStorage.removeItem('iptv_channel_health_v2');
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => { return () => keyboardService.destroy(); }, [keyboardService]);
  useEffect(() => { StorageService.saveFavorites(Array.from(favorites)); }, [favorites]);

  const handlePreferencesChange = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    StorageService.saveUserPreferences(newPreferences);
  };

  const toggleFavorite = useCallback((channelId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(channelId)) next.delete(channelId);
      else next.add(channelId);
      return next;
    });
  }, []);

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
      if (viewMode === 'player' && channels.length > 0) setCurrentIndex((prev) => (prev - 1 + channels.length) % channels.length);
    }});
    keyboardService.addShortcut({ key: 'ArrowRight', description: 'Next Channel', action: () => {
      if (viewMode === 'player' && channels.length > 0) setCurrentIndex((prev) => (prev + 1) % channels.length);
    }});
    keyboardService.addShortcut({ key: 'Escape', description: 'Back to Gallery', action: () => setViewMode('gallery') });
    keyboardService.addShortcut({ key: 'h', description: 'Toggle Favorite', action: () => {
      if (currentIndex >= 0 && channels[currentIndex]) toggleFavorite(channels[currentIndex].id);
    }});
    keyboardService.addShortcut({ key: 'm', description: 'Toggle Mute', action: () => {
      const video = document.querySelector('video'); if (video) video.muted = !video.muted;
    }});
    keyboardService.addShortcut({ key: 's', description: 'Settings', action: () => setShowSettings(true) });
    keyboardService.addShortcut({ key: '?', description: 'Show Shortcuts', action: () => setShowKeyboardShortcuts(true) });

    return () => keyboardService.clearShortcuts();
  }, [preferences.keyboardShortcuts, viewMode, currentIndex, channels, keyboardService, toggleFavorite]);

  const handleNext = useCallback(() => { if (channels.length === 0) return; setCurrentIndex((prev) => (prev + 1) % channels.length); }, [channels.length]);
  const handlePrevious = useCallback(() => { if (channels.length === 0) return; setCurrentIndex((prev) => (prev - 1 + channels.length) % channels.length); }, [channels.length]);

  const handleSelectChannel = (index: number) => { setCurrentIndex(index); setViewMode('player'); };
  const handleMinimizePlayer = () => setViewMode('mini');
  const handleMaximizePlayer = () => setViewMode('player');
  const handleCloseMiniPlayer = () => setViewMode('gallery');

  const currentChannel = useMemo(() => currentIndex >= 0 ? channels[currentIndex] : null, [channels, currentIndex]);
  const nextChannelName = useMemo(() => {
    if (channels.length === 0 || currentIndex < 0) return null;
    return channels[(currentIndex + 1) % channels.length].name;
  }, [channels, currentIndex]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="w-14 h-14 text-primary animate-spin" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Tv className="w-5 h-5 text-foreground animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-black tracking-wider text-foreground uppercase">REET TV</h2>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Loading streams...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h2 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">Connection Failed</h2>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground flex">
      {/* Mobile sidebar overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowMobileSidebar(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative h-full w-[220px]" onClick={e => e.stopPropagation()}>
            <AppSidebar
              activeView={sidebarView}
              onViewChange={(v) => { setSidebarView(v); setShowMobileSidebar(false); }}
              onOpenSettings={() => { setShowSettings(true); setShowMobileSidebar(false); }}
              onOpenShortcuts={() => { setShowKeyboardShortcuts(true); setShowMobileSidebar(false); }}
              favoritesCount={favorites.size}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <AppSidebar
          activeView={sidebarView}
          onViewChange={setSidebarView}
          onOpenSettings={() => setShowSettings(true)}
          onOpenShortcuts={() => setShowKeyboardShortcuts(true)}
          favoritesCount={favorites.size}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar with menu */}
        <div className="lg:hidden flex items-center h-12 px-3 border-b border-border/20 bg-background/80 backdrop-blur-sm flex-shrink-0">
          <button onClick={() => setShowMobileSidebar(true)} className="p-2 rounded-lg hover:bg-muted/30 text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-2">
            <Tv className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">REET TV</span>
          </div>
        </div>

        {viewMode === 'gallery' ? (
          <ChannelGallery
            channels={channels}
            favorites={favorites}
            onSelect={handleSelectChannel}
            onToggleFavorite={toggleFavorite}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            activeView={sidebarView}
          />
        ) : viewMode === 'player' ? (
          <div className="h-full w-full flex flex-col relative bg-black">
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
              <VideoPlayer
                channel={currentChannel}
                nextChannelName={nextChannelName || undefined}
                isFavorite={currentChannel ? favorites.has(currentChannel.id) : false}
                onToggleFavorite={currentChannel ? () => toggleFavorite(currentChannel.id) : () => {}}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onMinimize={handleMinimizePlayer}
                onExit={() => setViewMode('gallery')}
                onShowKeyboard={() => setShowKeyboardShortcuts(true)}
              />
            </Suspense>
          </div>
        ) : null}
      </div>

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
