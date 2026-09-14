import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function ProtectedRoute({ children }) {
  const { isLoggedIn, selectedStore } = useAuthStore();
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // Force store selection
  if (isLoggedIn() && !selectedStore && location.pathname !== '/select-store') {
    return <Navigate to={`/select-store?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
}
