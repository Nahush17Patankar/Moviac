export type MediaType = 'movie' | 'tv';
export type ContentFilter = 'all' | 'movie' | 'tv';
export type EraFilter = 'all' | 'new' | 'modern' | 'classic';

export type GenreChipId =
  | 'comedy'
  | 'action'
  | 'martial-arts'
  | 'sci-fi'
  | 'mystery'
  | 'spy-thriller'
  | 'thriller'
  | 'crime'
  | 'adventure'
  | 'horror'
  | 'drama'
  | 'romance'
  | 'animation';

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbMediaItem {
  id: number;
  media_type: MediaType;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  year: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
}

export interface TmdbPersonResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: TmdbMediaItem[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TmdbWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface TmdbWatchProviderCountry {
  link?: string;
  flatrate?: TmdbWatchProvider[];
  rent?: TmdbWatchProvider[];
  buy?: TmdbWatchProvider[];
}

export interface TmdbSeasonSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  runtime: number | null;
  still_path: string | null;
  vote_average: number;
}

export interface TmdbNetwork {
  id: number;
  name: string;
  logo_path: string | null;
}

export interface TmdbMediaDetail extends TmdbMediaItem {
  tagline?: string;
  runtime: number | null;
  genres: TmdbGenre[];
  status: string;
  cast: TmdbCastMember[];
  directorsOrCreators: string[];
  trailer: TmdbVideo | null;
  videos: TmdbVideo[];
  watchProvidersIN: TmdbWatchProviderCountry | null;
  recommendations: TmdbMediaItem[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TmdbSeasonSummary[];
  networks?: TmdbNetwork[];
}

export interface WatchlistEntry {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: MediaType;
  vote_average: number;
  year: string;
  genre_ids: number[];
  addedAt: number;
  progress?: {
    season: number;
    episode: number;
  };
}

export interface DiscoverFilters {
  genres: GenreChipId[];
  minRating: number;
  yearFrom: string;
  yearTo: string;
  language: string;
  era: EraFilter;
  page?: number;
  sortBy?: string;
}
