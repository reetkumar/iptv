import React from 'react';
import { IPTVChannel } from '../types';
import {
  ArrowLeft,
  Heart,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Keyboard,
} from 'lucide-react';

interface VideoControlsProps {
  channel: IPTVChannel;
  nextChannelName?: string;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  showControls: boolean;
  isFavorite: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleFullscreen: () => void;
  onToggleFavorite: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onExit: () => void;
  onShowKeyboard?: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  channel,
  nextChannelName,
  isPlaying,
  isMuted,
  volume,
  isFullscreen,
  showControls,
  isFavorite,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen,
  onToggleFavorite,
  onPrevious,
  onNext,
  onExit,
  onShowKeyboard,
}) => {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 to-transparent" />

      <div 
        className="absolute top-0 left-0 right-0 px-3 md:px-4 flex items-center justify-between"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 12px))' }}
      >
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-2 xs:px-3 md:px-4 py-1.5 xs:py-2 md:py-2 rounded-lg xs:rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-black/60 transition-colors text-xs xs:text-sm md:text-base min-h-[44px] xs:min-h-[40px] md:min-h-auto"
        >
          <ArrowLeft className="w-3 xs:w-4 h-3 xs:h-4" />
          <span className="hidden sm:inline font-medium">Back</span>
        </button>

        <div className="flex items-center gap-2 xs:gap-3">
          <div className="text-right hidden sm:block text-xs md:text-base">
            <h2 className="font-bold text-white line-clamp-1">{channel.name}</h2>
            {channel.group && (
              <p className="text-xs md:text-sm text-white/60 line-clamp-1">{channel.group}</p>
            )}
          </div>
          <button
            onClick={onToggleFavorite}
            className="p-2 xs:p-3 md:p-3 rounded-lg xs:rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center xs:min-h-[auto] xs:min-w-[auto]"
          >
            <Heart
              className={`w-4 xs:w-5 h-4 xs:h-5 ${
                isFavorite ? 'text-accent fill-accent' : 'text-white'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 xs:h-28 md:h-40 bg-gradient-to-t from-black/80 to-transparent" />

      <div 
        className="absolute bottom-0 left-0 right-0 px-3 md:px-4 space-y-2 xs:space-y-3 md:space-y-4"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}
      >
        <div className="flex items-center justify-center gap-2 xs:gap-3 md:gap-4">
          <button
            onClick={onPrevious}
            className="p-2 xs:p-3 md:p-3 rounded-lg xs:rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center xs:min-h-[auto] xs:min-w-[auto]"
          >
            <SkipBack className="w-4 xs:w-5 h-4 xs:h-5 text-white" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-12 xs:w-14 md:w-16 h-12 xs:h-14 md:h-16 rounded-full bg-gradient-premium flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 xs:w-6 md:w-7 h-5 xs:h-6 md:h-7 text-white" fill="white" />
            ) : (
              <Play className="w-5 xs:w-6 md:w-7 h-5 xs:h-6 md:h-7 text-white ml-0.5 xs:ml-1" fill="white" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-2 xs:p-3 md:p-3 rounded-lg xs:rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center xs:min-h-[auto] xs:min-w-[auto]"
          >
            <SkipForward className="w-4 xs:w-5 h-4 xs:h-5 text-white" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 xs:gap-3">
          <div className="flex items-center gap-1 xs:gap-3 flex-shrink-0">
            <button
              onClick={onToggleMute}
              className="p-1.5 xs:p-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center xs:min-h-[auto] xs:min-w-[auto]"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 xs:w-5 h-4 xs:h-5 text-white" />
              ) : (
                <Volume2 className="w-4 xs:w-5 h-4 xs:h-5 text-white" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-24 hidden sm:block"
            />
          </div>

          {nextChannelName && (
            <div className="hidden md:flex items-center gap-2 text-sm text-white/60">
              <span>Next:</span>
              <span className="font-medium text-white">{nextChannelName}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {onShowKeyboard && (
              <button
                onClick={onShowKeyboard}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors hidden sm:block"
                title="Keyboard shortcuts"
              >
                <Keyboard className="w-5 h-5 text-white" />
              </button>
            )}
            <button
              onClick={onToggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
