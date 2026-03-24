import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Armchair,
  Ban,
  Building2,
  CalendarRange,
  Clapperboard,
  Grid2X2,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Mail,
  MonitorPlay,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { formatCurrency, formatDateTime, formatPaymentMethod, formatShortDate } from '../lib/formatters';

const ADMIN_SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'events', label: 'Manage Events', icon: Clapperboard },
  { key: 'venues', label: 'Manage Venues', icon: Building2 },
  { key: 'seats', label: 'Manage Seats', icon: Armchair },
  { key: 'schedules', label: 'Manage Schedules', icon: CalendarRange },
  { key: 'event-seats', label: 'Manage Event Seats', icon: Grid2X2 },
  { key: 'bookings', label: 'Manage Bookings', icon: Ticket },
  { key: 'users', label: 'Manage Users', icon: Users },
  { key: 'payments', label: 'Manage Payments', icon: Wallet },
  { key: 'cancellations', label: 'Manage Cancellations', icon: Ban },
];

const GENRE_PRESETS = [
  { key: 'MOVIES', label: 'Movies', eventType: 'MOVIE', genre: 'Movies' },
  { key: 'CONCERTS', label: 'Concerts', eventType: 'CONCERT', genre: 'Concerts' },
  {
    key: 'STAND_UP_COMEDY_SHOW',
    label: 'Stand-up Comedy Show',
    eventType: 'EVENT',
    genre: 'Stand-up Comedy Show',
  },
];

function resolveGenrePreset(presetKey) {
  return GENRE_PRESETS.find((preset) => preset.key === presetKey) || GENRE_PRESETS[0];
}

function createDefaultEventForm() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const startTime = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const defaultGenrePreset = resolveGenrePreset('MOVIES');

  return {
    title: '',
    genrePreset: defaultGenrePreset.key,
    eventType: defaultGenrePreset.eventType,
    description: '',
    genre: defaultGenrePreset.genre,
    language: 'English',
    durationMinutes: '150',
    rating: '8.5',
    posterUrl: '',
    bannerUrl: '',
    logoUrl: '',
    castMembers: '',
    organizerName: '',
    ageRestriction: 'U/A',
    venueName: '',
    venueType: 'Multiplex',
    city: '',
    addressLine: '',
    screenName: 'Screen 1',
    showFormat: '2D',
    startTime,
    totalRows: '6',
    seatsPerRow: '10',
    vipRows: '1',
    premiumRows: '2',
    regularPrice: '250',
    premiumPrice: '380',
    vipPrice: '520',
  };
}

function createDefaultVenueForm() {
  return {
    venueName: '',
    venueType: 'Multiplex',
    city: '',
    addressLine: '',
    totalRows: '10',
    seatsPerRow: '15',
  };
}

function createDefaultUserForm() {
  return {
    fullName: '',
    email: '',
    phoneNumber: '',
    verified: true,
    role: 'USER',
    authProvider: 'OTP',
    preferredChannel: '',
  };
}

function toOptionalUserValue(value) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function sectionHref(sectionKey) {
  return sectionKey === 'dashboard' ? '/admin' : `/admin/${sectionKey}`;
}

function resolveActiveSection(pathname) {
  const sectionKey = pathname.replace(/^\/admin\/?/, '').split('/')[0] || 'dashboard';
  return ADMIN_SECTIONS.some((section) => section.key === sectionKey) ? sectionKey : 'dashboard';
}

function toOptionalValue(value) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function buildCreateEventPayload(formState) {
  const selectedGenrePreset = resolveGenrePreset(formState.genrePreset);

  return {
    title: formState.title.trim(),
    eventType: selectedGenrePreset.eventType,
    description: formState.description.trim(),
    genre: selectedGenrePreset.genre,
    language: formState.language.trim(),
    durationMinutes: Number(formState.durationMinutes),
    rating: Number(formState.rating),
    posterUrl: toOptionalValue(formState.posterUrl),
    bannerUrl: toOptionalValue(formState.bannerUrl),
    logoUrl: toOptionalValue(formState.logoUrl),
    castMembers: toOptionalValue(formState.castMembers),
    organizerName: toOptionalValue(formState.organizerName),
    ageRestriction: toOptionalValue(formState.ageRestriction),
    venueName: formState.venueName.trim(),
    venueType: toOptionalValue(formState.venueType),
    city: formState.city.trim(),
    addressLine: formState.addressLine.trim(),
    screenName: formState.screenName.trim(),
    showFormat: formState.showFormat.trim(),
    startTime: formState.startTime,
    totalRows: Number(formState.totalRows),
    seatsPerRow: Number(formState.seatsPerRow),
    vipRows: Number(formState.vipRows),
    premiumRows: Number(formState.premiumRows),
    regularPrice: Number(formState.regularPrice),
    premiumPrice: formState.premiumPrice.trim() ? Number(formState.premiumPrice) : null,
    vipPrice: formState.vipPrice.trim() ? Number(formState.vipPrice) : null,
  };
}

function buildUserPayload(formState) {
  return {
    fullName: formState.fullName.trim(),
    email: toOptionalUserValue(formState.email),
    phoneNumber: toOptionalUserValue(formState.phoneNumber),
    verified: Boolean(formState.verified),
    role: formState.role,
    authProvider: toOptionalUserValue(formState.authProvider),
    preferredChannel: toOptionalUserValue(formState.preferredChannel),
  };
}

function toUserFormState(account) {
  const normalizedRole = account.role === 'ADMIN' ? 'ADMIN' : 'USER';
  const normalizedAuthProvider = ['OTP', 'PASSWORD', 'GOOGLE', 'APPLE', 'FACEBOOK'].includes(account.authProvider)
    ? account.authProvider
    : 'OTP';

  return {
    fullName: account.fullName || '',
    email: account.email || '',
    phoneNumber: account.phoneNumber || '',
    verified: Boolean(account.verified),
    role: normalizedRole,
    authProvider: normalizedAuthProvider,
    preferredChannel: account.email ? 'EMAIL' : account.phoneNumber ? 'MOBILE' : '',
  };
}

