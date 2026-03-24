import {
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MessageSquareText,
  ShieldCheck,
  UserCircle2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const MODE_OPTIONS = [
  { value: 'login', label: 'Login' },
  { value: 'signup', label: 'Sign up' },
  { value: 'recover', label: 'Recover' },
  { value: 'admin', label: 'Admin Login' },
];

const CHANNEL_OPTIONS = [
  { value: 'EMAIL', label: 'Email OTP', icon: Mail },
  { value: 'MOBILE', label: 'Mobile OTP', icon: MessageSquareText },
];

const LOGIN_METHOD_OPTIONS = [
  { value: 'OTP', label: 'OTP access' },
  { value: 'PASSWORD', label: 'Password' },
];

const SOCIAL_OPTIONS = [
  { value: 'GOOGLE', label: 'Google' },
  { value: 'APPLE', label: 'Apple' },
  { value: 'FACEBOOK', label: 'Facebook' },
];

const DEFAULT_STATE = {
  mode: 'login',
  loginMethod: 'OTP',
  channel: 'EMAIL',
  otpStep: 'request',
  signupStep: 'request',
  recoveryStep: 'request',
  fullName: '',
  email: '',
  phoneNumber: '',
  identifier: '',
  password: '',
  otpTarget: '',
  otpCode: '',
  debugOtp: '',
  feedbackMessage: '',
  recoveryTarget: '',
  recoveryOtpCode: '',
  recoveryDebugOtp: '',
  newPassword: '',
  recoveryMessage: '',
  loading: false,
  error: '',
};

const createInitialState = (mode = 'login') => ({
  ...DEFAULT_STATE,
  mode,
  identifier: mode === 'admin' ? 'harishgp2005@gmail.com' : '',
});

export function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const {
    requestOtp,
    verifyOtp,
    registerWithPassword,
    loginWithPassword,
    socialLogin,
    requestPasswordReset,
    confirmPasswordReset,
    logout,
    isAuthenticated,
  } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState(() => createInitialState(initialMode));

  useEffect(() => {
    if (isOpen) {
      setState(createInitialState(initialMode));
    }
  }, [initialMode, isOpen]);

  if (!isOpen || (isAuthenticated && state.mode !== 'admin')) {
    return null;
  }

  const patchState = (patch) => setState((current) => ({ ...current, ...patch }));

  const switchMode = (mode) => {
    setState((current) => ({
      ...current,
      mode,
      identifier: mode === 'admin' ? 'harishgp2005@gmail.com' : current.identifier,
      password: mode === 'admin' ? '' : current.password,
      error: '',
      feedbackMessage: '',
      recoveryMessage: '',
      debugOtp: '',
      recoveryDebugOtp: '',
      otpCode: '',
      recoveryOtpCode: '',
      otpTarget: '',
      recoveryTarget: '',
      otpStep: 'request',
      signupStep: 'request',
      recoveryStep: 'request',
    }));
  };

  const beginSubmit = () => patchState({ loading: true, error: '' });
  const failSubmit = (error) => patchState({ error: error.message || 'Something went wrong', loading: false });

  const handleOtpRequest = async (event) => {
    event.preventDefault();
    beginSubmit();

    try {
      const response = await requestOtp({
        channel: state.channel,
        fullName: state.fullName,
        email: state.channel === 'EMAIL' ? state.email : '',
        phoneNumber: state.channel === 'MOBILE' ? state.phoneNumber : '',
      });

      patchState({
        otpTarget: response.target,
        feedbackMessage: response.message,
        otpStep: 'verify',
        otpCode: '',
        loading: false,
      });
    } catch (error) {
      failSubmit(error);
    }
  };

  const handleOtpVerify = async (event) => {
    event.preventDefault();
    beginSubmit();

    try {
      await verifyOtp({
        target: state.otpTarget,
        channel: state.channel,
        otpCode: state.otpCode,
      });
      onClose();
    } catch (error) {
      failSubmit(error);
    }
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    beginSubmit();

    try {
      await loginWithPassword({
        identifier: state.identifier,
        password: state.password,
      });
      onClose();
    } catch (error) {
      failSubmit(error);
    }
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    beginSubmit();

    try {
      const response = await loginWithPassword({
        identifier: state.identifier,
        password: state.password,
      });

      if (response.user?.role !== 'ADMIN') {
        logout();
        patchState({
          loading: false,
          error: 'These credentials do not belong to an admin account.',
        });
        return;
      }

      onClose();
      navigate('/admin');
    } catch (error) {
      failSubmit(error);
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    beginSubmit();

    try {
      if (!state.email.trim() && !state.phoneNumber.trim()) {
        patchState({
          loading: false,
          error: 'Add at least one contact method (email or mobile number) to sign up.',
        });
        return;
      }

      await registerWithPassword({
        fullName: state.fullName,
        email: state.email,
        phoneNumber: state.phoneNumber,
        password: state.password,
      });
      onClose();
    } catch (error) {
      failSubmit(error);
    }
  };

  const handleSocialLogin = async (provider) => {
    beginSubmit();

    try {
      await socialLogin({
        provider,
        fullName: state.fullName,
        email: state.email,
      });
      onClose();
    } catch (error) {
      failSubmit(error);
    }
  };

  const handlePasswordResetRequest = async (event) => {
    event.preventDefault();
    beginSubmit();

    try {
      const response = await requestPasswordReset({
        channel: state.channel,
        email: state.channel === 'EMAIL' ? state.email : '',
        phoneNumber: state.channel === 'MOBILE' ? state.phoneNumber : '',
      });

      patchState({
        recoveryTarget: response.target,
        recoveryMessage: response.message,
        recoveryStep: 'verify',
        recoveryOtpCode: '',
        loading: false,
      });
    } catch (error) {
      failSubmit(error);
    }
  };

  const handlePasswordResetConfirm = async (event) => {
    event.preventDefault();
    beginSubmit();

    try {
      await confirmPasswordReset({
        target: state.recoveryTarget,
        channel: state.channel,
        otpCode: state.recoveryOtpCode,
        newPassword: state.newPassword,
      });
      onClose();
    } catch (error) {
      failSubmit(error);
    }
  };

  const renderChannelOptions = () => (
    <div className="grid gap-2 sm:grid-cols-2">
      {CHANNEL_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = option.value === state.channel;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => patchState({ channel: option.value, error: '' })}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              selected
                ? 'border-amber-300/70 bg-amber-300/15 text-white'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <Icon className="mb-3 h-4 w-4" />
            <p className="font-medium">{option.label}</p>
          </button>
        );
      })}
    </div>
  );

  const renderContactField = () =>
    state.channel === 'EMAIL' ? (
      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Email address</span>
        <input
          type="email"
          required
          value={state.email}
          onChange={(event) => patchState({ email: event.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
          placeholder="moviegoer@example.com"
        />
      </label>
    ) : (
      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Mobile number</span>
        <input
          required
          value={state.phoneNumber}
          onChange={(event) => patchState({ phoneNumber: event.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
          placeholder="+91 98765 43210"
        />
      </label>
    );

  const renderError = () => (state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null);

  const renderLoadingButton = (label, icon) => (
    <button
      type="submit"
      disabled={state.loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-3 font-bold text-slate-950 shadow-md shadow-amber-300/20 transition-all hover:-translate-y-0.5 hover:bg-amber-200 hover:shadow-lg hover:shadow-amber-300/30 disabled:pointer-events-none disabled:opacity-70 disabled:transform-none"
    >
      {state.loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </button>
  );

  const renderLoginView = () => (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-2">
        {LOGIN_METHOD_OPTIONS.map((option) => {
          const selected = option.value === state.loginMethod;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                patchState({
                  loginMethod: option.value,
                  error: '',
                  otpStep: 'request',
                  otpCode: '',
                  otpTarget: '',
                  debugOtp: '',
                  feedbackMessage: '',
                })
              }
              className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                selected
                  ? 'border-sky-300/70 bg-sky-300/15 text-white'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {state.loginMethod === 'OTP' ? (
        state.otpStep === 'request' ? (
          <form className="space-y-4" onSubmit={handleOtpRequest}>
            {renderChannelOptions()}

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Full name</span>
              <input
                value={state.fullName}
                onChange={(event) => patchState({ fullName: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
                placeholder="Your name"
              />
            </label>

            {renderContactField()}
            {renderError()}
            {renderLoadingButton('Request OTP', <ShieldCheck className="h-4 w-4" />)}
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleOtpVerify}>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
              <p className="font-medium">{state.feedbackMessage || 'OTP sent successfully'}</p>
              <p className="mt-1 text-emerald-100/80">Target: {state.otpTarget}</p>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Enter OTP</span>
              <input
                required
                value={state.otpCode}
                onChange={(event) => patchState({ otpCode: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
                placeholder="6-digit code"
              />
            </label>

            {renderError()}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  patchState({
                    otpStep: 'request',
                    error: '',
                    otpCode: '',
                    debugOtp: '',
                    feedbackMessage: '',
                  })
                }
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
              >
                Edit target
              </button>
              <button
                type="submit"
                disabled={state.loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {state.loading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Verify and continue
              </button>
            </div>
          </form>
        )
      ) : (
        <form className="space-y-4" onSubmit={handlePasswordLogin}>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email or mobile</span>
            <input
              required
              value={state.identifier}
              onChange={(event) => patchState({ identifier: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
              placeholder="moviegoer@example.com or +91 98765 43210"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <input
              type="password"
              required
              value={state.password}
              onChange={(event) => patchState({ password: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
              placeholder="Your password"
            />
          </label>

          <div className="flex items-center justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={() => switchMode('recover')}
              className="text-amber-200 transition hover:text-amber-100"
            >
              Forgot password?
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="text-slate-400 transition hover:text-white"
            >
              Need an account?
            </button>
          </div>

          {renderError()}
          {renderLoadingButton('Login with password', <LockKeyhole className="h-4 w-4" />)}
        </form>
      )}
    </div>
  );

  const renderSignUpView = () => (
    <form className="space-y-4" onSubmit={handleSignUp}>
      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Full name</span>
        <input
          required
          value={state.fullName}
          onChange={(event) => patchState({ fullName: event.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
          placeholder="Your name"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Email address</span>
        <input
          type="email"
          value={state.email}
          onChange={(event) => patchState({ email: event.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
          placeholder="moviegoer@example.com"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Mobile number</span>
        <input
          value={state.phoneNumber}
          onChange={(event) => patchState({ phoneNumber: event.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
          placeholder="+91 98765 43210"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Password</span>
        <input
          type="password"
          required
          value={state.password}
          onChange={(event) => patchState({ password: event.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
          placeholder="At least 6 characters"
        />
      </label>

      <p className="text-sm text-slate-400">Use email, mobile, or both. At least one contact method is required.</p>

      {renderError()}
      {renderLoadingButton('Create account', <UserCircle2 className="h-4 w-4" />)}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-white">Social sign-in demo</p>
        <p className="mt-1 text-sm text-slate-400">
          Enter your name and email above, then continue with a provider.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {SOCIAL_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={state.loading}
              onClick={() => handleSocialLogin(option.value)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Globe2 className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );

  const renderRecoverView = () => (
    <div className="space-y-5">
      {state.recoveryStep === 'request' ? (
        <form className="space-y-4" onSubmit={handlePasswordResetRequest}>
          {renderChannelOptions()}
          {renderContactField()}
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">New password</span>
            <input
              type="password"
              required
              value={state.newPassword}
              onChange={(event) => patchState({ newPassword: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
              placeholder="Choose a new password"
            />
          </label>
          {renderError()}
          {renderLoadingButton('Send recovery OTP', <ShieldCheck className="h-4 w-4" />)}
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handlePasswordResetConfirm}>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
            <p className="font-medium">{state.recoveryMessage || 'Recovery OTP sent successfully'}</p>
            <p className="mt-1 text-emerald-100/80">Target: {state.recoveryTarget}</p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Enter OTP</span>
            <input
              required
              value={state.recoveryOtpCode}
              onChange={(event) => patchState({ recoveryOtpCode: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
              placeholder="6-digit code"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">New password</span>
            <input
              type="password"
              required
              value={state.newPassword}
              onChange={(event) => patchState({ newPassword: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
              placeholder="Choose a new password"
            />
          </label>

          {renderError()}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                patchState({
                  recoveryStep: 'request',
                  error: '',
                  recoveryTarget: '',
                  recoveryOtpCode: '',
                  recoveryDebugOtp: '',
                  recoveryMessage: '',
                })
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Edit target
            </button>
            <button
              type="submit"
              disabled={state.loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {state.loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <LockKeyhole className="h-4 w-4" />
              )}
              Reset password
            </button>
          </div>
        </form>
      )}
    </div>
  );

  const renderAdminView = () => (
    <form className="space-y-4" onSubmit={handleAdminLogin}>
      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
        <p className="font-medium">Separate admin access</p>
        <p className="mt-1 text-amber-50/80">
          This path is reserved for the configured admin credentials and opens the protected operations dashboard.
        </p>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Admin email</span>
        <input
          type="email"
          required
          value={state.identifier}
          onChange={(event) => patchState({ identifier: event.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
          placeholder="harishgp2005@gmail.com"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Admin password</span>
        <input
          type="password"
          required
          value={state.password}
          onChange={(event) => patchState({ password: event.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/70"
          placeholder="Enter admin password"
        />
      </label>

      {renderError()}
      {renderLoadingButton('Login as admin', <LockKeyhole className="h-4 w-4" />)}
    </form>
  );

  const title =
    state.mode === 'signup'
      ? 'Create a PulseSeats account.'
      : state.mode === 'recover'
      ? 'Recover your account with OTP.'
      : state.mode === 'admin'
      ? 'Open the protected admin console.'
      : 'Sign in your way and keep booking.';

  const subtitle =
    state.mode === 'signup'
      ? 'Register with password, email, mobile, or a social profile.'
      : state.mode === 'recover'
      ? 'Reset forgotten passwords through email or SMS OTP.'
      : state.mode === 'admin'
      ? 'Admin login is separated from customer login and requires the configured admin credentials.'
      : 'Choose OTP or password access, then continue to seat selection.';

  const visibleModes = isAuthenticated ? MODE_OPTIONS.filter((option) => option.value === 'admin') : MODE_OPTIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl overflow-hidden border-white/15">
        <div className="bg-hero-grid p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-200/80">Account Access</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white">{title}</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-200/80">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 transition-all hover:scale-110 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {visibleModes.map((option) => {
              const selected = option.value === state.mode;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => switchMode(option.value)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    selected
                      ? 'border-amber-300/70 bg-amber-300/15 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5 p-6">
          {state.mode === 'login' ? renderLoginView() : null}
          {state.mode === 'signup' ? renderSignUpView() : null}
          {state.mode === 'recover' ? renderRecoverView() : null}
          {state.mode === 'admin' ? renderAdminView() : null}
        </div>
      </div>
    </div>
  );
}
