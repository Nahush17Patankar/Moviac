import React, { useEffect, useState } from 'react';
import { CheckCircle2, Tv } from 'lucide-react';
import { getPosterUrl, getSeasonEpisodes } from '../services/tmdb';
import { TmdbEpisode, TmdbSeasonSummary } from '../types/tmdb';

interface SeasonListProps {
  tvId: number;
  seasons: TmdbSeasonSummary[];
  inWatchlist: boolean;
  currentProgress?: { season: number; episode: number };
  onUpdateProgress?: (season: number, episode: number) => void;
}

export const SeasonList: React.FC<SeasonListProps> = ({
  tvId,
  seasons,
  inWatchlist,
  currentProgress,
  onUpdateProgress,
}) => {
  const validSeasons = seasons.filter((s) => s.season_number > 0);
  const availableSeasons = validSeasons.length > 0 ? validSeasons : seasons;

  const [selectedSeason, setSelectedSeason] = useState<number>(
    currentProgress?.season || availableSeasons[0]?.season_number || 1
  );
  const [episodes, setEpisodes] = useState<TmdbEpisode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (availableSeasons.length === 0) return;
    const controller = new AbortController();
    setLoading(true);

    getSeasonEpisodes(tvId, selectedSeason, controller.signal)
      .then((eps) => setEpisodes(eps))
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setEpisodes([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [tvId, selectedSeason, availableSeasons.length]);

  if (availableSeasons.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-white">
          Seasons &amp; Episodes
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          {availableSeasons.map((season) => {
            const active = season.season_number === selectedSeason;
            return (
              <button
                key={season.id}
                type="button"
                onClick={() => setSelectedSeason(season.season_number)}
                className={`whitespace-nowrap shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'accent-gradient text-white shadow-md shadow-violet-500/20'
                    : 'glass-chip text-slate-300 hover:text-white'
                }`}
              >
                {season.name || `Season ${season.season_number}`}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : episodes.length === 0 ? (
        <p className="text-sm text-slate-400">
          Episode details are not available for this season yet.
        </p>
      ) : (
        <div className="max-h-80 space-y-2.5 overflow-y-auto pr-1">
          {episodes.map((ep) => {
            const stillUrl = getPosterUrl(ep.still_path, 'w500');
            const isCurrent =
              inWatchlist &&
              currentProgress?.season === selectedSeason &&
              currentProgress?.episode === ep.episode_number;

            return (
              <div
                key={ep.id}
                className={`flex flex-col gap-3 rounded-2xl border p-3 transition-colors sm:flex-row sm:items-center ${
                  isCurrent
                    ? 'border-cyan-400/50 bg-cyan-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-slate-800/80 sm:w-32">
                  {stillUrl ? (
                    <img
                      src={stillUrl}
                      alt={ep.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      <Tv className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="truncate text-sm font-semibold text-white">
                      <span className="font-mono-num mr-2 text-cyan-300">
                        E{String(ep.episode_number).padStart(2, '0')}
                      </span>
                      {ep.name}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      {ep.runtime && (
                        <span className="font-mono-num">{ep.runtime}m</span>
                      )}
                      {inWatchlist && onUpdateProgress && (
                        <button
                          type="button"
                          onClick={() => onUpdateProgress(selectedSeason, ep.episode_number)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                            isCurrent
                              ? 'bg-cyan-400/20 text-cyan-200'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {isCurrent ? 'Watching' : 'Set Progress'}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-300">
                    {ep.overview || 'No episode synopsis available.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
