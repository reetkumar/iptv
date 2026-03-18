import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface VideoErrorOverlayProps {
  error: string;
  onRetry: () => void;
  onExit: () => void;
}

export const VideoErrorOverlay: React.FC<VideoErrorOverlayProps> = ({
  error,
  onRetry,
  onExit,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-40">
      <div className="relative mb-6">
        <AlertCircle className="w-16 h-16 text-destructive" />
      </div>
      <p className="text-white font-semibold text-center max-w-xs">{error}</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={onRetry}
          className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
        <button
          onClick={onExit}
          className="px-6 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
};