function MetricCard({ label, value, hint, tone = 'text-white' }) {
  return (
    <div className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-black/20">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className={`mt-3 font-display text-3xl font-bold transition-transform group-hover:scale-105 group-hover:origin-left ${tone}`}>{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white">{title}</h1>
        <p className="mt-3 max-w-3xl text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatusPill({ value }) {
  const normalized = String(value || '').toUpperCase();
  const tone = normalized.includes('CANCEL') || normalized.includes('REFUND')
    ? 'border-rose-300/30 bg-rose-400/10 text-rose-100'
    : normalized.includes('SUCCESS') || normalized.includes('CONFIRMED') || normalized.includes('ADMIN')
    ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100'
    : normalized.includes('SCHEDULED') || normalized.includes('AVAILABLE')
    ? 'border-sky-300/30 bg-sky-400/10 text-sky-100'
    : 'border-white/10 bg-white/5 text-slate-200';

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${tone}`}>{value}</span>;
}

function NoticeBanner({ notice }) {
  if (!notice?.message) {
    return null;
  }

  const tone =
    notice.type === 'success'
      ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-50'
      : 'border-rose-300/25 bg-rose-400/10 text-rose-50';

  return <div className={`rounded-[1.5rem] border px-5 py-4 text-sm ${tone}`}>{notice.message}</div>;
}

function TableCard({ title, description, children }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
        {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }) {
  return <div className="px-6 py-10 text-center text-slate-400">{message}</div>;
}

function SidebarLink({ section, count }) {
  const Icon = section.icon;

  return (
    <NavLink
      to={sectionHref(section.key)}
      end={section.key === 'dashboard'}
      className={({ isActive }) =>
        [
          'flex items-center justify-between rounded-[1.25rem] px-4 py-3 text-sm font-semibold transition',
          isActive
            ? 'bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
            : 'text-white/80 hover:bg-white/10 hover:text-white',
        ].join(' ')
      }
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {section.label}
      </span>
      {count != null ? <span className="rounded-full bg-slate-950/30 px-2 py-1 text-xs">{count}</span> : null}
    </NavLink>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function BaseInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-cyan-300/70 focus:bg-white/10 focus:ring-2 focus:ring-cyan-300/20 ${props.className || ''}`}
    />
  );
}

