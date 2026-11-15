import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  ChevronDown,
  Dices,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { GENRE_CHIPS } from '../services/tmdb';
import { DiscoverFilters, GenreChipId } from '../types/tmdb';

interface GenreBarProps {
  filters: DiscoverFilters;
  onToggleGenre: (genreId: GenreChipId) => void;
  onUpdateFilters: (partial: Partial<DiscoverFilters>) => void;
  onResetFilters: () => void;
  onSurpriseMe: () => void;
  surprising?: boolean;
}

const LANGUAGES = [
  { code: '', label: 'All Languages' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ko', label: 'Korean' },
  { code: 'ja', label: 'Japanese' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
];

export const GenreBar: React.FC<GenreBarProps> = ({
  filters,
  onToggleGenre,
  onUpdateFilters,
  onResetFilters,
  onSurpriseMe,
  surprising = false,
}) => {
  const [showGenres, setShowGenres] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    filters.genres.length > 0 ||
    filters.minRating > 0 ||
    Boolean(filters.yearFrom) ||
    Boolean(filters.yearTo) ||
    Boolean(filters.language);

  const activeGenreObjects = filters.genres
    .map((id) => GENRE_CHIPS.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <section aria-label="Genre and filters" className="space-y-3">
      {/* Compact Single-Row Action Bar (Uncluttered on Mobile & Desktop) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowGenres((v) => !v);
              if (showAdvanced) setShowAdvanced(false);
            }}
            aria-expanded={showGenres}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              showGenres || filters.genres.length > 0
                ? 'accent-gradient border border-white/25 text-white shadow-md shadow-violet-500/25'
                : 'glass-chip text-slate-200 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>
              Genre
              {filters.genres.length > 0 ? ` (${filters.genres.length})` : ''}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                showGenres ? 'rotate-180' : ''
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAdvanced((v) => !v);
              if (showGenres) setShowGenres(false);
            }}
            aria-expanded={showAdvanced}
            className={`glass-chip inline-flex min-h-[40px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              showAdvanced ||
              filters.minRating > 0 ||
              filters.yearFrom ||
              filters.yearTo ||
              filters.language
                ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
                : 'text-slate-200'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onSurpriseMe}
            disabled={surprising}
            className="accent-gradient inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <Dices className="h-3.5 w-3.5" />
            {surprising ? 'Picking...' : 'Surprise Me'}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                onResetFilters();
                setShowGenres(false);
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Compact Active Genre Summary (Only shown when genres are selected and picker is closed) */}
      {!showGenres && activeGenreObjects.length > 0 && (
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5">
          {activeGenreObjects.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onToggleGenre(chip.id)}
              className="glass-chip inline-flex items-center gap-1.5 rounded-xl border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-100 whitespace-nowrap shrink-0 hover:bg-cyan-500/25"
            >
              <span>{chip.label}</span>
              <X className="h-3 w-3 text-cyan-200" />
            </button>
          ))}
        </div>
      )}

      {/* Expandable Genre Selector Panel */}
      <AnimatePresence>
        {showGenres && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="glass-panel rounded-2xl p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-200">
                Select one or more genres to filter results
              </p>
              <button
                type="button"
                onClick={() => setShowGenres(false)}
                className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/20"
              >
                Done
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {GENRE_CHIPS.map((chip) => {
                const active = filters.genres.includes(chip.id);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => onToggleGenre(chip.id)}
                    aria-pressed={active}
                    className={`inline-flex min-h-[42px] items-center justify-between gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-150 sm:min-h-[36px] sm:justify-center ${
                      active
                        ? 'accent-gradient border border-white/25 text-white shadow-md shadow-violet-500/25'
                        : 'glass-chip text-slate-200 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{chip.label}</span>
                    {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="glass-surface grid grid-cols-1 gap-4 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div>
              <label
                htmlFor="min-rating"
                className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-300"
              >
                <span>Minimum Rating</span>
                <span className="font-mono-num text-cyan-300">
                  {filters.minRating > 0 ? `${filters.minRating.toFixed(1)}+` : 'Any'}
                </span>
              </label>
              <input
                id="min-rating"
                type="range"
                min="0"
                max="9"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => onUpdateFilters({ minRating: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <label htmlFor="year-from" className="mb-1.5 block text-xs font-medium text-slate-300">
                From Year
              </label>
              <input
                id="year-from"
                type="number"
                min="1920"
                max={new Date().getFullYear()}
                placeholder="e.g. 1995"
                value={filters.yearFrom}
                onChange={(e) => onUpdateFilters({ yearFrom: e.target.value })}
                className="font-mono-num w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400/60 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="year-to" className="mb-1.5 block text-xs font-medium text-slate-300">
                To Year
              </label>
              <input
                id="year-to"
                type="number"
                min="1920"
                max={new Date().getFullYear()}
                placeholder="e.g. 2026"
                value={filters.yearTo}
                onChange={(e) => onUpdateFilters({ yearTo: e.target.value })}
                className="font-mono-num w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400/60 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="lang-select" className="mb-1.5 block text-xs font-medium text-slate-300">
                Original Language
              </label>
              <select
                id="lang-select"
                value={filters.language}
                onChange={(e) => onUpdateFilters({ language: e.target.value })}
                className="w-full rounded-xl border border-white/15 bg-slate-900/90 px-3 py-2 text-xs text-white focus:border-cyan-400/60 focus:outline-none"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
