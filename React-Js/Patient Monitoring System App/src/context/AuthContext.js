import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

const normalizeAuthData = (data = {}) => {
  const token = data.token || data.accessToken || data.jwt || '';
  const email = data.email || data.user?.email || '';
  const role = data.role || data.user?.role || '';
  const rawUserId = data.userId ?? data.id ?? data.user?.userId ?? data.user?.id;
  const parsedUserId = Number(rawUserId);
  const userId = Number.isFinite(parsedUserId) ? parsedUserId : null;
  const name = data.name || data.user?.name || data.user?.fullName || '';

  return { token, email, role, userId, name };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('name');

    if (token && email && role) {
      const parsedUserId = Number(userId);
      setUser({
        token,
        email,
        role,
        userId: Number.isFinite(parsedUserId) ? parsedUserId : null,
        name,
      });
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    const authData = normalizeAuthData(data);

    if (!authData.token || !authData.email || !authData.role) {
      throw new Error('Invalid login response from server');
    }

    localStorage.setItem('token', authData.token);
    localStorage.setItem('email', authData.email);
    localStorage.setItem('role', authData.role);
    localStorage.setItem('userId', authData.userId ?? '');
    localStorage.setItem('name', authData.name || authData.email);
    setUser({
      ...authData,
      name: authData.name || authData.email,
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
