import { CalendarClock, CircleDot, Ticket, UserCircle2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { AuthModal } from './AuthModal';

export function AppShell({ children }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const { connected } = useSession();
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalMode('login');
  };

  const navClassName = ({ isActive }) =>
    [
      'rounded-full px-4 py-2 text-sm font-medium transition',
      isActive
        ? 'bg-white/12 text-white'
        : 'text-slate-300 hover:bg-white/6 hover:text-white',
    ].join(' ');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/75 backdrop-blur-2xl shadow-lg shadow-black/20">
        <div className="section-shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember-500/20 text-ember-100 shadow-[0_0_20px_rgba(251,146,60,0.15)]">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-white">PulseSeats</p>
              <p className="text-sm text-slate-400">Live booking across movies and events</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <nav className="flex flex-wrap items-center gap-2">
              {!isAdmin ? (
                <>
                  <NavLink to="/" className={navClassName}>
                    Discovery
                  </NavLink>
                  <NavLink to="/bookings" className={navClassName}>
                    My Bookings
                  </NavLink>
                </>
              ) : null}
              {isAdmin ? (
                <NavLink to="/admin" className={navClassName}>
                  Admin
                </NavLink>
              ) : null}
            </nav>

            <div className="flex items-center gap-3">
              {connected ? (
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  <CircleDot className="h-4 w-4 text-emerald-400" />
                  Live seat sync connected
                </div>
              ) : null}

              {isAuthenticated ? (
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-white">
                      {user.fullName}
                      {isAdmin ? (
                        <span className="ml-2 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-950">
                          Admin
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-400">{user.email || user.phoneNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
              className="inline-flex items-center gap-2 rounded-full bg-ember-500 px-5 py-2 text-sm font-bold text-slate-950 shadow-md shadow-ember-500/20 transition-all hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/30"
                >
                  <UserCircle2 className="h-4 w-4" />
                  Sign in / Sign up
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/10 bg-slate-950/70">
        <div className="section-shell flex flex-col gap-2 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Seat selections stay active for the session until payment is completed.
          </div>
        </div>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} initialMode={authModalMode} />
    </div>
  );
}
