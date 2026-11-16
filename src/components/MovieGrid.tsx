import React from 'react';
import { Film } from 'lucide-react';
import { MediaType, TmdbMediaItem } from '../types/tmdb';
import { PosterCard } from './PosterCard';

interface MovieGridProps {
  title?: string;
  subtitle?: string;
  items: TmdbMediaItem[];
  loading?: boolean;
  emptyMessage?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isInWatchlist: (id: number, type: MediaType) => boolean;
  isWatching?: (id: number, type: MediaType) => boolean;
  isWatched: (id: number, type: MediaType) => boolean;
  onToggleWatchlist: (item: TmdbMediaItem) => void;
  onToggleWatching?: (item: TmdbMediaItem) => void;
  onSelectItem: (item: TmdbMediaItem, layoutKey: string) => void;
  onHoverBackdrop?: (path: string | null) => void;
  gridId?: string;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  title,
  subtitle,
  items,
  loading = false,
  emptyMessage = 'No titles matched your current filters.',
  hasMore = false,
  onLoadMore,
  isInWatchlist,
  isWatching,
  isWatched,
  onToggleWatchlist,
  onToggleWatching,
  onSelectItem,
  onHoverBackdrop,
  gridId = 'grid',
}) => {
  return (
    <section className="space-y-4">
      {(title || subtitle) && (
        <div>
          {title && (
            <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
      )}

      {!loading && items.length === 0 ? (
        <div className="glass-surface flex flex-col items-center justify-center rounded-3xl px-6 py-14 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-slate-300">
            <Film className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-200">{emptyMessage}</p>
          <p className="mt-1 text-xs text-slate-400">
            Try removing a genre or widening the year and rating filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item, idx) => (
            <PosterCard
              key={`${gridId}-${item.media_type}-${item.id}`}
              item={item}
              index={idx}
              layoutPrefix={gridId}
              inWatchlist={isInWatchlist(item.id, item.media_type)}
              isWatching={isWatching ? isWatching(item.id, item.media_type) : false}
              isWatched={isWatched(item.id, item.media_type)}
              onToggleWatchlist={onToggleWatchlist}
              onToggleWatching={onToggleWatching}
              onSelect={onSelectItem}
              onHoverBackdrop={onHoverBackdrop}
            />
          ))}

          {loading &&
            Array.from({ length: 12 }).map((_, idx) => (
              <div key={`grid-skel-${idx}`} className="w-full">
                <div className="aspect-[2/3] w-full animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                <div className="mt-2.5 h-3.5 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-white/5" />
              </div>
            ))}
        </div>
      )}

      {hasMore && onLoadMore && !loading && items.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onLoadMore}
            className="glass-chip rounded-xl px-6 py-2.5 text-sm font-semibold text-white hover:border-cyan-400/50 hover:bg-white/15"
          >
            Load More Titles
          </button>
        </div>
      )}
    </section>
  );
};
