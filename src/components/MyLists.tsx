import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDownUp,
  Bookmark,
  Check,
  Download,
  Film,
  Minus,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  Tv,
  Upload,
} from 'lucide-react';
import { getPosterUrl } from '../services/tmdb';
import { MediaType, TmdbMediaItem, WatchlistEntry } from '../types/tmdb';

type ListTab = 'movie' | 'tv';
type SortOption = 'recent' | 'rating' | 'year';

interface MyListsProps {
  watchlistMovies: WatchlistEntry[];
  watchlistSeries: WatchlistEntry[];
  watchedMovies: WatchlistEntry[];
  watchedSeries: WatchlistEntry[];
  onSelectEntry: (item: TmdbMediaItem, layoutKey: string) => void;
  onRemove: (id: number, mediaType: MediaType, status: 'to-watch' | 'watched') => void;
  onMoveStatus: (id: number, mediaType: MediaType, toStatus: 'to-watch' | 'watched') => void;
  onUpdateSeriesProgress: (id: number, season: number, episode: number) => void;
  onExportJson: () => void;
  onImportJson: (jsonText: string) => { ok: boolean; message: string };
}

function entryToMediaItem(entry: WatchlistEntry): TmdbMediaItem {
  return {
    id: entry.id,
    media_type: entry.media_type,
    title: entry.title,
    overview: '',
    poster_path: entry.poster_path,
    backdrop_path: entry.backdrop_path,
    release_date: entry.year ? `${entry.year}-01-01` : '',
    year: entry.year,
    vote_average: entry.vote_average,
    vote_count: 0,
    popularity: 0,
    genre_ids: entry.genre_ids || [],
    original_language: 'en',
  };
}

