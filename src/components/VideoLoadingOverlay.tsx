import React from 'react';
import { Loader2 } from 'lucide-react';

interface VideoLoadingOverlayProps {
  show: boolean;
}

export const VideoLoadingOverlay: React.FC<VideoLoadingOverlayProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
      <Loader2 className="w-12 h-12 text-white animate-spin" />
    </div>
  );
};
