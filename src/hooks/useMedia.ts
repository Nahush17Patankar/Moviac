import { useCallback, useEffect, useState } from 'react';
import {
  discoverByParams,
  getClassics,
  getNewReleases,
  getPersonalizedRecommendations,
  getTopRated,
  getTrending,
  TmdbError,
} from '../services/tmdb';
import { ContentFilter, DiscoverFilters, EraFilter, TmdbMediaItem } from '../types/tmdb';

interface HomeFeedState {
  trendingToday: TmdbMediaItem[];
  trendingWeek: TmdbMediaItem[];
  newReleases: TmdbMediaItem[];
  topRated: TmdbMediaItem[];
  classics: TmdbMediaItem[];
  recommended: TmdbMediaItem[];
}

const EMPTY_FEED: HomeFeedState = {
  trendingToday: [],
  trendingWeek: [],
  newReleases: [],
  topRated: [],
  classics: [],
  recommended: [],
};

export function useMedia(
  hasApiKey: boolean,
  contentType: ContentFilter,
  era: EraFilter,
  filters: DiscoverFilters,
  topGenreIds: number[],
  watchlistSeeds: Array<{ id: number; media_type: 'movie' | 'tv' }>
) {
  const [feed, setFeed] = useState<HomeFeedState>(EMPTY_FEED);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedError, setFeedError] = useState<TmdbError | Error | null>(null);

  const [discoverItems, setDiscoverItems] = useState<TmdbMediaItem[]>([]);
  const [discoverPage, setDiscoverPage] = useState(1);
  const [discoverTotalPages, setDiscoverTotalPages] = useState(1);
  const [loadingDiscover, setLoadingDiscover] = useState(false);
  const [discoverError, setDiscoverError] = useState<TmdbError | Error | null>(null);

  const hasActiveDiscoverFilters =
    filters.genres.length > 0 ||
    filters.minRating > 0 ||
    Boolean(filters.yearFrom) ||
    Boolean(filters.yearTo) ||
    Boolean(filters.language);

  const loadFeed = useCallback(async () => {
    if (!hasApiKey) return;
    setLoadingFeed(true);
    setFeedError(null);
    try {
      const [today, week, releases, rated, classics, recs] = await Promise.all([
        getTrending(contentType, 'day', era),
        getTrending(contentType, 'week', era),
        getNewReleases(contentType, era),
        getTopRated(contentType, era),
        getClassics(contentType),
        getPersonalizedRecommendations(topGenreIds, watchlistSeeds, contentType, era),
      ]);
      setFeed({
        trendingToday: today,
        trendingWeek: week,
        newReleases: releases,
        topRated: rated,
        classics,
        recommended: recs,
      });
    } catch (err) {
      setFeedError(err instanceof Error ? err : new Error('Failed to load TMDB feed.'));
    } finally {
      setLoadingFeed(false);
    }
  }, [hasApiKey, contentType, era, topGenreIds, watchlistSeeds]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Discover grid when genres or advanced filters are active
  useEffect(() => {
    if (!hasApiKey || !hasActiveDiscoverFilters) {
      setDiscoverItems([]);
      setDiscoverPage(1);
      setDiscoverTotalPages(1);
      setDiscoverError(null);
      return;
    }

    const controller = new AbortController();
    setLoadingDiscover(true);
    setDiscoverError(null);

    discoverByParams(contentType, { ...filters, era, page: 1 }, controller.signal)
      .then((res) => {
        setDiscoverItems(res.results);
        setDiscoverPage(1);
        setDiscoverTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setDiscoverError(err instanceof Error ? err : new Error('Failed to filter titles.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDiscover(false);
      });

    return () => controller.abort();
  }, [
    hasApiKey,
    hasActiveDiscoverFilters,
    contentType,
    era,
    filters.genres,
    filters.minRating,
    filters.yearFrom,
    filters.yearTo,
    filters.language,
    filters.sortBy,
  ]);

  const loadMoreDiscover = useCallback(async () => {
    if (!hasApiKey || loadingDiscover || discoverPage >= discoverTotalPages) return;
    const nextPage = discoverPage + 1;
    setLoadingDiscover(true);
    try {
      const res = await discoverByParams(contentType, { ...filters, era, page: nextPage });
      setDiscoverItems((prev) => {
        const seen = new Set(prev.map((i) => `${i.media_type}-${i.id}`));
        const additions = res.results.filter((i) => !seen.has(`${i.media_type}-${i.id}`));
        return [...prev, ...additions];
      });
      setDiscoverPage(nextPage);
      setDiscoverTotalPages(res.totalPages);
    } catch (err) {
      setDiscoverError(err instanceof Error ? err : new Error('Could not load more titles.'));
    } finally {
      setLoadingDiscover(false);
    }
  }, [hasApiKey, loadingDiscover, discoverPage, discoverTotalPages, contentType, filters, era]);

  return {
    feed,
    loadingFeed,
    feedError,
    reloadFeed: loadFeed,
    hasActiveDiscoverFilters,
    discoverItems,
    loadingDiscover,
    discoverError,
    hasMoreDiscover: discoverPage < discoverTotalPages,
    loadMoreDiscover,
  };
}
