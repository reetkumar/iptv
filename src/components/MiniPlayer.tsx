import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { X, Maximize2, Pause, Play, Tv } from 'lucide-react';
import { IPTVChannel } from '../types';

const HLS_HINTS = ['.m3u8', '.m3u', 'mpegurl'];
const DIRECT_MEDIA_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.ogv', '.mov', '.m4v'];

const getPlaybackMode = (url: string) => {
  const normalizedUrl = url.toLowerCase();
  if (HLS_HINTS.some((hint) => normalizedUrl.includes(hint))) {
    return 'hls';
  }
  if (DIRECT_MEDIA_EXTENSIONS.some((extension) => normalizedUrl.includes(extension))) {
    return 'native';
  }
  return 'unknown';
};

interface MiniPlayerProps {
  channel: IPTVChannel | null;
  isVisible: boolean;
  onClose: () => void;
  onMaximize: () => void;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({
  channel,
  isVisible,
  onClose,
  onMaximize,
  position,
  onPositionChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isVisible || !channel || !videoRef.current) return;

    const video = videoRef.current;
    const playbackMode = getPlaybackMode(channel.url);

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    video.removeAttribute('src');
    video.load();

    if (playbackMode === 'hls' && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(console.error);
      });
    } else if (playbackMode === 'hls' && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url;
      video.play().catch(console.error);
    } else if (playbackMode === 'native') {
      video.src = channel.url;
      video.play().catch(console.error);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, isVisible]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - dragOffset.current.x;
      const y = e.clientY - dragOffset.current.y;
      onPositionChange({ x, y });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onPositionChange]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!isVisible || !channel) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 glass-card overflow-hidden cursor-move"
      style={{
        left: position.x,
        top: position.y,
        width: 320,
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Video */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Info Bar */}
      <div className="p-3 flex items-center justify-between bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Tv className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">{channel.name}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onMaximize}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title="Maximize"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
