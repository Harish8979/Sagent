import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, BadgeIndianRupee, Clapperboard, LockKeyhole, MapPinned } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { SeatGrid } from '../components/SeatGrid';
import { SeatLegend } from '../components/SeatLegend';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { useSeatTopicSubscription } from '../hooks/useSeatTopicSubscription';
import { apiFetch } from '../lib/api';
import { formatCurrency, formatDateTime } from '../lib/formatters';

const MAX_CAST_MEMBERS = 5;
const castImageLookupCache = new Map();
const movieHeroImageLookupCache = new Map();

function normalizeCastName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function getFallbackCastImageUrl(name) {
  return `https://i.pravatar.cc/200?u=${encodeURIComponent(normalizeCastName(name))}`;
}

function normalizeMovieTitle(title) {
  return String(title || '')
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

function buildWikipediaCandidates(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    return [];
  }

  const withoutDots = trimmed.replace(/\./g, '').replace(/\s+/g, ' ').trim();
  const baseCandidates = [trimmed, withoutDots].filter(Boolean);
  return [...new Set(baseCandidates.map((candidate) => candidate.replace(/\s+/g, '_')))];
}

async function fetchWikipediaCastImage(name, signal) {
  const candidates = buildWikipediaCandidates(name);
  for (const candidate of candidates) {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidate)}`, {
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
    const imageUrl = payload?.thumbnail?.source;
    if (imageUrl) {
      return imageUrl;
    }
  }
  return null;
}

function getCastInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) {
    return 'NA';
  }
  return parts.map((part) => part[0].toUpperCase()).join('');
}

function parseCastProfiles(rawCastMembers) {
  if (!rawCastMembers) {
    return [];
  }

  const separator = rawCastMembers.includes('\n') ? /\n+/ : /,+/;
  return rawCastMembers
    .split(separator)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const urlInBracketsMatch = entry.match(/(.+?)\s*\((https?:\/\/[^)]+)\)\s*$/i);
      if (urlInBracketsMatch) {
        const name = urlInBracketsMatch[1].trim();
        const explicitImageUrl = urlInBracketsMatch[2].trim();
        return {
          name: name || 'Cast member',
          imageUrl: explicitImageUrl || null,
        };
      }

      if (entry.includes('|')) {
        const [name, imageUrl] = entry.split('|').map((value) => value.trim());
        return {
          name: name || 'Cast member',
          imageUrl: imageUrl || null,
        };
      }
      if (entry.includes('::')) {
        const [name, imageUrl] = entry.split('::').map((value) => value.trim());
        return {
          name: name || 'Cast member',
          imageUrl: imageUrl || null,
        };
      }
      const fallbackName = entry;
      return {
        name: fallbackName,
        imageUrl: null,
      };
    })
    .slice(0, MAX_CAST_MEMBERS);
}

function CastAvatar({ name, imageUrl }) {
  const [resolvedImageUrl, setResolvedImageUrl] = useState(imageUrl || null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [name, imageUrl]);

  useEffect(() => {
    const explicitImageUrl = imageUrl?.trim();
    if (explicitImageUrl) {
      setResolvedImageUrl(explicitImageUrl);
      return;
    }

    const cacheKey = normalizeCastName(name);
    if (!cacheKey) {
      setResolvedImageUrl(getFallbackCastImageUrl(name));
      return;
    }

    const cachedImageUrl = castImageLookupCache.get(cacheKey);
    if (cachedImageUrl) {
      setResolvedImageUrl(cachedImageUrl);
      return;
    }

    const abortController = new AbortController();
    fetchWikipediaCastImage(name, abortController.signal)
      .then((foundImageUrl) => {
        const finalImageUrl = foundImageUrl || getFallbackCastImageUrl(name);
        castImageLookupCache.set(cacheKey, finalImageUrl);
        setResolvedImageUrl(finalImageUrl);
      })
      .catch(() => {
        const fallbackImageUrl = getFallbackCastImageUrl(name);
        castImageLookupCache.set(cacheKey, fallbackImageUrl);
        setResolvedImageUrl(fallbackImageUrl);
      });

    return () => {
      abortController.abort();
    };
  }, [name, imageUrl]);

  if (!resolvedImageUrl || loadFailed) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-semibold text-white">
        {getCastInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={resolvedImageUrl}
      alt={name}
      className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
      loading="lazy"
      onError={() => setLoadFailed(true)}
    />
  );
}

export function ShowtimePage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { clientSessionId } = useSession();
  const [seats, setSeats] = useState([]);
  const [actionError, setActionError] = useState('');
  const [authHintVisible, setAuthHintVisible] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState('');

  const showtimeQuery = useQuery({
    queryKey: ['showtime', showtimeId],
    queryFn: ({ signal }) => apiFetch(`/api/showtimes/${showtimeId}`, { signal }),
    enabled: Boolean(showtimeId),
  });

  useEffect(() => {
    if (showtimeQuery.data?.seats) {
      setSeats(showtimeQuery.data.seats);
    }
  }, [showtimeQuery.data]);

  useEffect(() => {
    const showtime = showtimeQuery.data;
    if (!showtime) {
      return;
    }

    const explicitBanner = showtime.movieBannerUrl?.trim() || '';
    const explicitPoster = showtime.moviePosterUrl?.trim() || '';
    const defaultHeroImage = explicitPoster || explicitBanner;
    setHeroImageUrl(defaultHeroImage);

    const movieLookupKey = normalizeMovieTitle(showtime.movieTitle);
    if (!movieLookupKey) {
      return;
    }

    if (showtime.eventType !== 'MOVIE') {
      return;
    }

    if ((explicitBanner && !isLikelyStockImage(explicitBanner)) || (explicitPoster && !isLikelyStockImage(explicitPoster))) {
      setHeroImageUrl(explicitBanner || explicitPoster);
      return;
    }

    const cachedHero = movieHeroImageLookupCache.get(movieLookupKey);
    if (cachedHero) {
      setHeroImageUrl(cachedHero);
      return;
    }

    const abortController = new AbortController();
    const resolveMovieHero = async () => {
      const wikipediaPoster = await fetchWikipediaMoviePoster(showtime.movieTitle, abortController.signal).catch(() => null);
      if (wikipediaPoster) {
        return wikipediaPoster;
      }

      const itunesPoster = await fetchItunesMoviePoster(showtime.movieTitle, abortController.signal).catch(() => null);
      if (itunesPoster) {
        return itunesPoster;
      }

      return defaultHeroImage;
    };

    resolveMovieHero()
      .then((resolvedHeroImage) => {
        if (!resolvedHeroImage) {
          return;
        }
        movieHeroImageLookupCache.set(movieLookupKey, resolvedHeroImage);
        setHeroImageUrl(resolvedHeroImage);
      })
      .catch(() => {
        // Ignore lookup errors and keep the existing fallback image.
      });

    return () => {
      abortController.abort();
    };
  }, [showtimeQuery.data]);

  useSeatTopicSubscription(showtimeId, (payload) => {
    setSeats(payload.seats);
  });

  const seatActionMutation = useMutation({
    mutationFn: ({ endpoint, seatId }) =>
      apiFetch(`/api/showtimes/${showtimeId}/seats/${endpoint}`, {
        method: 'POST',
        token,
        body: {
          seatIds: [seatId],
          clientSessionId,
        },
      }),
    onSuccess: (response) => {
      setActionError('');
      setSeats(response.seats);
    },
    onError: (error) => {
      setActionError(error.message);
    },
  });

  const selectedSeats = seats.filter(
    (seat) => seat.status === 'SELECTED' && seat.selectedBySessionId === clientSessionId,
  );
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + Number(seat.price || 0), 0);

  const handleSeatClick = (seat) => {
    if (!isAuthenticated) {
      setAuthHintVisible(true);
      return;
    }

    const endpoint =
      seat.status === 'SELECTED' && seat.selectedBySessionId === clientSessionId ? 'release' : 'select';

    seatActionMutation.mutate({
      endpoint,
      seatId: seat.id,
    });
  };

  const handleContinue = () => {
    const seatIds = selectedSeats.map((seat) => seat.id).join(',');
    navigate(`/review?showtimeId=${showtimeId}&seats=${seatIds}`);
  };

  if (showtimeQuery.isLoading) {
    return <section className="section-shell"><div className="glass-card p-10 text-center text-slate-300">Loading seat map...</div></section>;
  }

  if (showtimeQuery.error) {
    return (
      <section className="section-shell">
        <div className="glass-card p-10 text-center">
          <p className="font-display text-2xl font-semibold text-white">We couldn&apos;t load this showtime.</p>
          <p className="mt-2 text-slate-400">{showtimeQuery.error.message}</p>
          <Link to="/" className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            Back to discovery
          </Link>
        </div>
      </section>
    );
  }

  const showtime = showtimeQuery.data;
  const castProfiles = parseCastProfiles(showtime.castMembers);

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
        <div className="space-y-6">
          <div className="glass-card overflow-hidden">
            <div
              className="relative h-64 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.08), rgba(2, 6, 23, 0.92)), url(${heroImageUrl || showtime.moviePosterUrl || showtime.movieBannerUrl})`,
              }}
            >
              {showtime.movieLogoUrl || showtime.logoUrl ? (
                <div className="absolute bottom-6 left-6">
                  <img src={showtime.movieLogoUrl || showtime.logoUrl} alt={`${showtime.movieTitle} Logo`} className="h-24 max-w-[240px] object-contain drop-shadow-2xl" />
                </div>
              ) : null}
            </div>
            <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr,0.8fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">{showtime.movieGenre}</p>
                <h1 className="mt-2 font-display text-4xl font-bold text-white">{showtime.movieTitle}</h1>
                <p className="mt-4 max-w-3xl text-slate-300">{showtime.movieDescription}</p>
              </div>

              <div className="space-y-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                <p className="flex items-center gap-2">
                  <MapPinned className="h-4 w-4 text-sky-300" />
                  {showtime.theaterName}, {showtime.theaterCity}
                </p>
                <p className="flex items-center gap-2">
                  <Clapperboard className="h-4 w-4 text-amber-300" />
                  {showtime.screenName} • {showtime.showFormat}
                </p>
                <p className="flex items-center gap-2">
                  <BadgeIndianRupee className="h-4 w-4 text-emerald-300" />
                  {formatCurrency(showtime.basePrice)} base seat price
                </p>
                <p>{formatDateTime(showtime.startTime)}</p>
              </div>
            </div>

            {castProfiles.length ? (
              <div className="border-t border-white/10 px-6 pb-6 pt-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Cast</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {castProfiles.map((castProfile, index) => (
                    <div
                      key={`${castProfile.name}-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                    >
                      <CastAvatar name={castProfile.name} imageUrl={castProfile.imageUrl} />
                      <p className="text-sm font-medium text-white">{castProfile.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {authHintVisible && !isAuthenticated ? (
            <div className="rounded-[1.75rem] border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-50">
              Sign in with OTP from the top bar to lock seats under your session before checkout.
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Interactive seat map</h2>
              <p className="mt-1 text-slate-400">Prime and Classic sections sync in real time as seats get selected.</p>
            </div>
            <SeatLegend />
          </div>

          {actionError ? (
            <div className="rounded-[1.75rem] border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
              {actionError}
            </div>
          ) : null}

          <SeatGrid
            seats={seats}
            clientSessionId={clientSessionId}
            onSeatClick={handleSeatClick}
            disabled={seatActionMutation.isPending}
          />
        </div>

        <aside className="space-y-6">
          <div className="glass-card p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Selection review</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-white">Your held seats</h2>

            {selectedSeats.length ? (
              <div className="mt-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <span
                      key={seat.id}
                      className="rounded-full border border-amber-200/60 bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950"
                    >
                      {seat.label}
                    </span>
                  ))}
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Seats</span>
                    <span>{selectedSeats.length}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-lg font-semibold text-white">
                    <span>Running total</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-3 font-bold text-slate-950 shadow-md shadow-amber-300/20 transition-all hover:-translate-y-0.5 hover:bg-amber-200 hover:shadow-lg hover:shadow-amber-300/30"
                >
                  Continue to review
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="mt-4 text-slate-400">
                Tap any available seat to start building your booking. Your selections stay locked for this session.
              </p>
            )}
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-400/10 p-3 text-sky-200">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Session-based hold</h3>
                <p className="text-sm text-slate-400">
                  No countdown timer. Seats remain held until your session ends or payment is completed.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
