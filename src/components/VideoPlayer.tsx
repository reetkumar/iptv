import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { IPTVChannel } from '../types';
import { VideoControls } from './VideoControls';
import { VideoErrorOverlay } from './VideoErrorOverlay';
import { VideoLoadingOverlay } from './VideoLoadingOverlay';
import { motion, AnimatePresence } from './motion';

interface FullscreenElement {
  requestFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface DocumentExtension {
  fullscreenElement: FullscreenElement | null;
  webkitFullscreenElement: FullscreenElement | null;
  mozFullScreenElement: FullscreenElement | null;
  msFullscreenElement: FullscreenElement | null;
  exitFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface VideoPlayerProps {
  channel: IPTVChannel | null;
  nextChannelName?: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onMinimize: () => void;
  onExit: () => void;
  onShowKeyboard?: () => void;
}

const HLS_HINTS = ['.m3u8', '.m3u', 'mpegurl'];
const DIRECT_MEDIA_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.ogv', '.mov', '.m4v'];

const getPlaybackMode = (url: string) => {
  const normalizedUrl = url.toLowerCase();
  const isHls = HLS_HINTS.some((hint) => normalizedUrl.includes(hint));
  const isDirectMedia = DIRECT_MEDIA_EXTENSIONS.some((extension) => normalizedUrl.includes(extension));

  if (isHls) {
    return 'hls';
  }

  if (isDirectMedia) {
    return 'native';
  }

  return 'unknown';
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  nextChannelName,
  isFavorite,
  onToggleFavorite,
  onNext,
  onPrevious,
  onExit,
  onShowKeyboard,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [isPortrait, setIsPortrait] = useState(() => window.innerHeight > window.innerWidth);

  useEffect(() => {
    const handleOrientationChange = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handleOrientationChange);
    screen.orientation?.addEventListener('change', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      screen.orientation?.removeEventListener('change', handleOrientationChange);
    };
  }, []);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Play error:', error);
        }
      });
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    const elem = containerRef.current as FullscreenElement;
    const doc = document as unknown as DocumentExtension;
    
    const isCurrentlyFullscreen = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isCurrentlyFullscreen) {
      const requestFullscreen = 
        elem.requestFullscreen ||
        elem.webkitRequestFullscreen ||
        elem.mozRequestFullScreen ||
        elem.msRequestFullscreen;

      if (requestFullscreen) {
        requestFullscreen.call(elem).catch((err: Error) => {
          console.error('Fullscreen request failed:', err);
        });
        setIsFullscreen(true);
      }
    } else {
      const exitFullscreen = 
        doc.exitFullscreen ||
        doc.webkitExitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.msExitFullscreen;

      if (exitFullscreen) {
        exitFullscreen.call(doc).catch((err: Error) => {
          console.error('Exit fullscreen failed:', err);
        });
        setIsFullscreen(false);
      }
    }
  }, []);

  const handleSurfaceTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    showControlsTemporarily();
    if (event.touches.length !== 1) return;

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      toggleFullscreen();
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;
  }, [showControlsTemporarily, toggleFullscreen]);

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    
    setIsLoading(true);
    setShowLoadingOverlay(true);
    setError(null);

    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = null;
    }

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();

    let isComponentMounted = true;
    let retries = 0;
    const maxRetries = 2;

    let nativeLoadedMetadataHandler: (() => void) | null = null;
    let nativeErrorHandler: (() => void) | null = null;
    const playbackMode = getPlaybackMode(channel.url);

    const finishWithError = (message: string, autoAdvance = false) => {
      if (!isComponentMounted) return;
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = null;
      }
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
      setShowLoadingOverlay(false);
      setIsLoading(false);
      setError(message);
      if (autoAdvance) {
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          if (!isComponentMounted) return;
          onNext();
        }, 1200);
      }
    };

    const loadStream = () => {
      if (!isComponentMounted) return;
      video.removeAttribute('src');
      video.load();

      if (playbackMode === 'native') {
        video.src = channel.url;
        nativeLoadedMetadataHandler = () => {
          if (!isComponentMounted) return;
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
          setIsLoading(false);
          if (video.paused) {
            video.play().catch((error) => {
              if (error.name !== 'AbortError') {
                console.error('Play error:', error);
              }
            });
          }
        };
        nativeErrorHandler = () => {
          finishWithError('This stream format is not playable. Switching to the next channel...', true);
        };
        video.addEventListener('loadedmetadata', nativeLoadedMetadataHandler);
        video.addEventListener('error', nativeErrorHandler);
        return;
      }

      if (playbackMode === 'hls' && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          startLevel: -1,
          autoStartLoad: true,
          capLevelToPlayerSize: true,
          maxLoadingDelay: 2,
          maxBufferLength: 20,
          maxMaxBufferLength: 40,
          backBufferLength: 10,
          maxBufferSize: 20 * 1000 * 1000,
          maxBufferHole: 0.5,
          manifestLoadingTimeOut: 5000,
          manifestLoadingMaxRetry: 2,
          manifestLoadingRetryDelay: 300,
          levelLoadingTimeOut: 5000,
          levelLoadingMaxRetry: 2,
          fragLoadingTimeOut: 10000,
          fragLoadingMaxRetry: 3,
          fragLoadingRetryDelay: 300,
          abrEwmaDefaultEstimate: 400000,
          abrBandWidthFactor: 0.9,
          abrBandWidthUpFactor: 0.65,
          progressive: true,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 5,
          liveDurationInfinity: true,
        });

        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!isComponentMounted) return;
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
          setIsLoading(false);
          hls.currentLevel = -1;
          if (video.paused) {
            video.play().catch((error) => {
              if (error.name !== 'AbortError') {
                console.error('Play error:', error);
              }
            });
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!isComponentMounted) return;
          console.error('HLS Error:', data);
          if (data.fatal) {
            if (retries < maxRetries) {
              retries++;
              if (hlsRef.current === hls) {
                hls.destroy();
                hlsRef.current = null;
              }
              setTimeout(loadStream, 2000);
            } else {
              finishWithError('Stream unavailable or offline. Switching to the next channel...', true);
              if (hlsRef.current === hls) {
                hls.destroy();
                hlsRef.current = null;
              }
            }
          }
        });
      } else if (playbackMode === 'hls' && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.url;
        nativeLoadedMetadataHandler = () => {
          if (!isComponentMounted) return;
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
          setIsLoading(false);
          if (video.paused) {
            video.play().catch((error) => {
              if (error.name !== 'AbortError') {
                console.error('Play error:', error);
              }
            });
          }
        };
        nativeErrorHandler = () => {
          finishWithError('Stream unavailable or offline. Switching to the next channel...', true);
        };
        video.addEventListener('loadedmetadata', nativeLoadedMetadataHandler);
        video.addEventListener('error', nativeErrorHandler);
      } else {
        finishWithError('This stream uses an unsupported format. Switching to the next channel...', true);
      }
    };

    loadStream();

    overlayTimeoutRef.current = setTimeout(() => {
      if (isComponentMounted) {
        setShowLoadingOverlay(false);
      }
    }, 8000);

    loadTimeoutRef.current = setTimeout(() => {
      if (isComponentMounted) {
        finishWithError('Stream is taking too long. Switching to the next channel...', true);
      }
    }, 30000);

    return () => {
      isComponentMounted = false;
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = null;
      }
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (nativeLoadedMetadataHandler) {
        video.removeEventListener('loadedmetadata', nativeLoadedMetadataHandler);
      }
      if (nativeErrorHandler) {
        video.removeEventListener('error', nativeErrorHandler);
      }
      video.pause();
    };
  }, [channel, onNext, retryToken]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => {
      setTimeout(() => {
        if (video.paused === false && video.readyState < 3) {
          setShowLoadingOverlay(true);
        }
      }, 1000);
    };
    const handleCanPlay = () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = null;
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      setShowLoadingOverlay(false);
      setIsLoading(false);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [handlePlay, handlePause]);

  useEffect(() => {
    const doc = document as unknown as DocumentExtension;
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, [onNext]);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setShowLoadingOverlay(true);
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setRetryToken((prev) => prev + 1);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <p className="text-muted-foreground">No channel selected</p>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative w-full h-full bg-black group overflow-hidden ${isPortrait && isFullscreen ? 'flex items-center justify-center' : ''}`}
      onMouseMove={showControlsTemporarily}
      onDoubleClick={toggleFullscreen}
      onTouchStart={handleSurfaceTouchStart}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.video
        ref={videoRef}
        className={`${isPortrait && isFullscreen ? 'w-auto h-auto max-w-full max-h-full object-contain' : 'absolute inset-0 w-full h-full object-fill'} cursor-pointer saturate-[1.28] contrast-[1.08] brightness-[1.03]`}
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      />

      <AnimatePresence>
        {showLoadingOverlay && (
          <VideoLoadingOverlay show={showLoadingOverlay} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <VideoErrorOverlay
            error={error}
            onRetry={handleRetry}
            onExit={onExit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="video-controls-animate absolute inset-0"
          >
            <VideoControls
              channel={channel}
              nextChannelName={nextChannelName}
              isPlaying={isPlaying}
              isMuted={isMuted}
              volume={volume}
              isFullscreen={isFullscreen}
              showControls={showControls}
              isFavorite={isFavorite}
              onTogglePlay={togglePlay}
              onToggleMute={toggleMute}
              onVolumeChange={handleVolumeChange}
              onToggleFullscreen={toggleFullscreen}
              onToggleFavorite={onToggleFavorite}
              onPrevious={onPrevious}
              onNext={onNext}
              onExit={onExit}
              onShowKeyboard={onShowKeyboard}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default React.memo(VideoPlayer, (prevProps, nextProps) => {
  return (
    prevProps.channel?.id === nextProps.channel?.id &&
    prevProps.nextChannelName === nextProps.nextChannelName &&
    prevProps.isFavorite === nextProps.isFavorite
  );
});