export const MyLists: React.FC<MyListsProps> = ({
  watchlistMovies,
  watchlistSeries,
  watchedMovies,
  watchedSeries,
  onSelectEntry,
  onRemove,
  onMoveStatus,
  onUpdateSeriesProgress,
  onExportJson,
  onImportJson,
}) => {
  const [activeTab, setActiveTab] = useState<ListTab>('movie');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [importNotice, setImportNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const movieTotal = watchlistMovies.length + watchedMovies.length;
  const seriesTotal = watchlistSeries.length + watchedSeries.length;

  const sortEntries = (entries: WatchlistEntry[]) => {
    const copy = [...entries];
    if (sortBy === 'rating') {
      return copy.sort((a, b) => b.vote_average - a.vote_average);
    }
    if (sortBy === 'year') {
      return copy.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
    }
    return copy.sort((a, b) => b.addedAt - a.addedAt);
  };

  const toWatchList = useMemo(
    () => sortEntries(activeTab === 'movie' ? watchlistMovies : watchlistSeries),
    [activeTab, watchlistMovies, watchlistSeries, sortBy]
  );

  const watchedList = useMemo(
    () => sortEntries(activeTab === 'movie' ? watchedMovies : watchedSeries),
    [activeTab, watchedMovies, watchedSeries, sortBy]
  );

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const result = onImportJson(reader.result);
        setImportNotice({ ok: result.ok, text: result.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const renderCard = (entry: WatchlistEntry, status: 'to-watch' | 'watched') => {
    const posterUrl = getPosterUrl(entry.poster_path, 'w500');
    const layoutKey = `list-${status}-${entry.media_type}-${entry.id}`;
    const prog = entry.progress || { season: 1, episode: 1 };

    return (
      <motion.div
        key={layoutKey}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-surface flex flex-col justify-between gap-3 rounded-2xl p-3.5"
      >
        <div className="flex gap-3.5">
          <div
            onClick={() => onSelectEntry(entryToMediaItem(entry), layoutKey)}
            className="aspect-[2/3] w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-slate-900"
          >
            <motion.div layoutId={layoutKey} className="h-full w-full">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={entry.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-500">
                  {entry.media_type === 'movie' ? (
                    <Film className="h-6 w-6" />
                  ) : (
                    <Tv className="h-6 w-6" />
                  )}
                </div>
              )}
            </motion.div>
          </div>

          <div className="min-w-0 flex-1">
            <h4
              onClick={() => onSelectEntry(entryToMediaItem(entry), layoutKey)}
              className="cursor-pointer line-clamp-2 text-sm font-semibold text-white hover:text-cyan-200"
            >
              {entry.title}
            </h4>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono-num">{entry.year}</span>
              {entry.vote_average > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num inline-flex items-center gap-1 text-amber-300">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {entry.vote_average.toFixed(1)}
                  </span>
                </>
              )}
            </div>

            {entry.media_type === 'tv' && status === 'to-watch' && (
              <div className="mt-2.5 space-y-1.5 rounded-xl border border-white/10 bg-black/30 p-2">
                <p className="text-[11px] font-medium text-cyan-200">
                  Currently watching: Season {prog.season}, Episode {prog.episode}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">S</span>
                    <button
                      type="button"
                      onClick={() => onUpdateSeriesProgress(entry.id, prog.season - 1, prog.episode)}
                      aria-label="Previous season"
                      className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-white hover:bg-white/20"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-mono-num w-5 text-center text-white">{prog.season}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateSeriesProgress(entry.id, prog.season + 1, 1)}
                      aria-label="Next season"
                      className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">E</span>
                    <button
                      type="button"
                      onClick={() => onUpdateSeriesProgress(entry.id, prog.season, prog.episode - 1)}
                      aria-label="Previous episode"
                      className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-white hover:bg-white/20"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-mono-num w-5 text-center text-white">{prog.episode}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateSeriesProgress(entry.id, prog.season, prog.episode + 1)}
                      aria-label="Next episode"
                      className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
          <button
            type="button"
            onClick={() =>
              onMoveStatus(
                entry.id,
                entry.media_type,
                status === 'to-watch' ? 'watched' : 'to-watch'
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/20 hover:text-white"
          >
            {status === 'to-watch' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" />
                Mark Watched
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5 text-cyan-300" />
                Move to To Watch
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onRemove(entry.id, entry.media_type, status)}
            aria-label={`Remove ${entry.title}`}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/15"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header & JSON Export/Import */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Watchlists
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Movies and Web Series are kept cleanly separated in your browser storage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onExportJson}
            className="glass-chip inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-cyan-300" />
            Export JSON
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="glass-chip inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white"
          >
            <Upload className="h-3.5 w-3.5 text-violet-300" />
            Import JSON
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileImport}
            className="hidden"
          />
        </div>
      </div>

      {importNotice && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-medium ${
            importNotice.ok
              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
              : 'border-rose-400/40 bg-rose-500/15 text-rose-200'
          }`}
        >
          {importNotice.text}
        </div>
      )}

      {/* Tabs + Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="glass-surface inline-flex rounded-2xl p-1">
          <button
            type="button"
            onClick={() => setActiveTab('movie')}
            className={`inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'movie'
                ? 'accent-gradient text-white shadow-md shadow-violet-500/25'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Film className="h-4 w-4" />
            Movie Watchlist
            <span className="font-mono-num rounded-md bg-black/30 px-1.5 py-0.5 text-xs">
              {movieTotal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tv')}
            className={`inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'tv'
                ? 'accent-gradient text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Tv className="h-4 w-4" />
            Series Watchlist
            <span className="font-mono-num rounded-md bg-black/30 px-1.5 py-0.5 text-xs">
              {seriesTotal}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4 text-slate-400" />
          <select
            aria-label="Sort watchlist"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-xs font-medium text-white focus:border-cyan-400/60 focus:outline-none"
          >
            <option value="recent">Recently Added</option>
            <option value="rating">Highest Rating</option>
            <option value="year">Release Year</option>
          </select>
        </div>
      </div>

      {/* To Watch Section */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white">
          To Watch ({toWatchList.length})
        </h2>
        {toWatchList.length === 0 ? (
          <div className="glass-surface flex flex-col items-center justify-center rounded-3xl px-6 py-12 text-center">
            <Bookmark className="mb-3 h-7 w-7 text-slate-400" />
            <p className="text-sm font-medium text-slate-200">
              Your {activeTab === 'movie' ? 'Movie' : 'Series'} To Watch list is empty.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Tap the bookmark icon on any {activeTab === 'movie' ? 'movie' : 'web series'} poster to save it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {toWatchList.map((entry) => renderCard(entry, 'to-watch'))}
          </div>
        )}
      </section>

      {/* Watched Section */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white">
          Watched ({watchedList.length})
        </h2>
        {watchedList.length === 0 ? (
          <p className="text-sm text-slate-400">
            No {activeTab === 'movie' ? 'movies' : 'web series'} marked as watched yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {watchedList.map((entry) => renderCard(entry, 'watched'))}
          </div>
        )}
      </section>
    </div>
  );
};
