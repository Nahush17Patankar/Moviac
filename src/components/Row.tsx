import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaType, TmdbMediaItem } from '../types/tmdb';
import { PosterCard } from './PosterCard';

interface RowProps {
  title: string;
  subtitle?: string;
  items: TmdbMediaItem[];
  loading?: boolean;
  isInWatchlist: (id: number, type: MediaType) => boolean;
  isWatched: (id: number, type: MediaType) => boolean;
  onToggleWatchlist: (item: TmdbMediaItem) => void;
  onSelectItem: (item: TmdbMediaItem, layoutKey: string) => void;
  onHoverBackdrop?: (path: string | null) => void;
  rowId: string;
}

export const Row: React.FC<RowProps> = ({
  title,
  subtitle,
  items,
  loading = false,
  isInWatchlist,
  isWatched,
  onToggleWatchlist,
  onSelectItem,
  onHoverBackdrop,
  rowId,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -520 : 520;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (!loading && items.length === 0) return null;

  return (
    <section aria-label={title} className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => scrollByAmount('left')}
            aria-label={`Scroll ${title} left`}
            className="glass-chip flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount('right')}
            aria-label={`Scroll ${title} right`}
            className="glass-chip flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-4 overflow-x-auto pb-3 pt-1"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={`skel-${rowId}-${idx}`}
                className="w-[148px] shrink-0 sm:w-[168px]"
              >
                <div className="aspect-[2/3] w-full animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                <div className="mt-2.5 h-3.5 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-white/5" />
              </div>
            ))
          : items.map((item, idx) => (
              <PosterCard
                key={`${rowId}-${item.media_type}-${item.id}`}
                item={item}
                index={idx}
                compact
                layoutPrefix={rowId}
                inWatchlist={isInWatchlist(item.id, item.media_type)}
                isWatched={isWatched(item.id, item.media_type)}
                onToggleWatchlist={onToggleWatchlist}
                onSelect={onSelectItem}
                onHoverBackdrop={onHoverBackdrop}
              />
            ))}
      </div>
    </section>
  );
};
