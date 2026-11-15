import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-16 left-4 z-50 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-950/90 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-lg backdrop-blur-md md:bottom-5"
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-300" />
      <span>Offline Mode — Watchlists and cached assets remain available.</span>
    </div>
  );
};
