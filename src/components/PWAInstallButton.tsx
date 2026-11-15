import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Install Moviac app"
        title="Install Moviac on your device"
        className={
          compact
            ? 'glass-chip inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-cyan-200 hover:border-cyan-400/50 hover:text-white whitespace-nowrap shrink-0'
            : 'accent-gradient inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 transition-all hover:brightness-110 whitespace-nowrap shrink-0'
        }
      >
        <Download className="h-3.5 w-3.5" />
        <span>{compact ? 'Install' : 'Install App'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuide(false);
          }}
        >
          <div className="glass-panel relative w-full max-w-md rounded-3xl p-6 text-slate-100">
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              aria-label="Close install instructions"
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="accent-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Install Moviac on Mobile
                </h3>
                <p className="text-xs text-slate-400">
                  Add it to your home screen as a standalone app
                </p>
              </div>
            </div>

            {isIOS ? (
              <ol className="space-y-2.5 text-sm text-slate-200">
                <li className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-mono-num text-cyan-300">1.</span>
                  <span>
                    Open Moviac in <strong>Safari</strong> on your iPhone or iPad.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-mono-num text-cyan-300">2.</span>
                  <span className="inline-flex flex-wrap items-center gap-1">
                    Tap the <Share className="inline h-4 w-4 text-cyan-300" />{' '}
                    <strong>Share</strong> button in Safari&apos;s toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-mono-num text-cyan-300">3.</span>
                  <span>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-2.5 text-sm text-slate-200">
                <li className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-mono-num text-cyan-300">1.</span>
                  <span>
                    Open this Moviac URL directly in <strong>Chrome</strong> (Android) or <strong>Safari</strong> (iPhone) — not inside an embedded preview frame.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-mono-num text-cyan-300">2.</span>
                  <span>
                    On Android Chrome, tap the <strong>Install App</strong> button or the <strong>⋮ menu → Install app / Add to Home screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-mono-num text-cyan-300">3.</span>
                  <span>
                    On iPhone Safari, tap <strong>Share → Add to Home Screen</strong>.
                  </span>
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-white/15 py-2.5 text-sm font-semibold text-white hover:bg-white/25"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
