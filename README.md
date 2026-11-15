# Moviac

A personal movie and web series discovery, smart search, and dual watchlist web app powered by the TMDB API v3. Everything runs directly in your browser with zero login or backend required.

## Features

- **Unified Movies & Web Series Discovery**: Switch between `All`, `Movies`, and `Web Series`, plus era filters (`New`, `Modern`, `Classic` before 2005).
- **Editorial Home Shelves**: Trending Today, Recommended For You (based on your genre choices and watchlists), Trending This Week, New Releases, Top Rated, and Classics / Old Gems.
- **Genre & Keyword Discovery**: Multi-select genre bar (including `Spy Thriller` and `Fight/Martial Arts` combining TMDB genres with `/search/keyword`), minimum rating slider, release year range, language filter, and **Surprise Me** randomizer.
- **Instant & Smart Search**: Fixed glass search bar (`/` or `Ctrl+K` shortcut) using `/search/multi`, 400ms debounce, stale-request cancellation, actor/director Known For cards, recent search history, and descriptive **Smart Search** (e.g., `"spy movie set in Paris"`).
- **Rich Detail Modal**: Shared-element poster expansion, `w1280` blurred backdrop, synopsis, top 5 cast, director/creator, embedded YouTube trailer, **Where to Watch** providers for India (`IN`), full season & episode browser for series, and Similar Titles.
- **Separate Movie & Series Watchlists**: Saved under `watchlist_movies`, `watchlist_series`, `watched_movies`, and `watched_series` in `localStorage`, with `To Watch` / `Watched` sections, sorting, series episode progress (`Currently watching: Season X, Episode Y`), and JSON export/import.

## How to Get a Free TMDB API Key

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup).
2. Go to **Settings → API** ([themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)).
3. Click **Create** under Request an API Key, choose **Developer**, and accept the terms.
4. Copy your **API Key (v3 auth)** (or Read Access Token).

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. *(Optional)* Add your key to `.env` as `VITE_TMDB_API_KEY`, or simply paste it into the first-run Moviac setup screen (saved in `localStorage`).
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Install on Your Mobile Phone (PWA)

Moviac is a full Progressive Web App (`manifest`, offline service worker, and home-screen icons):

- **Android (Chrome / Edge)**: Open the app URL in Chrome on your phone and tap the **Install** button in the top bar (or open the browser `⋮` menu → **Install app**).
- **iPhone / iPad (Safari)**: Open the app URL in Safari, tap **Share** → **Add to Home Screen** (or tap **Install** in Moviac's header for step-by-step guidance).

---

*This product uses the TMDB API but is not endorsed or certified by TMDB.*
