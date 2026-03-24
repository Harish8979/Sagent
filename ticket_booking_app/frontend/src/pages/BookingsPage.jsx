import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CalendarClock, Clapperboard, LoaderCircle, MapPin, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { cancelBookingById, fetchMyBookings } from '../lib/api';
import { formatCurrency, formatDateTime } from '../lib/formatters';

function formatSeats(seats) {
  if (Array.isArray(seats)) {
    return seats.length ? seats.join(', ') : 'Unassigned';
  }

  return seats || 'Unassigned';
}

export function BookingsPage() {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [cancelError, setCancelError] = useState('');

  const bookingsQuery = useQuery({
    queryKey: ['my-bookings'],
    queryFn: ({ signal }) => fetchMyBookings({ token, signal }),
    enabled: isAuthenticated,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId) => cancelBookingById(bookingId, { token }),
    onSuccess: () => {
      setCancelError('');
      // Refresh the bookings list immediately after a successful cancellation
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (error) => {
      setCancelError(error.message);
    },
  });

  const handleCancelBooking = (bookingId) => {
    const confirmed = window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.');
    if (!confirmed) {
      return;
    }
    
    setCancelError('');
    cancelBookingMutation.mutate(bookingId);
  };

  if (!isAuthenticated) {
    return (
      <section className="section-shell py-10">
        <div className="glass-card p-10 text-center">
          <p className="font-display text-3xl font-bold text-white">Login required to view bookings.</p>
          <p className="mt-2 text-slate-400">Use the login button in the header, then return here.</p>
          <Link to="/" className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15">
            Back to discovery
          </Link>
        </div>
      </section>
    );
  }

  if (bookingsQuery.isLoading) {
    return (
      <section className="section-shell py-10">
        <div className="glass-card p-10 text-center text-slate-300">Loading your bookings...</div>
      </section>
    );
  }

  if (bookingsQuery.error) {
    return (
      <section className="section-shell py-10">
        <div className="glass-card p-10 text-center">
          <p className="font-display text-3xl font-bold text-white">We couldn&apos;t load your bookings.</p>
          <p className="mt-2 text-slate-400">{bookingsQuery.error.message}</p>
        </div>
      </section>
    );
  }

  const bookings = bookingsQuery.data || [];

  return (
    <section className="section-shell py-10">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-200/70">My Account</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white">Ticket Reservations</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Review your upcoming shows and manage cancellations from here.
        </p>
      </div>

      {cancelError ? (
        <div className="mb-6 rounded-[1.75rem] border border-rose-300/25 bg-rose-500/10 p-5 text-sm text-rose-100">
          {cancelError}
        </div>
      ) : null}

      {bookings.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Ticket className="mx-auto mb-4 h-12 w-12 text-slate-500" />
          <p className="font-display text-2xl font-bold text-white">No bookings yet.</p>
          <p className="mt-2 text-slate-400">Looks like you haven&apos;t reserved any seats recently.</p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200">
            Browse upcoming shows
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {bookings.map((booking) => {
            const isCancelled = booking.bookingStatus === 'CANCELLED';
            const isRefunding = Number(booking.refundAmount || 0) > 0;
            const canCancel = booking.canCancel ?? !isCancelled;
            const title = booking.movieTitle || booking.title || 'Event Title';
            const seatsLabel = formatSeats(booking.seats);
            const bookingDate = booking.startTime || booking.bookedAt || booking.createdAt;

            return (
              <article key={booking.bookingId} className="glass-card flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${isCancelled ? 'border-rose-300/30 bg-rose-400/10 text-rose-100' : 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100'}`}>
                        {booking.bookingStatus}
                      </span>
                      <h2 className="mt-4 font-display text-2xl font-bold text-white">{title}</h2>
                      <p className="mt-1 text-sm text-slate-400">Reference: {booking.bookingReference}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-white">{formatCurrency(booking.totalAmount)}</p>
                      {isRefunding ? (
                        <p className="mt-1 text-xs text-rose-200">Refund: {formatCurrency(booking.refundAmount)}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-sky-300" /> {booking.theaterName || 'Theater'}</p>
                    <p className="flex items-center gap-2"><Clapperboard className="h-4 w-4 text-indigo-300" /> {booking.screenName || 'Screen'} • {seatsLabel}</p>
                    <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-amber-300" /> {formatDateTime(bookingDate)}</p>
                  </div>
                </div>

                {canCancel ? (
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <button type="button" disabled={cancelBookingMutation.isPending} onClick={() => handleCancelBooking(booking.bookingId)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 font-semibold text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-70">
                      {cancelBookingMutation.isPending && cancelBookingMutation.variables === booking.bookingId ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                      Cancel Booking
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
