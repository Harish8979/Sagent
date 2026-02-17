import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import ProtectedRoute from './ProtectedRoute';

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  const currentRole = (user.role || '').toUpperCase().replace(/^ROLE_/, '');
  const roles = allowedRoles.map((role) => role.toUpperCase());

  if (roles.length > 0 && !roles.includes(currentRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export default RoleRoute;
