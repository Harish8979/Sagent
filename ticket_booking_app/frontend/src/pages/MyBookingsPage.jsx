import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, Film, LoaderCircle, TicketCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { cancelBookingById, fetchMyBookings } from '../lib/api';
import { formatCurrency, formatDateTime, formatPaymentMethod } from '../lib/formatters';

function normalizeSeats(seats) {
  if (Array.isArray(seats)) {
    return seats;
  }

  if (typeof seats === 'string') {
    return seats
      .split(',')
      .map((seat) => seat.trim())
      .filter(Boolean);
  }

  return [];
}

export function MyBookingsPage() {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState(null);

  const bookingsQuery = useQuery({
    queryKey: ['my-bookings'],
    queryFn: ({ signal }) => fetchMyBookings({ token, signal }),
    enabled: isAuthenticated,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId) => cancelBookingById(bookingId, { token }),
    onSuccess: () => {
      setNotice({
        type: 'success',
        message: 'Booking cancelled. Refund details will refresh below shortly.',
      });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (error) => {
      setNotice({
        type: 'error',
        message: error.message,
      });
    },
  });

  const handleCancelBooking = (bookingId) => {
    const confirmed = window.confirm('Are you sure you want to cancel this booking? Your seats will be released.');
    if (!confirmed) {
      return;
    }

    setNotice(null);
    cancelBookingMutation.mutate(bookingId);
  };

  if (!isAuthenticated) {
    return (
      <section className="section-shell">
        <div className="glass-card p-10 text-center">
          <p className="font-display text-3xl font-bold text-white">Your booking history lives here.</p>
          <p className="mt-2 text-slate-400">Use OTP login from the header to load your tickets.</p>
        </div>
      </section>
    );
  }

  if (bookingsQuery.isError) {
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
        <p className="text-sm uppercase tracking-[0.3em] text-sky-200/70">My profile</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white">Current and past bookings</h1>
        <p className="mt-2 text-slate-400">
          Every confirmed booking is stored in MySQL and surfaced here for quick ticket lookup.
        </p>
      </div>

      {notice ? (
        <div
          className={`mb-6 rounded-[1.75rem] border p-5 text-sm ${
            notice.type === 'error'
              ? 'border-rose-300/25 bg-rose-500/10 text-rose-100'
              : 'border-emerald-300/25 bg-emerald-500/10 text-emerald-100'
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      {bookingsQuery.isLoading ? (
        <div className="glass-card p-10 text-center text-slate-300">Loading your tickets...</div>
      ) : bookings.length ? (
        <div className="grid gap-5">
          {bookings.map((booking) => {
            const seats = normalizeSeats(booking.seats);
            const bookingStatus = String(booking.bookingStatus || '').toUpperCase();
            const paymentStatus = String(booking.paymentStatus || '').toUpperCase();
            const refundAmount = Number(booking.refundAmount || 0);
            const isCancelled = bookingStatus === 'CANCELLED';
            const isUpcoming = new Date(booking.startTime) > new Date();
            const canCancel = booking.canCancel ?? (isUpcoming && !isCancelled);
            const isCancellingCurrentBooking =
              cancelBookingMutation.isPending && cancelBookingMutation.variables === booking.bookingId;
            const bookingStateLabel = isCancelled ? 'Cancelled' : isUpcoming ? 'Upcoming' : 'Completed';

            return (
              <article key={booking.bookingId} className="glass-card overflow-hidden border-white/10">
                <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr,0.8fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div
                        className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.25em] ${
                          isCancelled
                            ? 'bg-rose-400/15 text-rose-100'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {bookingStateLabel}
                      </div>
                      <div
                        className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.25em] ${
                          paymentStatus === 'REFUNDED'
                            ? 'bg-rose-400/15 text-rose-100'
                            : 'bg-emerald-300/15 text-emerald-100'
                        }`}
                      >
                        {booking.paymentStatus || 'Pending'}
                      </div>
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-bold text-white">{booking.movieTitle}</h2>
                    <div className="mt-4 space-y-2 text-sm text-slate-300">
                      <p>{booking.theaterName}, {booking.theaterCity}</p>
                      <p>{booking.screenName}</p>
                      <p>{formatDateTime(booking.startTime)}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <TicketCheck className="h-4 w-4 text-amber-300" />
                      {booking.bookingReference}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {seats.length ? (
                        seats.map((seat) => (
                          <span
                            key={seat}
                            className="rounded-full border border-amber-200/60 bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950"
                          >
                            {seat}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                          Seats unavailable
                        </span>
                      )}
                    </div>
                    <div className="mt-5 border-t border-white/10 pt-5">
                      <p className="text-sm text-slate-400">Total paid</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(booking.totalAmount)}</p>
                      <p className="mt-2 text-sm text-slate-400">Paid via {formatPaymentMethod(booking.paymentMethod)}</p>
                      {refundAmount > 0 ? (
                        <p className="mt-2 text-sm text-rose-200">Refund marked: {formatCurrency(refundAmount)}</p>
                      ) : null}
                    </div>
                    {canCancel ? (
                      <div className="mt-5 border-t border-white/10 pt-5">
                        <p className="text-sm text-slate-400">Need to cancel?</p>
                        <button
                          type="button"
                          disabled={cancelBookingMutation.isPending}
                          onClick={() => handleCancelBooking(booking.bookingId)}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isCancellingCurrentBooking ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Ban className="h-4 w-4" />
                          )}
                          Cancel booking
                        </button>
                      </div>
                    ) : isCancelled ? (
                      <div className="mt-5 rounded-[1.25rem] border border-rose-300/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                        {refundAmount > 0
                          ? `Cancelled. Refund of ${formatCurrency(refundAmount)} is being returned to your original payment method.`
                          : 'Cancelled. Refund details will appear here once they are processed.'}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-400">
                        Cancellation closes once the showtime has started.
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-10 text-center">
          <Film className="mx-auto h-10 w-10 text-slate-500" />
          <p className="mt-4 font-display text-3xl font-bold text-white">No bookings yet.</p>
          <p className="mt-2 text-slate-400">Once you confirm a seat selection, your ticket will appear here.</p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white"
          >
            Explore showtimes
          </Link>
        </div>
      )}
    </section>
  );
}
