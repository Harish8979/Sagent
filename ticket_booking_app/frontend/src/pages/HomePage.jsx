import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Filter, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { MovieCarousel } from '../components/MovieCarousel';
import { apiFetch } from '../lib/api';
import { formatCurrency, formatDateTime } from '../lib/formatters';

const GENRE_FILTER_OPTIONS = ['Movies', 'Concerts', 'Stand-up Comedy Show'];
const generatedMovieLogoCache = new Map();
const moviePosterLookupCache = new Map();
const CATALOG_PREVIEW_LOCATIONS = [
  { theaterName: 'PVR Grand Mall', city: 'Chennai' },
  { theaterName: 'INOX City Centre', city: 'Coimbatore' },
  { theaterName: 'AGS Cinemas', city: 'Madurai' },
  { theaterName: 'SPI Palazzo', city: 'Chennai' },
  { theaterName: 'Miraj Cinemas', city: 'Tiruchirappalli' },
];

const CURATED_FEATURED_MOVIES = [
  {
    id: 'curated-dhurandhar-2026',
    title: 'Dhurandhar: The Revenge',
    eventType: 'MOVIE',
    language: 'Hindi',
    rating: 'NEW',
    description: 'A high-stakes action spy thriller set across multiple international locations.',
    releaseDate: '2026-03-19',
    basePrice: 250,
    posterUrl: 'https://picsum.photos/seed/dhurandhar-2026/1200/675',
    bannerUrl: 'https://picsum.photos/seed/dhurandhar-2026-banner/1400/800',
  },
  {
    id: 'recent-tamil-thug-life-2025',
    title: 'Thug Life',
    eventType: 'MOVIE',
    language: 'Tamil',
    rating: 'NEW',
    description: 'Mani Ratnam and Kamal Haasan reunite for a gritty gangster action drama.',
    releaseDate: '2025-06-05',
    basePrice: 260,
    posterUrl: 'https://picsum.photos/seed/thug-life-2025/1200/675',
    bannerUrl: 'https://picsum.photos/seed/thug-life-2025-banner/1400/800',
  },
  {
    id: 'recent-tamil-retro-2025',
    title: 'Retro',
    eventType: 'MOVIE',
    language: 'Tamil',
    rating: 'NEW',
    description: 'Suriya headlines this stylized period action entertainer directed by Karthik Subbaraj.',
    releaseDate: '2025-05-01',
    basePrice: 240,
    posterUrl: 'https://picsum.photos/seed/retro-2025/1200/675',
    bannerUrl: 'https://picsum.photos/seed/retro-2025-banner/1400/800',
  },
  {
    id: 'recent-tamil-tourist-family-2025',
    title: 'Tourist Family',
    eventType: 'MOVIE',
    language: 'Tamil',
    rating: 'NEW',
    description: 'A heartfelt comedy-drama about a Sri Lankan Tamil family rebuilding life in Chennai.',
    releaseDate: '2025-05-01',
    basePrice: 210,
    posterUrl: 'https://picsum.photos/seed/tourist-family-2025/1200/675',
    bannerUrl: 'https://picsum.photos/seed/tourist-family-2025-banner/1400/800',
  },
  {
    id: 'recent-tamil-good-bad-ugly-2025',
    title: 'Good Bad Ugly',
    eventType: 'MOVIE',
    language: 'Tamil',
    rating: 'NEW',
    description: 'Ajith Kumar returns in a mass-action comeback with stylized fan-service energy.',
    releaseDate: '2025-04-10',
    basePrice: 250,
    posterUrl: 'https://picsum.photos/seed/good-bad-ugly-2025/1200/675',
    bannerUrl: 'https://picsum.photos/seed/good-bad-ugly-2025-banner/1400/800',
  },
  {
    id: 'recent-tamil-veera-dheera-sooran-2025',
    title: 'Veera Dheera Sooran: Part 2',
    eventType: 'MOVIE',
    language: 'Tamil',
    rating: 'NEW',
    description: 'Vikram leads this rugged rural action thriller with high-intensity set pieces.',
    releaseDate: '2025-03-27',
    basePrice: 220,
    posterUrl: 'https://picsum.photos/seed/veera-dheera-sooran-2025/1200/675',
    bannerUrl: 'https://picsum.photos/seed/veera-dheera-sooran-2025-banner/1400/800',
  },
  {
    id: 'recent-tamil-dragon-2025',
    title: 'Dragon',
    eventType: 'MOVIE',
    language: 'Tamil',
    rating: 'NEW',
    description: 'A coming-of-age commercial entertainer with a college backdrop and sharp humor.',
    releaseDate: '2025-02-21',
    basePrice: 200,
    posterUrl: 'https://picsum.photos/seed/dragon-2025/1200/675',
    bannerUrl: 'https://picsum.photos/seed/dragon-2025-banner/1400/800',
  },
  {
    id: 'recent-tamil-vidaamuyarchi-2025',
    title: 'Vidaamuyarchi',
    eventType: 'MOVIE',
    language: 'Tamil',
    rating: 'NEW',
    description: 'An Ajith-led action thriller set on a high-stakes rescue mission.',
    releaseDate: '2025-02-06',
    basePrice: 240,
    posterUrl: 'https://picsum.photos/seed/vidaamuyarchi-2025/1200/675',
    bannerUrl: 'https://picsum.photos/seed/vidaamuyarchi-2025-banner/1400/800',
  },
  {
    id: 'recent-tamil-kadhalikka-neramillai-2025',
    title: 'Kadhalikka Neramillai',
    eventType: 'MOVIE',
    language: 'Tamil',
    rating: 'NEW',
    description: 'A breezy romantic comedy led by Ravi Mohan and Nithya Menen.',
    releaseDate: '2025-01-14',
    basePrice: 190,
    posterUrl: 'https://picsum.photos/seed/kadhalikka-neramillai-2025/1200/675',
    bannerUrl: 'https://picsum.photos/seed/kadhalikka-neramillai-2025-banner/1400/800',
  },
];

