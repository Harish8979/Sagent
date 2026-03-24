import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, Ban, CheckCircle2, CreditCard, Landmark, LoaderCircle, ShieldCheck, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { apiFetch, cancelBookingById } from '../lib/api';
import { formatCurrency, formatDateTime, formatPaymentMethod } from '../lib/formatters';

const PAYMENT_OPTIONS = [
  {
    value: 'CARD',
    label: 'Card',
    hint: 'Debit card, credit card, or RuPay.',
    icon: CreditCard,
  },
  {
    value: 'NET_BANKING',
    label: 'Netbanking',
    hint: 'Pay directly with your bank account.',
    icon: Landmark,
  },
  {
    value: 'UPI',
    label: 'UPI',
    hint: 'Use any UPI app or linked account.',
    icon: Smartphone,
  },
];

function buildSeatIds(rawValue) {
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(',')
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

export function ReviewPage() {
  const [searchParams] = useSearchParams();
  const { token, isAuthenticated } = useAuth();
  const { clientSessionId } = useSession();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CARD');

  const showtimeId = Number(searchParams.get('showtimeId'));
  const seatIds = buildSeatIds(searchParams.get('seats'));

  const reviewQuery = useQuery({
    queryKey: ['booking-review', showtimeId, seatIds.join(','), clientSessionId],
    queryFn: () =>
      apiFetch('/api/bookings/review', {
        method: 'POST',
        token,
        body: {
          showtimeId,
          seatIds,
          clientSessionId,
        },
      }),
    enabled: isAuthenticated && Number.isFinite(showtimeId) && seatIds.length > 0,
  });

  const confirmMutation = useMutation({
    mutationFn: () =>
      apiFetch('/api/bookings/confirm', {
        method: 'POST',
        token,
        body: {
          showtimeId,
          seatIds,
          clientSessionId,
          paymentOrderId: reviewQuery.data.paymentOrderId,
          paymentReferenceId: `${selectedPaymentMethod.toLowerCase()}_${Date.now()}`,
          paymentMethod: selectedPaymentMethod,
          promoCode: reviewQuery.data.appliedPromoCode,
        },
      }),
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId) => cancelBookingById(bookingId, { token }),
  });

  if (!isAuthenticated) {
    return (
      <section className="section-shell">
        <div className="glass-card p-10 text-center">
          <p className="font-display text-3xl font-bold text-white">Login required to review a booking.</p>
          <p className="mt-2 text-slate-400">Use the OTP login button in the header, then return here.</p>
          <Link to="/" className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            Back to discovery
          </Link>
        </div>
      </section>
    );
  }

  if (!seatIds.length || !Number.isFinite(showtimeId)) {
    return (
      <section className="section-shell">
        <div className="glass-card p-10 text-center">
          <p className="font-display text-3xl font-bold text-white">No seats selected yet.</p>
          <p className="mt-2 text-slate-400">Choose seats from a live showtime and then continue to review.</p>
          <Link to="/" className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            Browse showtimes
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="glass-card p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-200/70">Booking review</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white">Confirm your seats before payment.</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            This page is backed by the server-side booking quote and a payment order stub.
          </p>

          {reviewQuery.isLoading ? (
            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-slate-300">
              Building your booking summary...
            </div>
          ) : reviewQuery.error ? (
            <div className="mt-6 rounded-[1.75rem] border border-rose-300/25 bg-rose-500/10 p-6 text-rose-100">
              {reviewQuery.error.message}
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <h2 className="font-display text-2xl font-bold text-white">{reviewQuery.data.movieTitle}</h2>
                <p className="mt-2 text-slate-300">
                  {reviewQuery.data.theaterName}, {reviewQuery.data.theaterCity}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {reviewQuery.data.screenName} • {reviewQuery.data.showFormat}
                </p>
                <p className="mt-3 text-sm text-slate-300">{formatDateTime(reviewQuery.data.startTime)}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Seats</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {reviewQuery.data.seats.map((seat) => (
                      <span
                        key={seat}
                        className="rounded-full border border-amber-200/60 bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Payment order</p>
                  <p className="mt-4 text-sm text-slate-300">{reviewQuery.data.paymentOrderId}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm text-emerald-200">
                    <ShieldCheck className="h-4 w-4" />
                    Stubbed capture path ready for card, netbanking, and UPI
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="glass-card p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Payment summary</p>

            {reviewQuery.data ? (
              <>
                <div className="mt-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Choose payment method</p>
                  <div className="mt-4 grid gap-3">
                    {PAYMENT_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const selected = selectedPaymentMethod === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(option.value)}
                      className={`group rounded-[1.5rem] border px-4 py-4 text-left transition-all duration-300 hover:shadow-lg ${
                            selected
                          ? 'border-amber-300/60 bg-amber-300/15 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                          : 'border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`rounded-2xl p-3 ${selected ? 'bg-amber-300 text-slate-950' : 'bg-white/10 text-white'}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{option.label}</p>
                              <p className="mt-1 text-sm text-slate-400">{option.hint}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Seat subtotal</span>
                    <span>{formatCurrency(reviewQuery.data.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Convenience fee (5%)</span>
                    <span>{formatCurrency(reviewQuery.data.convenienceFee)}</span>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between text-xl font-semibold text-white">
                    <span>Total payable</span>
                    <span>{formatCurrency(reviewQuery.data.totalAmount)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                    <span>Selected method</span>
                    <span>{formatPaymentMethod(selectedPaymentMethod)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={confirmMutation.isPending || reviewQuery.isLoading}
                  onClick={() => confirmMutation.mutate()}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay with {formatPaymentMethod(selectedPaymentMethod)}
                </button>
              </>
            ) : null}

            {confirmMutation.error ? (
              <div className="mt-4 rounded-[1.5rem] border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
                {confirmMutation.error.message}
              </div>
            ) : null}
          </div>

          {confirmMutation.data ? (
            <div className="glass-card border-emerald-300/20 bg-emerald-300/10 p-6">
              <div className="flex items-center gap-3 text-emerald-100">
                <CheckCircle2 className="h-6 w-6" />
                <div>
                  <h2 className="font-display text-2xl font-bold">Booking confirmed</h2>
                  <p className="text-sm text-emerald-100/80">{confirmMutation.data.bookingReference}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-emerald-50">
                {formatPaymentMethod(confirmMutation.data.paymentMethod)} payment ID: {confirmMutation.data.paymentReferenceId}
              </p>

              {cancelBookingMutation.isSuccess ? (
                <div className="mt-5 rounded-[1rem] border border-rose-300/30 bg-rose-500/20 p-4 text-sm text-rose-100">
                  <p className="font-semibold">Booking Cancelled</p>
                  <p className="mt-1">Your newly booked seats have been released and the refund has been processed.</p>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    to="/bookings"
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                  >
                    View my bookings
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  {confirmMutation.data?.bookingId ? (
                    <button
                      type="button"
                      disabled={cancelBookingMutation.isPending}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this new booking immediately?')) {
                          cancelBookingMutation.mutate(confirmMutation.data.bookingId);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {cancelBookingMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                      Cancel immediately
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
