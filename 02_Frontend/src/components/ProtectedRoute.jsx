import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const isAuth = authService.isAuthenticated();
  const user = authService.getAuthUser();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