function normalizeMovieTitle(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function isLikelyStockImage(url) {
  return /images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|loremflickr/i.test(String(url || ''));
}

function buildMovieTitleCandidates(movieTitle) {
  const rawTitle = String(movieTitle || '').trim();
  if (!rawTitle) {
    return [];
  }

  const beforeColon = rawTitle.split(':')[0].trim();
  const beforeDash = rawTitle.split('-')[0].trim();
  const baseTitles = [rawTitle, beforeColon, beforeDash].filter(Boolean);

  const candidates = [];
  for (const title of baseTitles) {
    candidates.push(title);
    candidates.push(`${title} (film)`);
  }
  return [...new Set(candidates)];
}

async function fetchWikipediaMoviePoster(movieTitle, signal) {
  const candidates = buildMovieTitleCandidates(movieTitle);
  for (const candidate of candidates) {
    const formatted = candidate.replace(/\s+/g, '_');
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formatted)}`, {
      method: 'GET',
      signal,
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      continue;
    }

    const payload = await response.json();
    const imageUrl = payload?.originalimage?.source || payload?.thumbnail?.source;
    if (imageUrl) {
      return imageUrl;
    }
  }
  return null;
}

async function fetchItunesMoviePoster(movieTitle, signal) {
  const response = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(movieTitle)}&entity=movie&limit=5`,
    {
      method: 'GET',
      signal,
      headers: {
        Accept: 'application/json',
      },
    },
  );
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const resultWithArtwork = (payload?.results || []).find((item) => item?.artworkUrl100);
  if (!resultWithArtwork?.artworkUrl100) {
    return null;
  }

  return String(resultWithArtwork.artworkUrl100).replace(/\d+x\d+bb/, '1200x1200bb');
}

function shouldLookupMoviePoster(eventType, posterUrl, bannerUrl) {
  if (String(eventType || '').toUpperCase() !== 'MOVIE') {
    return false;
  }
  if (!posterUrl && !bannerUrl) {
    return true;
  }
  return isLikelyStockImage(posterUrl) || isLikelyStockImage(bannerUrl);
}

function resolvePosterByTitle(title, fallbackUrl, moviePosterOverrides) {
  const titleKey = normalizeMovieTitle(title);
  const override = moviePosterOverrides[titleKey];
  return override || fallbackUrl || '';
}

function applyPosterOverridesToFeaturedMovies(featuredMovies, moviePosterOverrides) {
  return featuredMovies.map((movie) => {
    const resolvedPoster = resolvePosterByTitle(movie.title, '', moviePosterOverrides);
    if (!resolvedPoster) {
      return movie;
    }

    const nextPosterUrl = !movie.posterUrl || isLikelyStockImage(movie.posterUrl) ? resolvedPoster : movie.posterUrl;
    const nextBannerUrl = !movie.bannerUrl || isLikelyStockImage(movie.bannerUrl) ? resolvedPoster : movie.bannerUrl;

    if (nextPosterUrl === movie.posterUrl && nextBannerUrl === movie.bannerUrl) {
      return movie;
    }

    return {
      ...movie,
      posterUrl: nextPosterUrl,
      bannerUrl: nextBannerUrl,
    };
  });
}

