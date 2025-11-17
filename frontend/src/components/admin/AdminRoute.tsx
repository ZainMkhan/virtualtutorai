import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../loading/Loading';

interface AdminRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children, isAuthenticated }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;