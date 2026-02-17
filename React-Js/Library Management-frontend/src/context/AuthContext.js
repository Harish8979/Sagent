import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isLibrarian = () => {
    return user && user.role === 'LIBRARIAN';
  };

  const isStudent = () => {
    return user && user.role === 'STUDENT';
  };

  const isStaff = () => {
    return user && user.role === 'STAFF';
  };

  const canBorrow = () => {
    return user && (user.role === 'STUDENT' || user.role === 'STAFF');
  };

  const canManageBooks = () => {
    return user && user.role === 'LIBRARIAN';
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isLibrarian,
      isStudent,
      isStaff,
      canBorrow,
      canManageBooks
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