function BaseSelect(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20 ${props.className || ''}`}
    />
  );
}

function AdminPageContent({
  activeSection,
  data,
  eventForm,
  userForm,
  onEventFormChange,
  onUserFormChange,
  onCreateEvent,
  onSubmitUser,
  onRemoveEvent,
  onStartCreateUser,
  onStartEditUser,
  onDeleteUser,
  onSendTestEmail,
  showCreateForm,
  showUserForm,
  editingUserId,
  setShowCreateForm,
  setShowUserForm,
  createEventPending,
  saveUserPending,
  deleteUserPending,
  removeEventPending,
  sendTestEmailPending,
  onCancelSchedule,
  cancelSchedulePending,
  venueForm,
  onVenueFormChange,
  onCreateVenue,
  onRemoveVenue,
  showVenueForm,
  setShowVenueForm,
  createVenuePending,
  removeVenuePending,
}) {
  const sectionCounts = {
    events: data.events.length,
    venues: data.venues.length,
    seats: data.seatInventory.length,
    schedules: data.schedules.length,
    'event-seats': data.eventSeats.length,
    bookings: data.bookings.length,
    users: data.users.length,
    payments: data.payments.length,
    cancellations: data.cancellations.length,
  };

  if (activeSection === 'dashboard') {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Admin Control"
          title="Operations dashboard"
          description="A single admin workspace for events, venues, seats, schedules, customers, payments, and cancellations."
          action={
            <button
              type="button"
              disabled={sendTestEmailPending}
              onClick={onSendTestEmail}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {sendTestEmailPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send test email
            </button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Total bookings" value={data.analytics.totalBookings} hint="All booking records" />
          <MetricCard label="Confirmed" value={data.analytics.confirmedBookings} hint="Successful customer bookings" tone="text-emerald-100" />
          <MetricCard label="Cancelled" value={data.analytics.cancelledBookings} hint="Cancelled tickets and schedules" tone="text-rose-100" />
          <MetricCard label="Gross revenue" value={formatCurrency(data.analytics.grossRevenue)} hint="Confirmed booking revenue" />
          <MetricCard label="Refunds" value={formatCurrency(data.analytics.refundAmount)} hint="Refunds already marked" tone="text-amber-100" />
          <MetricCard label="Occupancy" value={`${data.analytics.occupancyRate}%`} hint="Booked seats across all schedules" tone="text-cyan-100" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {ADMIN_SECTIONS.filter((section) => section.key !== 'dashboard').map((section) => {
            const Icon = section.icon;
            return (
              <NavLink
                key={section.key}
                to={sectionHref(section.key)}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-cyan-300/10 p-3 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    {sectionCounts[section.key]}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-white">{section.label}</h3>
                <p className="mt-2 text-sm text-slate-400">Open this section to review and manage live admin data.</p>
              </NavLink>
            );
          })}
        </div>

        <TableCard
          title="Upcoming schedules"
          description="The most recent schedules are surfaced here so the admin can spot occupancy and status issues quickly."
        >
          {data.schedules.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Schedule</th>
                    <th className="px-6 py-4 font-medium">Venue</th>
                    <th className="px-6 py-4 font-medium">Start</th>
                    <th className="px-6 py-4 font-medium">Seats</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.schedules.slice(0, 5).map((schedule) => (
                    <tr key={schedule.showtimeId} className="text-slate-200">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{schedule.title}</p>
                        <p className="text-slate-400">{schedule.screenName} • {schedule.showFormat}</p>
                      </td>
                      <td className="px-6 py-4">{schedule.theaterName}, {schedule.city}</td>
                      <td className="px-6 py-4">{formatDateTime(schedule.startTime)}</td>
                      <td className="px-6 py-4">{schedule.bookedSeats} / {schedule.totalSeats}</td>
                      <td className="px-6 py-4"><StatusPill value={schedule.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No schedules have been created yet." />
          )}
        </TableCard>
      </div>
    );
  }

  if (activeSection === 'events') {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Manage Events"
          title="Create, review, and grow the event catalog"
          description="This section gives the admin a dedicated place to add Movies, Concerts, or Stand-up Comedy Show events and remove events if required."
          action={
            <button
              type="button"
              onClick={() => setShowCreateForm((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              <Plus className="h-4 w-4" />
              {showCreateForm ? 'Hide event form' : 'Create event'}
            </button>
          }
        />

        {showCreateForm ? (
          <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-950/40 p-3 text-cyan-100">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-white">New event setup</h2>
                <p className="text-sm text-slate-300">This will create the event, venue linkage, schedule, and seat map in one go.</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={onCreateEvent}>
              <div className="grid gap-4 xl:grid-cols-2">
                <FormField label="Event title">
                  <BaseInput
                    required
                    value={eventForm.title}
                    onChange={(event) => onEventFormChange('title', event.target.value)}
                    placeholder="Midnight Resonance"
                  />
                </FormField>

                <FormField label="Genre">
                  <BaseSelect value={eventForm.genrePreset} onChange={(event) => onEventFormChange('genrePreset', event.target.value)}>
                    {GENRE_PRESETS.map((preset) => (
                      <option key={preset.key} value={preset.key}>{preset.label}</option>
                    ))}
                  </BaseSelect>
                </FormField>

                <FormField label="Description">
                  <textarea
                    required
                    value={eventForm.description}
                    onChange={(event) => onEventFormChange('description', event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-cyan-300/70 focus:bg-white/10 focus:ring-2 focus:ring-cyan-300/20"
                    placeholder="Describe the experience, storyline, or attraction."
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Event type">
                    <BaseInput value={eventForm.eventType} readOnly />
                  </FormField>
                  <FormField label="Language">
                    <BaseSelect value={eventForm.language} onChange={(event) => onEventFormChange('language', event.target.value)}>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Bengali">Bengali</option>
                    </BaseSelect>
                  </FormField>
                  <FormField label="Duration in minutes">
                    <BaseInput required type="number" min="1" value={eventForm.durationMinutes} onChange={(event) => onEventFormChange('durationMinutes', event.target.value)} />
                  </FormField>
                  <FormField label="Rating">
                    <BaseInput required type="number" min="0" max="10" step="0.1" value={eventForm.rating} onChange={(event) => onEventFormChange('rating', event.target.value)} />
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Cast members">
                    <BaseInput
                      value={eventForm.castMembers}
                      onChange={(event) => onEventFormChange('castMembers', event.target.value)}
                      placeholder="Top 5 cast: Name|PhotoURL, Name|PhotoURL"
                    />
                  </FormField>
                  <FormField label="Organizer name">
                    <BaseInput value={eventForm.organizerName} onChange={(event) => onEventFormChange('organizerName', event.target.value)} placeholder="Studio or event organizer" />
                  </FormField>
                  <FormField label="Age restriction">
                    <BaseInput value={eventForm.ageRestriction} onChange={(event) => onEventFormChange('ageRestriction', event.target.value)} />
                  </FormField>
                  <FormField label="Start time">
                    <BaseInput required type="datetime-local" value={eventForm.startTime} onChange={(event) => onEventFormChange('startTime', event.target.value)} />
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField label="Poster URL">
                    <BaseInput value={eventForm.posterUrl} onChange={(event) => onEventFormChange('posterUrl', event.target.value)} placeholder="https://..." />
                  </FormField>
                  <FormField label="Banner URL">
                    <BaseInput value={eventForm.bannerUrl} onChange={(event) => onEventFormChange('bannerUrl', event.target.value)} placeholder="https://..." />
                  </FormField>
                  <FormField label="Logo URL">
                    <BaseInput value={eventForm.logoUrl} onChange={(event) => onEventFormChange('logoUrl', event.target.value)} placeholder="Transparent PNG/WEBP" />
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Venue name">
                    <BaseInput required value={eventForm.venueName} onChange={(event) => onEventFormChange('venueName', event.target.value)} placeholder="Skyline Multiplex" />
                  </FormField>
                  <FormField label="Venue type">
                    <BaseInput value={eventForm.venueType} onChange={(event) => onEventFormChange('venueType', event.target.value)} />
                  </FormField>
                  <FormField label="City">
                    <BaseInput required value={eventForm.city} onChange={(event) => onEventFormChange('city', event.target.value)} placeholder="Chennai" />
                  </FormField>
                  <FormField label="Address line">
                    <BaseInput required value={eventForm.addressLine} onChange={(event) => onEventFormChange('addressLine', event.target.value)} placeholder="123 Marina Road" />
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Screen name">
                    <BaseInput required value={eventForm.screenName} onChange={(event) => onEventFormChange('screenName', event.target.value)} />
                  </FormField>
                  <FormField label="Show format">
                    <BaseInput required value={eventForm.showFormat} onChange={(event) => onEventFormChange('showFormat', event.target.value)} />
                  </FormField>
                  <FormField label="Total rows">
                    <BaseInput required type="number" min="1" value={eventForm.totalRows} onChange={(event) => onEventFormChange('totalRows', event.target.value)} />
                  </FormField>
                  <FormField label="Seats per row">
                    <BaseInput required type="number" min="1" value={eventForm.seatsPerRow} onChange={(event) => onEventFormChange('seatsPerRow', event.target.value)} />
                  </FormField>
                  <FormField label="VIP rows">
                    <BaseInput required type="number" min="0" value={eventForm.vipRows} onChange={(event) => onEventFormChange('vipRows', event.target.value)} />
                  </FormField>
                  <FormField label="Premium rows">
                    <BaseInput required type="number" min="0" value={eventForm.premiumRows} onChange={(event) => onEventFormChange('premiumRows', event.target.value)} />
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField label="Regular price">
                    <BaseInput required type="number" min="0" step="0.01" value={eventForm.regularPrice} onChange={(event) => onEventFormChange('regularPrice', event.target.value)} />
                  </FormField>
                  <FormField label="Premium price">
                    <BaseInput type="number" min="0" step="0.01" value={eventForm.premiumPrice} onChange={(event) => onEventFormChange('premiumPrice', event.target.value)} />
                  </FormField>
                  <FormField label="VIP price">
                    <BaseInput type="number" min="0" step="0.01" value={eventForm.vipPrice} onChange={(event) => onEventFormChange('vipPrice', event.target.value)} />
                  </FormField>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={createEventPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {createEventPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Create event and schedule
                </button>
                <p className="text-sm text-slate-300">Required admin sections update automatically after creation.</p>
              </div>
            </form>
          </div>
        ) : null}

        <TableCard title="Event catalog" description="Every movie or live event currently stored in the admin catalog.">
          {data.events.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Event ID</th>
                    <th className="px-6 py-4 font-medium">Event</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Release</th>
                    <th className="px-6 py-4 font-medium">Base price</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.events.map((event) => (
                    <tr key={event.eventId} className="text-slate-200">
                      <td className="px-6 py-4">{event.eventId}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{event.title}</p>
                        <p className="text-slate-400">{event.genre} • {event.language} • {event.durationMinutes} mins</p>
                      </td>
                      <td className="px-6 py-4"><StatusPill value={event.eventType} /></td>
                      <td className="px-6 py-4">{formatShortDate(event.releaseDate)}</td>
                      <td className="px-6 py-4">{formatCurrency(event.basePrice)}</td>
                      <td className="px-6 py-4">
                        <StatusPill value={event.upcoming ? 'UPCOMING' : 'ARCHIVED'} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={removeEventPending}
                          onClick={() => onRemoveEvent(event)}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No events are available yet." />
          )}
        </TableCard>
      </div>
    );
  }

  if (activeSection === 'venues') {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Manage Venues"
          title="Venue capacity and address control"
          description="Review the configured venues, their layouts, and their seating capacity before scheduling more events."
          action={
            <button
              type="button"
              onClick={() => setShowVenueForm((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              <Plus className="h-4 w-4" />
              {showVenueForm ? 'Hide venue form' : 'Add venue'}
            </button>
          }
        />

        {showVenueForm ? (
          <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-950/40 p-3 text-cyan-100">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-white">New venue setup</h2>
                <p className="text-sm text-slate-300">Create a new venue and define its seating capacity.</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={onCreateVenue}>
              <div className="grid gap-4 xl:grid-cols-2">
                <FormField label="Venue name">
                  <BaseInput
                    required
                    value={venueForm.venueName}
                    onChange={(event) => onVenueFormChange('venueName', event.target.value)}
                    placeholder="Skyline Multiplex"
                  />
                </FormField>

                <FormField label="Venue type">
                  <BaseInput
                    value={venueForm.venueType}
                    onChange={(event) => onVenueFormChange('venueType', event.target.value)}
                    placeholder="Multiplex, Theater, Arena..."
                  />
                </FormField>

                <FormField label="City">
                  <BaseInput
                    required
                    value={venueForm.city}
                    onChange={(event) => onVenueFormChange('city', event.target.value)}
                    placeholder="Chennai"
                  />
                </FormField>

                <FormField label="Address line">
                  <BaseInput
                    required
                    value={venueForm.addressLine}
                    onChange={(event) => onVenueFormChange('addressLine', event.target.value)}
                    placeholder="123 Marina Road"
                  />
                </FormField>

                <FormField label="Total rows">
                  <BaseInput
                    required
                    type="number"
                    min="1"
                    value={venueForm.totalRows}
                    onChange={(event) => onVenueFormChange('totalRows', event.target.value)}
                  />
                </FormField>

                <FormField label="Seats per row">
                  <BaseInput
                    required
                    type="number"
                    min="1"
                    value={venueForm.seatsPerRow}
                    onChange={(event) => onVenueFormChange('seatsPerRow', event.target.value)}
                  />
                </FormField>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={createVenuePending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {createVenuePending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Create venue
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <TableCard title="Venue list" description="Every venue currently used by the booking platform.">
          {data.venues.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Venue ID</th>
                    <th className="px-6 py-4 font-medium">Venue</th>
                    <th className="px-6 py-4 font-medium">City</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Layout</th>
                    <th className="px-6 py-4 font-medium">Capacity</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.venues.map((venue) => (
                    <tr key={venue.venueId} className="text-slate-200">
                      <td className="px-6 py-4">{venue.venueId}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{venue.venueName}</p>
                        <p className="text-slate-400">{venue.addressLine}</p>
                      </td>
                      <td className="px-6 py-4">{venue.city}</td>
                      <td className="px-6 py-4">{venue.venueType || 'General'}</td>
                      <td className="px-6 py-4">{venue.totalRows} rows × {venue.seatsPerRow} seats</td>
                      <td className="px-6 py-4">{venue.totalConfiguredSeats}</td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={removeVenuePending}
                          onClick={() => onRemoveVenue(venue)}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No venues are configured yet." />
          )}
        </TableCard>
      </div>
    );
  }

  if (activeSection === 'seats') {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Manage Seats"
          title="Live seat inventory"
          description="Track available, held, and booked seats for each schedule so operational issues are visible immediately."
        />

        <TableCard title="Seat inventory by schedule" description="Seat status distribution and pricing range for every showtime.">
          {data.seatInventory.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Showtime</th>
                    <th className="px-6 py-4 font-medium">Venue</th>
                    <th className="px-6 py-4 font-medium">Available</th>
                    <th className="px-6 py-4 font-medium">Held</th>
                    <th className="px-6 py-4 font-medium">Booked</th>
                    <th className="px-6 py-4 font-medium">Price band</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.seatInventory.map((inventory) => (
                    <tr key={inventory.showtimeId} className="text-slate-200">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{inventory.title}</p>
                        <p className="text-slate-400">#{inventory.showtimeId}</p>
                      </td>
                      <td className="px-6 py-4">{inventory.theaterName} • {inventory.screenName}</td>
                      <td className="px-6 py-4">{inventory.availableSeats} / {inventory.totalSeats}</td>
                      <td className="px-6 py-4">{inventory.heldSeats}</td>
                      <td className="px-6 py-4">{inventory.bookedSeats}</td>
                      <td className="px-6 py-4">{formatCurrency(inventory.lowestPrice)} - {formatCurrency(inventory.highestPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Seat inventory will appear here once schedules exist." />
          )}
        </TableCard>
      </div>
    );
  }

  if (activeSection === 'schedules') {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Manage Schedules"
          title="Scheduling and showtime control"
          description="Use this area to monitor timing, occupancy, and cancellation status across every live schedule."
        />

        <TableCard title="Schedules" description="Each schedule includes venue, screen, time, pricing, and a direct cancel action.">
          {data.schedules.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Schedule</th>
                    <th className="px-6 py-4 font-medium">Venue</th>
                    <th className="px-6 py-4 font-medium">Timing</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Occupancy</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.schedules.map((schedule) => (
                    <tr key={schedule.showtimeId} className="text-slate-200">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{schedule.title}</p>
                        <p className="text-slate-400">{schedule.screenName} • {schedule.showFormat}</p>
                      </td>
                      <td className="px-6 py-4">{schedule.theaterName}, {schedule.city}</td>
                      <td className="px-6 py-4">
                        <p>{formatDateTime(schedule.startTime)}</p>
                        <p className="text-slate-400">Ends {formatDateTime(schedule.endTime)}</p>
                      </td>
                      <td className="px-6 py-4">{formatCurrency(schedule.price)}</td>
                      <td className="px-6 py-4">{schedule.bookedSeats} / {schedule.totalSeats} ({schedule.occupancyRate}%)</td>
                      <td className="px-6 py-4"><StatusPill value={schedule.status} /></td>
                      <td className="px-6 py-4">
                        {schedule.status === 'CANCELLED' ? (
                          <span className="text-slate-500">Already cancelled</span>
                        ) : (
                          <button
                            type="button"
                            disabled={cancelSchedulePending}
                            onClick={() => onCancelSchedule(schedule)}
                            className="rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Schedules will appear here after the first event is created." />
          )}
        </TableCard>
      </div>
    );
  }

  if (activeSection === 'event-seats') {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Manage Event Seats"
          title="Seat category mix per event"
          description="Review the VIP, premium, and regular seat split for each scheduled event."
        />

        <TableCard title="Seat category breakdown" description="This section focuses on seat mix rather than live seat status.">
          {data.eventSeats.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Event</th>
                    <th className="px-6 py-4 font-medium">Venue</th>
                    <th className="px-6 py-4 font-medium">VIP</th>
                    <th className="px-6 py-4 font-medium">Premium</th>
                    <th className="px-6 py-4 font-medium">Regular</th>
                    <th className="px-6 py-4 font-medium">Booked</th>
                    <th className="px-6 py-4 font-medium">Occupancy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.eventSeats.map((eventSeat) => (
                    <tr key={eventSeat.showtimeId} className="text-slate-200">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{eventSeat.title}</p>
                        <p className="text-slate-400">{eventSeat.eventType}</p>
                      </td>
                      <td className="px-6 py-4">{eventSeat.theaterName} • {eventSeat.screenName}</td>
                      <td className="px-6 py-4">{eventSeat.vipSeats}</td>
                      <td className="px-6 py-4">{eventSeat.premiumSeats}</td>
                      <td className="px-6 py-4">{eventSeat.regularSeats}</td>
                      <td className="px-6 py-4">{eventSeat.bookedSeats} / {eventSeat.totalSeats}</td>
                      <td className="px-6 py-4">{eventSeat.occupancyRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Seat category summaries will appear once schedules exist." />
          )}
        </TableCard>
      </div>
    );
  }

  if (activeSection === 'bookings') {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Manage Bookings"
          title="Customer booking records"
          description="This section surfaces booking references, customers, seat selections, and payment state in one place."
        />

        <TableCard title="Bookings" description="Live booking data from the backend booking store.">
          {data.bookings.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Booking</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Event</th>
                    <th className="px-6 py-4 font-medium">Seats</th>
                    <th className="px-6 py-4 font-medium">Booking</th>
                    <th className="px-6 py-4 font-medium">Payment</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.bookings.map((booking) => (
                    <tr key={booking.bookingId} className="text-slate-200">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{booking.bookingReference}</p>
                        <p className="text-slate-400">{formatDateTime(booking.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p>{booking.customerName}</p>
                        <p className="text-slate-400">{booking.customerContact}</p>
                      </td>
                      <td className="px-6 py-4">{booking.title}</td>
                      <td className="px-6 py-4">{booking.seats || 'Unassigned'}</td>
                      <td className="px-6 py-4"><StatusPill value={booking.bookingStatus} /></td>
                      <td className="px-6 py-4"><StatusPill value={booking.paymentStatus} /></td>
                      <td className="px-6 py-4">
                        <p>{formatCurrency(booking.totalAmount)}</p>
                        {Number(booking.refundAmount || 0) > 0 ? <p className="text-slate-400">Refund {formatCurrency(booking.refundAmount)}</p> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Bookings will show up here once customers complete checkout." />
          )}
        </TableCard>
      </div>
    );
  }

  if (activeSection === 'users') {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Manage Users"
          title="User access and verification"
          description="Review registered customers, their verification state, login provider, and current role."
          action={
            <button
              type="button"
              onClick={() => {
                if (showUserForm) {
                  setShowUserForm(false);
                  return;
                }
                onStartCreateUser();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              <Plus className="h-4 w-4" />
              {showUserForm ? 'Hide user form' : 'Create user'}
            </button>
          }
        />

        {showUserForm ? (
          <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-950/40 p-3 text-cyan-100">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-white">{editingUserId ? 'Update user account' : 'Create user account'}</h2>
                <p className="text-sm text-slate-300">Admins can create, edit, and manage user access directly from this workspace.</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={onSubmitUser}>
              <div className="grid gap-4 xl:grid-cols-2">
                <FormField label="Full name">
                  <BaseInput
                    required
                    value={userForm.fullName}
                    onChange={(event) => onUserFormChange('fullName', event.target.value)}
                    placeholder="Customer name"
                  />
                </FormField>

                <FormField label="Email">
                  <BaseInput
                    type="email"
                    value={userForm.email}
                    onChange={(event) => onUserFormChange('email', event.target.value)}
                    placeholder="customer@example.com"
                  />
                </FormField>

                <FormField label="Phone number">
                  <BaseInput
                    value={userForm.phoneNumber}
                    onChange={(event) => onUserFormChange('phoneNumber', event.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </FormField>

                <FormField label="Role">
                  <BaseSelect value={userForm.role} onChange={(event) => onUserFormChange('role', event.target.value)}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </BaseSelect>
                </FormField>

                <FormField label="Verified">
                  <BaseSelect
                    value={userForm.verified ? 'true' : 'false'}
                    onChange={(event) => onUserFormChange('verified', event.target.value === 'true')}
                  >
                    <option value="true">VERIFIED</option>
                    <option value="false">PENDING</option>
                  </BaseSelect>
                </FormField>

                <FormField label="Auth provider">
                  <BaseSelect value={userForm.authProvider} onChange={(event) => onUserFormChange('authProvider', event.target.value)}>
                    <option value="OTP">OTP</option>
                    <option value="PASSWORD">PASSWORD</option>
                    <option value="GOOGLE">GOOGLE</option>
                    <option value="APPLE">APPLE</option>
                    <option value="FACEBOOK">FACEBOOK</option>
                  </BaseSelect>
                </FormField>

                <FormField label="Preferred channel">
                  <BaseSelect value={userForm.preferredChannel} onChange={(event) => onUserFormChange('preferredChannel', event.target.value)}>
                    <option value="">Auto by contact</option>
                    <option value="EMAIL">EMAIL</option>
                    <option value="MOBILE">MOBILE</option>
                  </BaseSelect>
                </FormField>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={saveUserPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saveUserPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {editingUserId ? 'Update user' : 'Create user'}
                </button>
                {editingUserId ? (
                  <button
                    type="button"
                    onClick={() => {
                      onStartCreateUser();
                      setShowUserForm(false);
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/10"
                  >
                    Cancel edit
                  </button>
                ) : null}
                <p className="text-sm text-slate-300">Provide at least one contact method: email or phone.</p>
              </div>
            </form>
          </div>
        ) : null}

        <TableCard title="Users" description="Accounts that exist in the application database.">
          {data.users.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Verified</th>
                    <th className="px-6 py-4 font-medium">Provider</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.users.map((account) => (
                    <tr key={account.userId} className="text-slate-200">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{account.fullName}</p>
                        <p className="text-slate-400">User #{account.userId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p>{account.email || 'No email'}</p>
                        <p className="text-slate-400">{account.phoneNumber || 'No phone'}</p>
                      </td>
                      <td className="px-6 py-4"><StatusPill value={account.verified ? 'VERIFIED' : 'PENDING'} /></td>
                      <td className="px-6 py-4">{account.authProvider}</td>
                      <td className="px-6 py-4"><StatusPill value={account.role} /></td>
                      <td className="px-6 py-4">{formatDateTime(account.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onStartEditUser(account)}
                            className="inline-flex items-center gap-1 rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-sky-100 transition hover:bg-sky-400/20"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deleteUserPending}
                            onClick={() => onDeleteUser(account)}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No users have signed up yet." />
          )}
        </TableCard>
      </div>
    );
  }

  if (activeSection === 'payments') {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Manage Payments"
          title="Payment and refund trail"
          description="Monitor payment method, status, transaction reference, and refunds across the booking lifecycle."
        />

        <TableCard title="Payments" description="Payment records derived from the current booking data.">
          {data.payments.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Booking</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Event</th>
                    <th className="px-6 py-4 font-medium">Method</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.payments.map((payment) => (
                    <tr key={payment.bookingId} className="text-slate-200">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{payment.bookingReference}</p>
                        <p className="text-slate-400">{formatDateTime(payment.updatedAt)}</p>
                      </td>
                      <td className="px-6 py-4">{payment.customerName}</td>
                      <td className="px-6 py-4">{payment.title}</td>
                      <td className="px-6 py-4">{formatPaymentMethod(payment.paymentMethod)}</td>
                      <td className="px-6 py-4"><StatusPill value={payment.paymentStatus} /></td>
                      <td className="px-6 py-4">
                        <p>{formatCurrency(payment.totalAmount)}</p>
                        {Number(payment.refundAmount || 0) > 0 ? <p className="text-slate-400">Refund {formatCurrency(payment.refundAmount)}</p> : null}
                      </td>
                      <td className="px-6 py-4">{payment.paymentReference || 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Payments will appear here after bookings are confirmed." />
          )}
        </TableCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Manage Cancellations"
        title="Cancellations and refund review"
        description="Cancelled showtimes and booking-level refunds are grouped here for quick operational review."
      />

      <TableCard title="Cancellations" description="Schedule cancellations and refunded bookings in one list.">
        {data.cancellations.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium">Event</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Refund</th>
                  <th className="px-6 py-4 font-medium">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.cancellations.map((cancellation, index) => (
                  <tr key={`${cancellation.cancellationType}-${cancellation.referenceId}-${index}`} className="text-slate-200">
                    <td className="px-6 py-4"><StatusPill value={cancellation.cancellationType} /></td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{cancellation.referenceLabel}</p>
                      <p className="text-slate-400">{formatDateTime(cancellation.updatedAt)}</p>
                    </td>
                    <td className="px-6 py-4">{cancellation.title}</td>
                    <td className="px-6 py-4">{cancellation.customerName || 'System-wide'}</td>
                    <td className="px-6 py-4"><StatusPill value={cancellation.status} /></td>
                    <td className="px-6 py-4">{formatCurrency(cancellation.refundAmount)}</td>
                    <td className="px-6 py-4">{cancellation.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No cancellations have been recorded yet." />
        )}
      </TableCard>
    </div>
  );
}

export function AdminPage() {
  const { token, isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [eventForm, setEventForm] = useState(createDefaultEventForm);
  const [userForm, setUserForm] = useState(createDefaultUserForm);
  const [venueForm, setVenueForm] = useState(createDefaultVenueForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [notice, setNotice] = useState(null);

  const activeSection = resolveActiveSection(location.pathname);

  const adminQuery = useQuery({
    queryKey: ['admin-panel'],
    queryFn: ({ signal }) => apiFetch('/api/admin/dashboard', { token, signal }),
    enabled: isAuthenticated && isAdmin,
  });

  const createEventMutation = useMutation({
    mutationFn: (payload) =>
      apiFetch('/api/admin/showtimes', {
        method: 'POST',
        token,
        body: payload,
      }),
    onSuccess: () => {
      setNotice({ type: 'success', message: 'The event, schedule, and seat map were created successfully.' });
      setShowCreateForm(false);
      setEventForm(createDefaultEventForm());
      queryClient.invalidateQueries({ queryKey: ['admin-panel'] });
    },
    onError: (error) => {
      setNotice({ type: 'error', message: error.message });
    },
  });

  const cancelScheduleMutation = useMutation({
    mutationFn: ({ showtimeId, reason }) =>
      apiFetch(`/api/admin/showtimes/${showtimeId}/cancel`, {
        method: 'POST',
        token,
        body: { reason },
      }),
    onSuccess: () => {
      setNotice({ type: 'success', message: 'The schedule was cancelled and the admin data has been refreshed.' });
      queryClient.invalidateQueries({ queryKey: ['admin-panel'] });
    },
    onError: (error) => {
      setNotice({ type: 'error', message: error.message });
    },
  });

  const removeEventMutation = useMutation({
    mutationFn: ({ eventId, reason }) =>
      apiFetch(`/api/admin/events/${eventId}/remove`, {
        method: 'POST',
        token,
        body: { reason },
      }),
    onSuccess: () => {
      setNotice({ type: 'success', message: 'The event was removed and related schedules were cancelled.' });
      queryClient.invalidateQueries({ queryKey: ['admin-panel'] });
    },
    onError: (error) => {
      setNotice({ type: 'error', message: error.message });
    },
  });

  const sendTestEmailMutation = useMutation({
    mutationFn: ({ email }) =>
      apiFetch('/api/admin/notifications/email/test', {
        method: 'POST',
        token,
        body: { email },
      }),
    onSuccess: () => {
      setNotice({ type: 'success', message: 'Test email request sent. Check inbox and backend logs for delivery status.' });
    },
    onError: (error) => {
      setNotice({ type: 'error', message: error.message });
    },
  });

  const createVenueMutation = useMutation({
    mutationFn: (payload) =>
      apiFetch('/api/admin/venues', {
        method: 'POST',
        token,
        body: payload,
      }),
    onSuccess: () => {
      setNotice({ type: 'success', message: 'The venue was created successfully.' });
      setShowVenueForm(false);
      setVenueForm(createDefaultVenueForm());
      queryClient.invalidateQueries({ queryKey: ['admin-panel'] });
    },
    onError: (error) => {
      setNotice({ type: 'error', message: error.message });
    },
  });

  const removeVenueMutation = useMutation({
    mutationFn: ({ venueId }) =>
      apiFetch(`/api/admin/venues/${venueId}`, {
        method: 'DELETE',
        token,
      }),
    onSuccess: () => {
      setNotice({ type: 'success', message: 'The venue was removed successfully.' });
      queryClient.invalidateQueries({ queryKey: ['admin-panel'] });
    },
    onError: (error) => {
      setNotice({ type: 'error', message: error.message });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (payload) =>
      apiFetch('/api/admin/users', {
        method: 'POST',
        token,
        body: payload,
      }),
    onSuccess: () => {
      setNotice({ type: 'success', message: 'User account created successfully.' });
      setShowUserForm(false);
      setUserForm(createDefaultUserForm());
      setEditingUserId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-panel'] });
    },
    onError: (error) => {
      setNotice({ type: 'error', message: error.message });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }) =>
      apiFetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        token,
        body: payload,
      }),
    onSuccess: () => {
      setNotice({ type: 'success', message: 'User account updated successfully.' });
      setShowUserForm(false);
      setUserForm(createDefaultUserForm());
      setEditingUserId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-panel'] });
    },
    onError: (error) => {
      setNotice({ type: 'error', message: error.message });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: ({ userId }) =>
      apiFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        token,
      }),
    onSuccess: () => {
      setNotice({ type: 'success', message: 'User account deleted successfully.' });
      queryClient.invalidateQueries({ queryKey: ['admin-panel'] });
    },
    onError: (error) => {
      setNotice({ type: 'error', message: error.message });
    },
  });

  const handleEventFormChange = (field, value) => {
    if (field === 'genrePreset') {
      const selectedPreset = resolveGenrePreset(value);
      setEventForm((current) => ({
        ...current,
        genrePreset: selectedPreset.key,
        eventType: selectedPreset.eventType,
        genre: selectedPreset.genre,
      }));
      return;
    }

    setEventForm((current) => ({ ...current, [field]: value }));
  };

  const handleVenueFormChange = (field, value) => {
    setVenueForm((current) => ({ ...current, [field]: value }));
  };

  const handleUserFormChange = (field, value) => {
    setUserForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateEvent = (event) => {
    event.preventDefault();
    setNotice(null);
    createEventMutation.mutate(buildCreateEventPayload(eventForm));
  };

  const handleCancelSchedule = (schedule) => {
    const reason = window.prompt(`Enter a cancellation reason for "${schedule.title}"`);
    if (!reason) {
      return;
    }

    setNotice(null);
    cancelScheduleMutation.mutate({
      showtimeId: schedule.showtimeId,
      reason,
    });
  };

  const handleRemoveEvent = (event) => {
    const reason = window.prompt(`Enter a reason to remove "${event.title}" from the catalog`);
    if (!reason) {
      return;
    }

    setNotice(null);
    removeEventMutation.mutate({
      eventId: event.eventId,
      reason,
    });
  };

  const handleCreateVenue = (event) => {
    event.preventDefault();
    setNotice(null);
    createVenueMutation.mutate({
      venueName: venueForm.venueName.trim(),
      venueType: venueForm.venueType.trim() || null,
      city: venueForm.city.trim(),
      addressLine: venueForm.addressLine.trim(),
      totalRows: Number(venueForm.totalRows),
      seatsPerRow: Number(venueForm.seatsPerRow),
    });
  };

  const handleRemoveVenue = (venue) => {
    const confirmed = window.confirm(`Are you sure you want to remove "${venue.venueName}"?`);
    if (!confirmed) {
      return;
    }

    setNotice(null);
    removeVenueMutation.mutate({ venueId: venue.venueId });
  };

  const handleSendTestEmail = () => {
    const defaultEmail = user?.email || '';
    const email = window.prompt('Enter the recipient email for a test notification', defaultEmail);
    if (!email) {
      return;
    }

    setNotice(null);
    sendTestEmailMutation.mutate({ email: email.trim() });
  };

  const handleStartCreateUser = () => {
    setEditingUserId(null);
    setUserForm(createDefaultUserForm());
    setShowUserForm(true);
  };

  const handleStartEditUser = (account) => {
    setEditingUserId(account.userId);
    setUserForm(toUserFormState(account));
    setShowUserForm(true);
    setNotice(null);
  };

  const handleSubmitUser = (event) => {
    event.preventDefault();
    setNotice(null);
    const payload = buildUserPayload(userForm);

    if (editingUserId) {
      updateUserMutation.mutate({ userId: editingUserId, payload });
      return;
    }
    createUserMutation.mutate(payload);
  };

  const handleDeleteUser = (account) => {
    const confirmed = window.confirm(`Delete user "${account.fullName}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setNotice(null);
    deleteUserMutation.mutate({ userId: account.userId });
  };

  if (!isAuthenticated) {
    return (
      <section className="section-shell py-10">
        <div className="glass-card p-10 text-center">
          <p className="font-display text-3xl font-bold text-white">Admin access requires login.</p>
          <p className="mt-2 text-slate-400">Use the Admin Login option from the auth modal.</p>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="section-shell py-10">
        <div className="glass-card p-10 text-center">
          <p className="font-display text-3xl font-bold text-white">Admin access only.</p>
          <p className="mt-2 text-slate-400">This workspace is reserved for authenticated admin accounts.</p>
          <Link to="/" className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            Back to discovery
          </Link>
        </div>
      </section>
    );
  }

  if (adminQuery.isLoading) {
    return (
      <section className="section-shell py-10">
        <div className="glass-card p-10 text-center text-slate-300">Loading admin workspace...</div>
      </section>
    );
  }

  if (adminQuery.error) {
    return (
      <section className="section-shell py-10">
        <div className="glass-card p-10 text-center">
          <p className="font-display text-3xl font-bold text-white">We couldn&apos;t load the admin panel.</p>
          <p className="mt-2 text-slate-400">{adminQuery.error.message}</p>
        </div>
      </section>
    );
  }

  const data = adminQuery.data;
  const sectionCountLookup = {
    dashboard: null,
    events: data.events.length,
    venues: data.venues.length,
    seats: data.seatInventory.length,
    schedules: data.schedules.length,
    'event-seats': data.eventSeats.length,
    bookings: data.bookings.length,
    users: data.users.length,
    payments: data.payments.length,
    cancellations: data.cancellations.length,
  };

  return (
    <section className="section-shell py-8">
      <div className="grid gap-6 xl:grid-cols-[300px,minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.95),rgba(8,145,178,0.82)_45%,rgba(8,47,73,0.95))] p-6 text-slate-950 shadow-[0_20px_60px_rgba(6,182,212,0.12)]">
          <div>
            <p className="font-display text-4xl font-bold text-white">Admin Panel</p>
            <p className="mt-4 text-lg font-semibold text-white">{user.fullName}</p>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-50/80">{user.role}</p>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-slate-950/20 p-4 text-sm text-cyan-50">
            <p className="font-semibold">Operations workspace</p>
            <p className="mt-2 text-cyan-50/80">Events, venues, seating, schedules, users, payments, and cancellations now live in one admin view.</p>
          </div>

          <nav className="mt-8 space-y-2">
            {ADMIN_SECTIONS.map((section) => (
              <SidebarLink key={section.key} section={section} count={sectionCountLookup[section.key]} />
            ))}
          </nav>

          <div className="mt-8 flex items-center gap-3 rounded-[1.5rem] bg-slate-950/20 p-4 text-sm text-cyan-50">
            <MonitorPlay className="h-5 w-5" />
            <div>
              <p className="font-semibold">Live admin sync</p>
              <p className="text-cyan-50/80">Refresh after backend changes to pull the latest control data.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950/25 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-950/35"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <div className="space-y-6">
          <NoticeBanner notice={notice} />

          <AdminPageContent
            activeSection={activeSection}
            data={data}
            eventForm={eventForm}
            userForm={userForm}
            onEventFormChange={handleEventFormChange}
            onUserFormChange={handleUserFormChange}
            onCreateEvent={handleCreateEvent}
            onSubmitUser={handleSubmitUser}
            onRemoveEvent={handleRemoveEvent}
            onStartCreateUser={handleStartCreateUser}
            onStartEditUser={handleStartEditUser}
            onDeleteUser={handleDeleteUser}
            onSendTestEmail={handleSendTestEmail}
            showCreateForm={showCreateForm}
            showUserForm={showUserForm}
            editingUserId={editingUserId}
            setShowCreateForm={setShowCreateForm}
            setShowUserForm={setShowUserForm}
            createEventPending={createEventMutation.isPending}
            saveUserPending={createUserMutation.isPending || updateUserMutation.isPending}
            deleteUserPending={deleteUserMutation.isPending}
            removeEventPending={removeEventMutation.isPending}
            sendTestEmailPending={sendTestEmailMutation.isPending}
            onCancelSchedule={handleCancelSchedule}
            cancelSchedulePending={cancelScheduleMutation.isPending}
            venueForm={venueForm}
            onVenueFormChange={handleVenueFormChange}
            onCreateVenue={handleCreateVenue}
            onRemoveVenue={handleRemoveVenue}
            showVenueForm={showVenueForm}
            setShowVenueForm={setShowVenueForm}
            createVenuePending={createVenueMutation.isPending}
            removeVenuePending={removeVenueMutation.isPending}
          />
        </div>
      </div>
    </section>
  );
}
