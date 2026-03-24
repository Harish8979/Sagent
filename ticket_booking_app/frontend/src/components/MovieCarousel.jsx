import { Clapperboard, Clock3, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatCurrency, formatShortDate } from '../lib/formatters';

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

export function MovieCarousel({ featuredMovies, highlightShowtime }) {
  if (!featuredMovies?.length) {
    return null;
  }

  const now = new Date();
  const canJumpToLiveShowtime = Boolean(highlightShowtime && !highlightShowtime.catalogOnly);

  return (
    <section className="section-shell pt-10">
      <div className="rounded-[2rem] border border-white/10 bg-hero-grid p-6 shadow-glow sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr,0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-100/70">Now Curating</p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Reserve live seats for India&apos;s recent and upcoming releases.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-200/80 sm:text-lg">
              Browse recently released and upcoming Indian films, concerts, and live events, lock seats in real time, and
              finish checkout with a Razorpay-ready payment stub.
            </p>

            {canJumpToLiveShowtime ? (
              <Link
                to={`/showtimes/${highlightShowtime.showtimeId}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                <Clapperboard className="h-4 w-4" />
                Jump to the next live show
              </Link>
            ) : highlightShowtime ? (
              <p className="mt-6 inline-flex items-center rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-medium text-amber-100">
                Catalog previews are visible below
              </p>
            ) : null}
          </div>

          {highlightShowtime ? (
            <div className="glass-card p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Next live session</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-white">{highlightShowtime.movieTitle}</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-amber-300" />
                  {formatShortDate(highlightShowtime.startTime)}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-sky-300" />
                  {highlightShowtime.theaterName}, {highlightShowtime.city}
                </p>
              </div>
              <p className="mt-4 text-xl font-semibold text-white">{formatCurrency(highlightShowtime.price)}</p>
              {highlightShowtime.catalogOnly ? (
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-200/80">Catalog preview</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2">
          {featuredMovies.map((movie) => {
            const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null;
            const isReleased =
              releaseDate instanceof Date &&
              !Number.isNaN(releaseDate.getTime()) &&
              releaseDate.getTime() <= now.getTime();

            return (
              <article
                key={movie.id}
                className="glass-card min-w-[280px] snap-start overflow-hidden border-white/10 md:min-w-[360px]"
              >
                <div
                  className="relative h-52 bg-cover bg-center"
                  style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(2, 6, 23, 0.9)), url(${movie.bannerUrl || movie.posterUrl})` }}
                >
                  {movie.logoUrl ? (
                    <div className="absolute bottom-4 left-5">
                      <img src={movie.logoUrl} alt={`${movie.title} logo`} className="h-14 max-w-[180px] object-contain drop-shadow-lg" />
                    </div>
                  ) : null}
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-white">{movie.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {resolveGenreCategory(movie.eventType)} • {movie.language}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm text-amber-100">
                      <Star className="h-4 w-4 fill-current" />
                      {movie.rating}
                    </div>
                  </div>
                  <p className="line-clamp-3 text-sm text-slate-300">{movie.description}</p>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{isReleased ? 'Released' : 'Releases'} {formatShortDate(movie.releaseDate)}</span>
                    <span>{formatCurrency(movie.basePrice)} onwards</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
