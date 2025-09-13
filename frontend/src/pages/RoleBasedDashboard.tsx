import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './user/Dashboard';
import AdminDashboard from './admin/AdminDashboard';
import Loading from '../components/Loading';

const RoleBasedDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <Loading />;
  }

  // Redirect based on user role
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Default to user dashboard
  return <Dashboard />;
};

export default RoleBasedDashboard;