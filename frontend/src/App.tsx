import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/admin/AdminRoute';
import Loading from './components/Loading';
import Login from './pages/auth/Login';
import RoleBasedDashboard from './pages/RoleBasedDashboard';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';
import AdminUserEdit from './pages/admin/AdminUserEdit';
import AdminUserCreate from './pages/admin/AdminUserCreate';
import AdminAvatarCreate from './pages/admin/AdminAvatarCreate';
import AdminAvatarEdit from './pages/admin/AdminAvatarEdit';
import AvatarInteraction from './pages/avatar/AvatarInteraction';
import './App.css';

const AppRoutes: React.FC = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <RoleBasedDashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Profile />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Settings />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/users/:userId/edit" 
        element={
          <AdminRoute isAuthenticated={isAuthenticated}>
            <AdminUserEdit />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/users/create" 
        element={
          <AdminRoute isAuthenticated={isAuthenticated}>
            <AdminUserCreate />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/avatars/create" 
        element={
          <AdminRoute isAuthenticated={isAuthenticated}>
            <AdminAvatarCreate />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/avatars/:id/edit" 
        element={
          <AdminRoute isAuthenticated={isAuthenticated}>
            <AdminAvatarEdit />
          </AdminRoute>
        } 
      />
      <Route 
        path="/avatar/:avatarId" 
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <AvatarInteraction />
          </PrivateRoute>
        } 
      />
      {/* Redirect any unknown routes to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    document.documentElement.classList.add('custom-scrollbar');
    document.body.classList.add('custom-scrollbar');
    
    return () => {
      document.documentElement.classList.remove('custom-scrollbar');
      document.body.classList.remove('custom-scrollbar');
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen custom-scrollbar">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
