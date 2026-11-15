import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bookmark,
  Check,
  Clock,
  Film,
  Play,
  Star,
  Tv,
  User,
  X,
} from 'lucide-react';
import {
  getBackdropUrl,
  getMediaDetail,
  getPosterUrl,
  getProfileUrl,
  getProviderLogoUrl,
} from '../services/tmdb';
import { MediaType, TmdbMediaDetail, TmdbMediaItem } from '../types/tmdb';
import { PosterCard } from './PosterCard';
import { SeasonList } from './SeasonList';

interface DetailModalProps {
  item: TmdbMediaItem;
  layoutKey: string;
  onClose: () => void;
  onSelectSimilar: (item: TmdbMediaItem, layoutKey: string) => void;
  isInWatchlist: (id: number, type: MediaType) => boolean;
  isWatched: (id: number, type: MediaType) => boolean;
  onToggleWatchlist: (item: TmdbMediaItem) => void;
  onToggleWatched: (item: TmdbMediaItem) => void;
  getSeriesProgress: (id: number) => { season: number; episode: number } | undefined;
  onUpdateSeriesProgress: (id: number, season: number, episode: number) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  layoutKey,
  onClose,
  onSelectSimilar,
  isInWatchlist,
  isWatched,
  onToggleWatchlist,
  onToggleWatched,
  getSeriesProgress,
  onUpdateSeriesProgress,
}) => {
  const [detail, setDetail] = useState<TmdbMediaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setShowTrailer(false);

    getMediaDetail(item.id, item.media_type, controller.signal)
      .then((res) => setDetail(res))
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load title details.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [item.id, item.media_type]);

  const activeData = detail || item;
  const posterUrl = getPosterUrl(activeData.poster_path, 'w780');
  const backdropUrl = getBackdropUrl(activeData.backdrop_path, 'w1280');

  const inWl = isInWatchlist(activeData.id, activeData.media_type);
  const watched = isWatched(activeData.id, activeData.media_type);
  const progress =
    activeData.media_type === 'tv' ? getSeriesProgress(activeData.id) : undefined;

  const formatRuntime = (mins: number | null) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const providersIN = detail?.watchProvidersIN;
  const hasAnyProviderIN =
    providersIN &&
    ((providersIN.flatrate && providersIN.flatrate.length > 0) ||
      (providersIN.rent && providersIN.rent.length > 0) ||
      (providersIN.buy && providersIN.buy.length > 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-2 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={activeData.title}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl text-slate-100"
      >
        {/* Blurred Backdrop Header */}
        <div className="relative overflow-hidden">
          {backdropUrl && (
            <div className="pointer-events-none absolute inset-0">
              <img
                src={backdropUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full scale-105 object-cover opacity-30 blur-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/75 to-[#0b0e19]" />
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-slate-200 backdrop-blur-md transition-colors hover:bg-black/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative z-10 flex flex-col gap-6 p-5 sm:flex-row sm:p-8">
            {/* Shared-element poster */}
            <motion.div
              layoutId={layoutKey}
              className="mx-auto aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-slate-900 shadow-2xl sm:mx-0 sm:w-64"
            >
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={activeData.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800">
                  {activeData.media_type === 'movie' ? (
                    <Film className="h-12 w-12 text-slate-500" />
                  ) : (
                    <Tv className="h-12 w-12 text-slate-500" />
                  )}
                </div>
              )}
            </motion.div>

            {/* Primary Info */}
            <div className="flex flex-1 flex-col justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span
                    className={`rounded-lg border px-2.5 py-0.5 font-semibold ${
                      activeData.media_type === 'movie'
                        ? 'border-violet-400/40 bg-violet-500/20 text-violet-200'
                        : 'border-cyan-400/40 bg-cyan-500/20 text-cyan-200'
                    }`}
                  >
                    {activeData.media_type === 'movie' ? 'Movie' : 'Web Series'}
                  </span>
                  <span className="font-mono-num text-slate-300">{activeData.year}</span>
                  {detail?.runtime && (
                    <>
                      <span className="text-slate-500" aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {formatRuntime(detail.runtime)}
                        {activeData.media_type === 'tv' ? '/ep' : ''}
                      </span>
                    </>
                  )}
                  {activeData.vote_average > 0 && (
                    <>
                      <span className="text-slate-500" aria-hidden="true">·</span>
                      <span className="font-mono-num inline-flex items-center gap-1 font-semibold text-amber-300">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {activeData.vote_average.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>

                <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
                  {activeData.title}
                </h2>
                {detail?.tagline && (
                  <p className="mt-1 text-sm italic text-cyan-200/80">
                    “{detail.tagline}”
                  </p>
                )}

                {detail && detail.genres.length > 0 && (
                  <p className="mt-2.5 text-xs text-slate-300">
                    {detail.genres.map((g) => g.name).join(' · ')}
                  </p>
                )}

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200">
                  {activeData.overview || 'No synopsis available for this title.'}
                </p>

                {detail && (
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300">
                    {detail.directorsOrCreators.length > 0 && (
                      <div>
                        <span className="text-slate-400">
                          {activeData.media_type === 'movie' ? 'Director: ' : 'Creator: '}
                        </span>
                        <span className="font-medium text-white">
                          {detail.directorsOrCreators.join(', ')}
                        </span>
                      </div>
                    )}

                    {activeData.media_type === 'tv' && (
                      <>
                        {detail.number_of_seasons !== undefined && (
                          <div>
                            <span className="text-slate-400">Seasons: </span>
                            <span className="font-mono-num font-medium text-white">
                              {detail.number_of_seasons} ({detail.number_of_episodes ?? 0} eps)
                            </span>
                          </div>
                        )}
                        {detail.status && (
                          <div>
                            <span className="text-slate-400">Status: </span>
                            <span className="font-medium text-white">{detail.status}</span>
                          </div>
                        )}
                        {detail.networks && detail.networks.length > 0 && (
                          <div>
                            <span className="text-slate-400">Network: </span>
                            <span className="font-medium text-white">
                              {detail.networks.map((n) => n.name).join(', ')}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {detail?.trailer && (
                  <button
                    type="button"
                    onClick={() => setShowTrailer((v) => !v)}
                    className="accent-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:brightness-110"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {showTrailer ? 'Hide Trailer' : 'Watch Trailer'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onToggleWatchlist(activeData)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                    inWl
                      ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-200'
                      : 'border-white/15 bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${inWl ? 'fill-current' : ''}`} />
                  {inWl ? 'In Watchlist' : '+ Watchlist'}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWatched(activeData)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                    watched
                      ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                      : 'border-white/15 bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  {watched ? 'Watched' : 'Mark as Watched'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body Sections */}
        <div className="space-y-8 bg-[#0b0e19] p-5 sm:p-8">
          {error && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}

          {/* Embedded YouTube Trailer */}
          {showTrailer && detail?.trailer && (
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-black">
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${detail.trailer.key}?autoplay=1`}
                  title={detail.trailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          )}

          {loading && !detail && (
            <div className="space-y-4">
              <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
            </div>
          )}

          {/* Top 5 Cast */}
          {detail && detail.cast.length > 0 && (
            <div>
              <h3 className="font-display mb-3 text-lg font-semibold text-white">
                Top Cast
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {detail.cast.map((actor) => {
                  const photoUrl = getProfileUrl(actor.profile_path);
                  return (
                    <div
                      key={actor.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-800">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={actor.name}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-500">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white">
                          {actor.name}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                          {actor.character}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Where to Watch (India IN) */}
          {detail && (
            <div>
              <h3 className="font-display mb-3 text-lg font-semibold text-white">
                Where to Watch (India)
              </h3>
              {hasAnyProviderIN ? (
                <div className="flex flex-wrap gap-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  {providersIN?.flatrate && providersIN.flatrate.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-400">Stream</p>
                      <div className="flex flex-wrap gap-2.5">
                        {providersIN.flatrate.map((p) => (
                          <div
                            key={`stream-${p.provider_id}`}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-2.5 py-1.5"
                          >
                            {getProviderLogoUrl(p.logo_path) && (
                              <img
                                src={getProviderLogoUrl(p.logo_path)!}
                                alt={p.provider_name}
                                referrerPolicy="no-referrer"
                                className="h-6 w-6 rounded-md object-cover"
                              />
                            )}
                            <span className="text-xs font-medium text-slate-200">
                              {p.provider_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {providersIN?.rent && providersIN.rent.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-400">Rent</p>
                      <div className="flex flex-wrap gap-2.5">
                        {providersIN.rent.map((p) => (
                          <div
                            key={`rent-${p.provider_id}`}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-2.5 py-1.5"
                          >
                            {getProviderLogoUrl(p.logo_path) && (
                              <img
                                src={getProviderLogoUrl(p.logo_path)!}
                                alt={p.provider_name}
                                referrerPolicy="no-referrer"
                                className="h-6 w-6 rounded-md object-cover"
                              />
                            )}
                            <span className="text-xs font-medium text-slate-200">
                              {p.provider_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {providersIN?.buy && providersIN.buy.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-400">Buy</p>
                      <div className="flex flex-wrap gap-2.5">
                        {providersIN.buy.map((p) => (
                          <div
                            key={`buy-${p.provider_id}`}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-2.5 py-1.5"
                          >
                            {getProviderLogoUrl(p.logo_path) && (
                              <img
                                src={getProviderLogoUrl(p.logo_path)!}
                                alt={p.provider_name}
                                referrerPolicy="no-referrer"
                                className="h-6 w-6 rounded-md object-cover"
                              />
                            )}
                            <span className="text-xs font-medium text-slate-200">
                              {p.provider_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
                  No streaming, rent, or buy providers listed for India (IN) right now.
                </p>
              )}
            </div>
          )}

          {/* Web Series Season & Episode List */}
          {detail && detail.media_type === 'tv' && detail.seasons && detail.seasons.length > 0 && (
            <SeasonList
              tvId={detail.id}
              seasons={detail.seasons}
              inWatchlist={inWl}
              currentProgress={progress}
              onUpdateProgress={(s, e) => onUpdateSeriesProgress(detail.id, s, e)}
            />
          )}

          {/* Similar Titles */}
          {detail && detail.recommendations.length > 0 && (
            <div>
              <h3 className="font-display mb-3 text-lg font-semibold text-white">
                Similar Titles
              </h3>
              <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
                {detail.recommendations.map((rec, idx) => (
                  <PosterCard
                    key={`sim-${rec.media_type}-${rec.id}`}
                    item={rec}
                    index={idx}
                    compact
                    layoutPrefix={`similar-${detail.id}`}
                    inWatchlist={isInWatchlist(rec.id, rec.media_type)}
                    isWatched={isWatched(rec.id, rec.media_type)}
                    onToggleWatchlist={onToggleWatchlist}
                    onSelect={onSelectSimilar}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
