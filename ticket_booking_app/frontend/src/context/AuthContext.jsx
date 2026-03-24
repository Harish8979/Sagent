import { createContext, useContext, useEffect, useState } from 'react';

import { apiFetch } from '../lib/api';

const AUTH_STORAGE_KEY = 'pulse-seats-auth';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (authState) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
      return;
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [authState]);

  const applyAuthResponse = (response) => {
    setAuthState({
      token: response.token,
      expiresAt: response.expiresAt,
      user: response.user,
    });

    return response;
  };

  const requestOtp = (payload) =>
    apiFetch('/api/auth/request-otp', {
      method: 'POST',
      body: payload,
    });

  const verifyOtp = (payload) =>
    apiFetch('/api/auth/verify-otp', {
      method: 'POST',
      body: payload,
    }).then(applyAuthResponse);

  const registerWithPassword = (payload) =>
    apiFetch('/api/auth/register', {
      method: 'POST',
      body: payload,
    }).then(applyAuthResponse);

  const loginWithPassword = (payload) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: payload,
    }).then(applyAuthResponse);

  const socialLogin = (payload) =>
    apiFetch('/api/auth/social-login', {
      method: 'POST',
      body: payload,
    }).then(applyAuthResponse);

  const requestPasswordReset = (payload) =>
    apiFetch('/api/auth/password-reset/request', {
      method: 'POST',
      body: payload,
    });

  const confirmPasswordReset = (payload) =>
    apiFetch('/api/auth/password-reset/confirm', {
      method: 'POST',
      body: payload,
    }).then(applyAuthResponse);

  const logout = () => setAuthState(null);

  return (
    <AuthContext.Provider
      value={{
        user: authState?.user ?? null,
        token: authState?.token ?? null,
        isAuthenticated: Boolean(authState?.token),
        requestOtp,
        verifyOtp,
        registerWithPassword,
        loginWithPassword,
        socialLogin,
        requestPasswordReset,
        confirmPasswordReset,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
