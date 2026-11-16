import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Bookmark, Check, Film, Play, Tv } from 'lucide-react';
import { getPosterUrl } from '../services/tmdb';
import { TmdbMediaItem } from '../types/tmdb';

interface PosterCardProps {
  item: TmdbMediaItem;
  index?: number;
  inWatchlist: boolean;
  isWatching?: boolean;
  isWatched?: boolean;
  onToggleWatchlist: (item: TmdbMediaItem) => void;
  onToggleWatching?: (item: TmdbMediaItem) => void;
  onSelect: (item: TmdbMediaItem, layoutKey: string) => void;
  onHoverBackdrop?: (backdropPath: string | null) => void;
  layoutPrefix?: string;
  compact?: boolean;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  item,
  index = 0,
  inWatchlist,
  isWatching = false,
  isWatched = false,
  onToggleWatchlist,
  onToggleWatching,
  onSelect,
  onHoverBackdrop,
  layoutPrefix = 'card',
  compact = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, hovering: false });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  const posterUrl = !imgError ? getPosterUrl(item.poster_path, 'w500') : null;
  const layoutKey = `${layoutPrefix}-${item.media_type}-${item.id}`;

  const rating = item.vote_average || 0;
  const ratingPct = Math.min(100, Math.max(0, (rating / 10) * 100));
  const circumference = 2 * Math.PI * 14;
  const strokeOffset = circumference - (ratingPct / 100) * circumference;

  const ratingStrokeColor =
    rating >= 7.5 ? '#22d3ee' : rating >= 6 ? '#a78bfa' : '#fb7185';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const ry = (x - 0.5) * 14;
    const rx = (0.5 - y) * 14;
    setTilt({ rx, ry, hovering: true });
  };

  const handleMouseEnter = () => {
    if (onHoverBackdrop) onHoverBackdrop(item.backdrop_path || item.poster_path);
    if (!isTouchDevice) setTilt((prev) => ({ ...prev, hovering: true }));
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, hovering: false });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        delay: Math.min(index * 0.035, 0.35),
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`group relative flex flex-col ${compact ? 'w-[148px] sm:w-[168px]' : 'w-full'} shrink-0`}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isTouchDevice
            ? undefined
            : `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(${tilt.hovering ? '-6px' : '0px'}) scale(${tilt.hovering ? 1.03 : 1})`,
          transition: tilt.hovering
            ? 'transform 120ms ease-out, box-shadow 200ms ease-out'
            : 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease-out',
        }}
        className={`relative aspect-[2/3] w-full cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-slate-900/70 ${
          tilt.hovering
            ? 'shadow-[0_22px_45px_-12px_rgba(139,92,246,0.45),0_12px_28px_-10px_rgba(6,182,212,0.35)]'
            : 'shadow-[0_14px_30px_-12px_rgba(0,0,0,0.65)] animate-poster-idle'
        }`}
        onClick={() => onSelect(item, layoutKey)}
        role="button"
        tabIndex={0}
        aria-label={`Open details for ${item.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(item, layoutKey);
          }
        }}
      >
        <motion.div layoutId={layoutKey} className="h-full w-full">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={`${item.title} poster`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-4 text-center">
              {item.media_type === 'movie' ? (
                <Film className="mb-2 h-8 w-8 text-slate-400" />
              ) : (
                <Tv className="mb-2 h-8 w-8 text-slate-400" />
              )}
              <span className="line-clamp-3 text-xs font-medium text-slate-300">
                {item.title}
              </span>
            </div>
          )}
        </motion.div>

        {/* Bottom Scrim for high contrast */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {/* Type Badge (Top-Left) */}
        <span
          className={`pointer-events-none absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-md ${
            item.media_type === 'movie'
              ? 'border border-violet-400/30 bg-violet-950/70 text-violet-200'
              : 'border border-cyan-400/30 bg-cyan-950/70 text-cyan-200'
          }`}
        >
          {item.media_type === 'movie' ? 'Movie' : 'Series'}
        </span>

        {/* Top-Right Quick Actions: Watching + Bookmark */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {onToggleWatching && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatching(item);
              }}
              aria-label={
                isWatching
                  ? `Remove ${item.title} from currently watching`
                  : `Add ${item.title} to currently watching`
              }
              title={isWatching ? 'Currently Watching' : 'Mark as Currently Watching'}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border backdrop-blur-md transition-all duration-150 ${
                isWatching
                  ? 'border-cyan-300/60 bg-cyan-500/80 text-white shadow-md shadow-cyan-500/30'
                  : 'border-white/15 bg-black/50 text-slate-200 hover:bg-black/75 hover:text-white'
              }`}
            >
              <Play className={`h-3.5 w-3.5 ${isWatching ? 'fill-current' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(item);
            }}
            aria-label={
              inWatchlist
                ? `Remove ${item.title} from watchlist`
                : `Add ${item.title} to watchlist`
            }
            title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border backdrop-blur-md transition-all duration-150 ${
              inWatchlist
                ? 'accent-gradient border-white/30 text-white shadow-md shadow-violet-500/30'
                : 'border-white/15 bg-black/50 text-slate-200 hover:bg-black/75 hover:text-white'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${inWatchlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Circular Rating Badge (Bottom-Left) */}
        {rating > 0 && (
          <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/75 backdrop-blur-md">
            <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="2.75"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke={ratingStrokeColor}
                strokeWidth="2.75"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="font-mono-num absolute text-[10px] font-semibold text-white">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {isWatching && (
          <span className="pointer-events-none absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-lg border border-cyan-400/40 bg-cyan-950/85 px-2 py-0.5 text-[10px] font-semibold text-cyan-200 backdrop-blur-md">
            <Play className="h-2.5 w-2.5 fill-current" />
            Watching
          </span>
        )}

        {!isWatching && isWatched && (
          <span className="pointer-events-none absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 backdrop-blur-md">
            <Check className="h-3 w-3" />
            Watched
          </span>
        )}
      </div>

      {/* Unboxed Editorial Caption */}
      <div className="mt-2.5 px-0.5">
        <h3
          onClick={() => onSelect(item, layoutKey)}
          className="cursor-pointer truncate text-sm font-semibold text-slate-100 transition-colors group-hover:text-cyan-200"
          title={item.title}
        >
          {item.title}
        </h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
          <span className="font-mono-num">{item.year}</span>
          <span aria-hidden="true">·</span>
          <span>{item.media_type === 'movie' ? 'Movie' : 'Web Series'}</span>
        </p>
      </div>
    </motion.article>
  );
};