function mergeFeaturedMovies(featuredMoviesFromApi) {
  const seenTitles = new Set();
  const combinedMovies = [...CURATED_FEATURED_MOVIES, ...featuredMoviesFromApi];

  return combinedMovies
    .map((movie, index) => {
      const title = movie.title || movie.movieTitle;
      const titleKey = normalizeMovieTitle(title);
      if (!titleKey || seenTitles.has(titleKey)) {
        return null;
      }
      seenTitles.add(titleKey);

      const parsedBasePrice = Number(movie.basePrice ?? movie.price);
      return {
        id: movie.id || `featured-${titleKey.replace(/\s+/g, '-')}-${index}`,
        title,
        eventType: movie.eventType || 'MOVIE',
        language: movie.language || movie.movieLanguage || 'Tamil',
        rating: movie.rating == null || movie.rating === '' ? 'NEW' : movie.rating,
        description: movie.description || 'Recently released Tamil movie.',
        releaseDate: movie.releaseDate || movie.startTime || '2025-01-01',
        basePrice: Number.isFinite(parsedBasePrice) ? parsedBasePrice : 220,
        bannerUrl: movie.bannerUrl || movie.posterUrl || '',
        posterUrl: movie.posterUrl || movie.bannerUrl || '',
        logoUrl: movie.logoUrl || '',
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
}

function toIsoDateTime(value) {
  return value.toISOString().slice(0, 19);
}

function escapeSvgText(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildGeneratedMovieLogo(title) {
  const normalizedTitle = String(title || '').trim();
  if (!normalizedTitle) {
    return '';
  }

  const cacheKey = normalizeMovieTitle(normalizedTitle);
  const cached = generatedMovieLogoCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const safeTitle = escapeSvgText(normalizedTitle.length > 24 ? `${normalizedTitle.slice(0, 24)}...` : normalizedTitle);
  const fontSize = normalizedTitle.length > 18 ? 34 : 42;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="160" viewBox="0 0 520 160"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs><rect width="520" height="160" rx="28" fill="url(#g)"/><rect x="8" y="8" width="504" height="144" rx="22" fill="none" stroke="rgba(250,204,21,0.35)" stroke-width="2"/><text x="260" y="94" text-anchor="middle" fill="#f8fafc" font-family="Poppins, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="1">${safeTitle}</text></svg>`;
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  generatedMovieLogoCache.set(cacheKey, dataUri);
  return dataUri;
}

function resolveShowtimeLogoUrl(showtime) {
  return showtime.logoUrl || showtime.movieLogoUrl || buildGeneratedMovieLogo(showtime.movieTitle);
}

function buildCatalogPreviewShowtimes(featuredMovies) {
  const now = new Date();

  return featuredMovies.map((movie, index) => {
    const startTime = new Date(now);
    startTime.setDate(now.getDate() + index + 1);
    startTime.setHours(18 + (index % 3), 30, 0, 0);

    const venue = CATALOG_PREVIEW_LOCATIONS[index % CATALOG_PREVIEW_LOCATIONS.length];
    const parsedPrice = Number(movie.basePrice ?? movie.price);
    const price = Number.isFinite(parsedPrice) ? parsedPrice : 220;
    const showtimeId = `catalog-${movie.id || normalizeMovieTitle(movie.title || `movie-${index}`)}`;

    return {
      showtimeId,
      movieTitle: movie.title,
      eventType: movie.eventType || 'MOVIE',
      theaterName: venue.theaterName,
      city: venue.city,
      startTime: toIsoDateTime(startTime),
      showFormat: '2D',
      language: movie.language || 'Tamil',
      movieLanguage: movie.language || 'Tamil',
      price,
      posterUrl: movie.posterUrl || movie.bannerUrl,
      logoUrl: movie.logoUrl || '',
      movieLogoUrl: movie.logoUrl || '',
      catalogOnly: true,
    };
  });
}

function mergeUpcomingShowtimes(apiShowtimes, catalogShowtimes) {
  const seenTitles = new Set();

  return [...apiShowtimes, ...catalogShowtimes]
    .filter((showtime) => {
      const titleKey = normalizeMovieTitle(showtime.movieTitle);
      if (!titleKey || seenTitles.has(titleKey)) {
        return false;
      }
      seenTitles.add(titleKey);
      return true;
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

function resolveGenreCategory(eventType) {
  const normalizedEventType = String(eventType || '').toUpperCase();
  if (normalizedEventType === 'MOVIE') {
    return 'Movies';
  }
  if (normalizedEventType === 'CONCERT') {
    return 'Concerts';
  }
  return 'Stand-up Comedy Show';
}

export function HomePage() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [moviePosterOverrides, setMoviePosterOverrides] = useState({});
  const deferredSearch = useDeferredValue(searchValue);

  const homeQuery = useQuery({
    queryKey: ['discovery-home'],
    queryFn: ({ signal }) => apiFetch('/api/discovery/home', { signal }),
  });

  const featuredMovies = useMemo(
    () => mergeFeaturedMovies(homeQuery.data?.featuredMovies || []),
    [homeQuery.data?.featuredMovies],
  );

  const upcomingShowtimes = useMemo(() => {
    if (homeQuery.error) {
      return buildCatalogPreviewShowtimes(featuredMovies);
    }
    return mergeUpcomingShowtimes(homeQuery.data?.upcomingShowtimes || [], []);
  }, [featuredMovies, homeQuery.data?.upcomingShowtimes, homeQuery.error]);

  const featuredMoviesWithResolvedPosters = useMemo(
    () => applyPosterOverridesToFeaturedMovies(featuredMovies, moviePosterOverrides),
    [featuredMovies, moviePosterOverrides],
  );

  useEffect(() => {
    const lookupTargets = [];
    const seen = new Set();

    const registerMovieTarget = (title, eventType, posterUrl, bannerUrl) => {
      const titleKey = normalizeMovieTitle(title);
      if (!titleKey || seen.has(titleKey)) {
        return;
      }
      seen.add(titleKey);

      if (!shouldLookupMoviePoster(eventType, posterUrl, bannerUrl)) {
        return;
      }

      lookupTargets.push({
        title,
        titleKey,
      });
    };

    featuredMovies.forEach((movie) => {
      registerMovieTarget(movie.title, movie.eventType, movie.posterUrl, movie.bannerUrl);
    });

    upcomingShowtimes.forEach((showtime) => {
      registerMovieTarget(
        showtime.movieTitle,
        showtime.eventType,
        showtime.posterUrl,
        showtime.movieBannerUrl || showtime.moviePosterUrl || '',
      );
    });

    if (!lookupTargets.length) {
      return;
    }

    const cachedOverrides = {};
    for (const target of lookupTargets) {
      const cachedPoster = moviePosterLookupCache.get(target.titleKey);
      if (cachedPoster) {
        cachedOverrides[target.titleKey] = cachedPoster;
      }
    }

    if (Object.keys(cachedOverrides).length) {
      setMoviePosterOverrides((current) => ({ ...current, ...cachedOverrides }));
    }

    const pendingTargets = lookupTargets.filter((target) => !moviePosterLookupCache.has(target.titleKey));
    if (!pendingTargets.length) {
      return;
    }

    const abortController = new AbortController();
    let active = true;

    const resolvePosters = async () => {
      for (const target of pendingTargets) {
        if (!active) {
          break;
        }

        let resolvedPoster = null;
        try {
          resolvedPoster = await fetchWikipediaMoviePoster(target.title, abortController.signal);
        } catch {
          resolvedPoster = null;
        }

        if (!resolvedPoster) {
          try {
            resolvedPoster = await fetchItunesMoviePoster(target.title, abortController.signal);
          } catch {
            resolvedPoster = null;
          }
        }

        if (!resolvedPoster) {
          continue;
        }

        moviePosterLookupCache.set(target.titleKey, resolvedPoster);
        if (!active) {
          break;
        }

        setMoviePosterOverrides((current) => {
          if (current[target.titleKey] === resolvedPoster) {
            return current;
          }
          return {
            ...current,
            [target.titleKey]: resolvedPoster,
          };
        });
      }
    };

    resolvePosters();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [featuredMovies, upcomingShowtimes]);

  const highlightShowtime = upcomingShowtimes.find((showtime) => !showtime.catalogOnly) || upcomingShowtimes[0];

  const dynamicLanguages = upcomingShowtimes.map((st) => st.language || st.movieLanguage).filter(Boolean);
  const dynamicCities = upcomingShowtimes.map((st) => st.city).filter(Boolean);
  const availableLanguages = Array.from(new Set(['Tamil', 'Hindi', 'English', ...dynamicLanguages]));
  const availableCities = Array.from(new Set([...(homeQuery.data?.availableCities || []), ...dynamicCities]));

  const filteredShowtimes = upcomingShowtimes.filter((showtime) => {
    const matchesSearch =
      !deferredSearch ||
      showtime.movieTitle.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      showtime.theaterName.toLowerCase().includes(deferredSearch.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || resolveGenreCategory(showtime.eventType) === selectedGenre;
    const matchesCity = selectedCity === 'All' || showtime.city === selectedCity;
    
    const showtimeLang = showtime.language || showtime.movieLanguage || 'English';
    const matchesLanguage = selectedLanguage === 'All' || showtimeLang.toLowerCase() === selectedLanguage.toLowerCase();
    
    return matchesSearch && matchesGenre && matchesCity && matchesLanguage;
  });

  return (
    <>
      <MovieCarousel featuredMovies={featuredMoviesWithResolvedPosters} highlightShowtime={highlightShowtime} />

      <section className="section-shell pb-16 pt-6">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200/70">Discovery Board</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">Upcoming Indian films and live events</h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              Filter by city and genre, then jump into the live seat map for instant seat sync across a richer India-focused sample lineup.
            </p>
          </div>

          <div className="glass-card flex flex-wrap items-center gap-3 p-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Sparkles className="h-4 w-4 text-amber-300" />
              {filteredShowtimes.length} listings
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="h-4 w-4 text-sky-300" />
              {availableCities.length} cities
            </div>
          </div>
        </div>

      <div className="glass-card mb-8 grid gap-4 p-4 md:grid-cols-[1.5fr,1fr,1fr,1fr]">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <Filter className="h-4 w-4" />
              Search
            </span>
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-amber-300/70 focus:bg-white/10 focus:ring-2 focus:ring-amber-300/20"
              placeholder="Search by title or venue"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-400">Genre</span>
            <select
              value={selectedGenre}
              onChange={(event) => setSelectedGenre(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/20"
            >
              <option value="All">All genres</option>
              {GENRE_FILTER_OPTIONS.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-400">City</span>
            <select
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/20"
            >
              <option value="All">All cities</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-400">Language</span>
          <select
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/20"
          >
            <option value="All">All languages</option>
            {availableLanguages.map((language) => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </label>
        </div>

        {homeQuery.error ? (
          <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
            Live API data is currently unavailable, so you&apos;re seeing catalog previews (including Dhurandhar and Tamil films).
          </div>
        ) : null}

        {homeQuery.isLoading ? (
          <div className="glass-card p-8 text-center text-slate-300">Loading upcoming shows...</div>
        ) : filteredShowtimes.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredShowtimes.map((showtime) => {
              const resolvedLogoUrl = resolveShowtimeLogoUrl(showtime);
              const resolvedPosterUrl = shouldLookupMoviePoster(
                showtime.eventType,
                showtime.posterUrl,
                showtime.movieBannerUrl || showtime.moviePosterUrl || '',
              )
                ? resolvePosterByTitle(showtime.movieTitle, showtime.posterUrl, moviePosterOverrides)
                : showtime.posterUrl;

              return (
            <article key={showtime.showtimeId} className="group glass-card overflow-hidden border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-black/40">
                <div className="grid gap-4 p-5 sm:grid-cols-[120px,1fr]">
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={resolvedPosterUrl}
                    alt={showtime.movieTitle}
                    className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {resolvedLogoUrl ? (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-2">
                      <img src={resolvedLogoUrl} alt={`${showtime.movieTitle} Logo`} className="mx-auto h-10 object-contain drop-shadow-md" />
                    </div>
                  ) : null}
                </div>
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">{resolveGenreCategory(showtime.eventType)}</p>
                        <h3 className="mt-2 font-display text-2xl font-bold text-white">{showtime.movieTitle}</h3>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                        {showtime.showFormat}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-300">
                      <p>{showtime.theaterName}</p>
                      <p>{showtime.city}</p>
                      <p>{formatDateTime(showtime.startTime)}</p>
                <p className="text-amber-200/80">{showtime.language || showtime.movieLanguage || 'English'}</p>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-lg font-semibold text-white">{formatCurrency(showtime.price)}</p>
                      {showtime.catalogOnly ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-medium text-amber-100">
                          Catalog preview
                        </span>
                      ) : (
                        <Link
                          to={`/showtimes/${showtime.showtimeId}`}
                          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                        >
                          View seats
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-10 text-center">
            <p className="font-display text-2xl font-semibold text-white">No showtimes match these filters.</p>
            <p className="mt-2 text-slate-400">Try clearing one of the filters to see more upcoming releases.</p>
          </div>
        )}
      </section>
    </>
  );
}
