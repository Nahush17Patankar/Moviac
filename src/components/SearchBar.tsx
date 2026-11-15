import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bookmark,
  Clock,
  Film,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { GENRE_CHIPS, getPosterUrl, getProfileUrl } from '../services/tmdb';
import {
  ContentFilter,
  GenreChipId,
  MediaType,
  TmdbMediaItem,
  TmdbPersonResult,
} from '../types/tmdb';

interface SearchResultsPanelProps {
  query: string;
  debouncedQuery: string;
  movies: TmdbMediaItem[];
  series: TmdbMediaItem[];
  people: TmdbPersonResult[];
  smartMatches: TmdbMediaItem[];
  smartSummary: string;
  trendingSuggestions: TmdbMediaItem[];
  recentSearches: string[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onSelectSuggestion: (term: string) => void;
  onClearRecent: () => void;
  onLoadMore: () => void;
  onClose: () => void;
  onSelectItem: (item: TmdbMediaItem, layoutKey: string) => void;
  isInWatchlist: (id: number, type: MediaType) => boolean;
  onToggleWatchlist: (item: TmdbMediaItem) => void;
  onHoverBackdrop?: (path: string | null) => void;
}

export const SearchResultsPanel: React.FC<SearchResultsPanelProps> = ({
  query,
  debouncedQuery,
  movies,
  series,
  people,
  smartMatches,
  smartSummary,
  trendingSuggestions,
  recentSearches,
  loading,
  loadingMore,
  error,
  hasMore,
  onSelectSuggestion,
  onClearRecent,
  onLoadMore,
  onClose,
  onSelectItem,
  isInWatchlist,
  onToggleWatchlist,
  onHoverBackdrop,
}) => {
  const [tab, setTab] = useState<ContentFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<GenreChipId | ''>('');
  const [minRating, setMinRating] = useState(0);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  const applyLocalFilters = (list: TmdbMediaItem[]) => {
    return list.filter((item) => {
      if (minRating > 0 && item.vote_average < minRating) return false;
      const y = Number(item.year);
      if (yearFrom && Number.isFinite(y) && y < Number(yearFrom)) return false;
      if (yearTo && Number.isFinite(y) && y > Number(yearTo)) return false;
      if (selectedGenre) {
        const cfg = GENRE_CHIPS.find((c) => c.id === selectedGenre);
        if (cfg) {
          const allowed =
            item.media_type === 'movie' ? cfg.fallbackMovieIds : cfg.fallbackTvIds;
          if (!item.genre_ids.some((gid) => allowed.includes(gid))) return false;
        }
      }
      return true;
    });
  };

  const filteredMovies = useMemo(
    () => applyLocalFilters(movies),
    [movies, minRating, yearFrom, yearTo, selectedGenre]
  );
  const filteredSeries = useMemo(
    () => applyLocalFilters(series),
    [series, minRating, yearFrom, yearTo, selectedGenre]
  );
  const filteredSmart = useMemo(
    () =>
      applyLocalFilters(smartMatches).filter((item) =>
        tab === 'all' ? true : item.media_type === tab
      ),
    [smartMatches, tab, minRating, yearFrom, yearTo, selectedGenre]
  );

  const hasQuery = query.trim().length > 0;
  const totalVisible =
    (tab === 'all' || tab === 'movie' ? filteredMovies.length : 0) +
    (tab === 'all' || tab === 'tv' ? filteredSeries.length : 0) +
    filteredSmart.length +
    (tab === 'all' ? people.length : 0);

  const renderResultCard = (item: TmdbMediaItem, prefix: string) => {
    const posterUrl = getPosterUrl(item.poster_path, 'w500');
    const inWl = isInWatchlist(item.id, item.media_type);
    const layoutKey = `${prefix}-${item.media_type}-${item.id}`;

    return (
      <div
        key={layoutKey}
        onMouseEnter={() => onHoverBackdrop?.(item.backdrop_path || item.poster_path)}
        className="glass-surface group flex gap-3.5 rounded-2xl p-3 transition-all hover:border-white/25 hover:bg-white/12"
      >
        <div
          onClick={() => onSelectItem(item, layoutKey)}
          className="relative aspect-[2/3] w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-slate-900"
        >
          <motion.div layoutId={layoutKey} className="h-full w-full">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={item.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-500">
                <Film className="h-6 w-6" />
              </div>
            )}
          </motion.div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4
                onClick={() => onSelectItem(item, layoutKey)}
                className="cursor-pointer line-clamp-2 text-sm font-semibold text-white group-hover:text-cyan-200"
              >
                {item.title}
              </h4>
              <span
                className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${
                  item.media_type === 'movie'
                    ? 'border-violet-400/35 bg-violet-500/20 text-violet-200'
                    : 'border-cyan-400/35 bg-cyan-500/20 text-cyan-200'
                }`}
              >
                {item.media_type === 'movie' ? 'Movie' : 'Series'}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono-num">{item.year}</span>
              {item.vote_average > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num inline-flex items-center gap-1 text-amber-300">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {item.vote_average.toFixed(1)}
                  </span>
                </>
              )}
            </div>

            {item.overview && (
              <p className="mt-1.5 line-clamp-2 text-xs text-slate-300/90">
                {item.overview}
              </p>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleWatchlist(item)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                inWl
                  ? 'accent-gradient text-white'
                  : 'border border-white/15 bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Bookmark className={`h-3 w-3 ${inWl ? 'fill-current' : ''}`} />
              {inWl ? 'Saved' : '+ Watchlist'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="mx-auto max-w-7xl space-y-6 px-4 pt-4 pb-24 sm:px-6 lg:px-8"
    >
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="glass-surface inline-flex rounded-2xl p-1">
            {(['all', 'movie', 'tv'] as ContentFilter[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setTab(opt)}
                className={`whitespace-nowrap shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  tab === opt
                    ? 'accent-gradient text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {opt === 'all' ? 'All' : opt === 'movie' ? 'Movies' : 'Series'}
              </button>
            ))}
          </div>

          {hasQuery && (
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`glass-chip inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ${
                showFilters || selectedGenre || minRating > 0 || yearFrom || yearTo
                  ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
                  : 'text-slate-200'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Result Filters
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="glass-chip inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
          Back to Browse
        </button>
      </div>

      {/* Optional Filters for Search Results */}
      {hasQuery && showFilters && (
        <div className="glass-surface grid grid-cols-1 gap-4 rounded-2xl p-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-slate-300">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value as GenreChipId | '')}
              className="w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-xs text-white"
            >
              <option value="">All Genres</option>
              {GENRE_CHIPS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 flex justify-between text-xs text-slate-300">
              <span>Min Rating</span>
              <span className="font-mono-num text-cyan-300">
                {minRating > 0 ? `${minRating}+` : 'Any'}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="9"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-300">From Year</label>
            <input
              type="number"
              placeholder="e.g. 2000"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="font-mono-num w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-300">To Year</label>
            <input
              type="number"
              placeholder="e.g. 2026"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              className="font-mono-num w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-xs text-white"
            />
          </div>
        </div>
      )}

      {/* Empty Search Box: Recent Searches + Trending Suggestions */}
      {!hasQuery && (
        <div className="space-y-8">
          {recentSearches.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Clock className="h-4 w-4 text-cyan-300" />
                  Recent Searches
                </h3>
                <button
                  type="button"
                  onClick={onClearRecent}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onSelectSuggestion(term)}
                    className="glass-chip rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Sparkles className="h-4 w-4 text-violet-300" />
              Try Smart Search Prompts
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                'spy movie set in Paris',
                '90s sci-fi thriller',
                'martial arts series',
                'korean mystery thriller',
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onSelectSuggestion(prompt)}
                  className="glass-chip rounded-xl px-3.5 py-2 text-xs text-cyan-200 hover:border-cyan-400/50"
                >
                  “{prompt}”
                </button>
              ))}
            </div>
          </section>

          {trendingSuggestions.length > 0 && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <TrendingUp className="h-4 w-4 text-cyan-300" />
                Trending Right Now
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {trendingSuggestions.map((item) => renderResultCard(item, 'search-trend'))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Active Search Results */}
      {hasQuery && (
        <div className="space-y-8">
          {error && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/15 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Smart Search Results */}
              {filteredSmart.length > 0 && (
                <section className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    <h3 className="font-display text-lg font-bold text-white">
                      Smart Discovery Matches
                    </h3>
                    {smartSummary && (
                      <span className="text-xs text-cyan-200/80">
                        ({smartSummary})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSmart.map((item) => renderResultCard(item, 'smart'))}
                  </div>
                </section>
              )}

              {/* People (Actors / Directors) Known For */}
              {tab === 'all' && people.length > 0 && (
                <section className="space-y-3">
                  <h3 className="font-display text-lg font-bold text-white">
                    People &amp; Known For
                  </h3>
                  <div className="space-y-4">
                    {people.slice(0, 3).map((person) => (
                      <div
                        key={person.id}
                        className="glass-surface rounded-2xl p-4"
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-800">
                            {getProfileUrl(person.profile_path) ? (
                              <img
                                src={getProfileUrl(person.profile_path)!}
                                alt={person.name}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{person.name}</h4>
                            <p className="text-xs text-slate-400">
                              {person.known_for_department}
                            </p>
                          </div>
                        </div>

                        {person.known_for.length > 0 && (
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {person.known_for.map((kf) =>
                              renderResultCard(kf, `person-${person.id}`)
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Movies Section */}
              {(tab === 'all' || tab === 'movie') && filteredMovies.length > 0 && (
                <section className="space-y-3">
                  <h3 className="font-display text-lg font-bold text-white">
                    Movies ({filteredMovies.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredMovies.map((item) => renderResultCard(item, 'search-m'))}
                  </div>
                </section>
              )}

              {/* Web Series Section */}
              {(tab === 'all' || tab === 'tv') && filteredSeries.length > 0 && (
                <section className="space-y-3">
                  <h3 className="font-display text-lg font-bold text-white">
                    Web Series ({filteredSeries.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSeries.map((item) => renderResultCard(item, 'search-tv'))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {debouncedQuery.trim() && totalVisible === 0 && (
                <div className="glass-surface flex flex-col items-center justify-center rounded-3xl px-6 py-16 text-center">
                  <Search className="mb-3 h-8 w-8 text-slate-400" />
                  <p className="text-base font-semibold text-white">
                    No results for “{debouncedQuery}”
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Try checking spelling, clearing result filters, or describing a genre and setting like “spy movie set in Paris”.
                  </p>
                </div>
              )}

              {/* Load More */}
              {hasMore && (filteredMovies.length > 0 || filteredSeries.length > 0) && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className="glass-chip rounded-xl px-6 py-2.5 text-sm font-semibold text-white hover:border-cyan-400/50 disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading more...' : 'Load More Results'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

interface SearchBarInputProps {
  query: string;
  onChange: (val: string) => void;
  onFocus: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const SearchBar: React.FC<SearchBarInputProps> = ({
  query,
  onChange,
  onFocus,
  inputRef,
}) => {
  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder="Search movies, series, actors, or 'spy movie set in Paris'..."
        aria-label="Search movies, web series, and people"
        className="w-full rounded-2xl border border-white/15 bg-white/10 py-2 pr-16 pl-10 text-sm text-white placeholder-slate-400 backdrop-blur-xl transition-all focus:border-cyan-400/70 focus:bg-white/15 focus:outline-none"
      />
      <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1.5">
        {query ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-slate-200 hover:bg-white/25 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="font-mono-num hidden rounded-md border border-white/15 bg-black/40 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline-block">
            /
          </kbd>
        )}
      </div>
    </div>
  );
};
