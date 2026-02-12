import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import StripeProvider from './components/payment/StripeProvider';
import PrivateRoute from './components/shared/PrivateRoute';
import AdminRoute from './components/admin/AdminRoute';
import Loading from './components/loading/Loading';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/signup/Signup';
import RoleBasedDashboard from './pages/RoleBasedDashboard';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';
import Subscription from './pages/user/Subscription';
import AdminUserEdit from './pages/admin/AdminUserEdit/AdminUserEdit';
import AdminUserCreate from './pages/admin/AdminUserCreate/AdminUserCreate';
import AdminAvatarCreate from './pages/admin/AdminAvatarCreate/AdminAvatarCreate';
import AdminAvatarEdit from './pages/admin/AdminAvatarEdit/AdminAvatarEdit';
import AvatarInteraction from './pages/avatar/AvatarInteraction';
import AvatarsBrowse from './pages/user/AvatarsBrowse';
import Conversation from './pages/Conversation';
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
            <Landing />
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
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
        path="/subscription" 
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Subscription />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/avatars" 
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <AvatarsBrowse />
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
      <Route 
        path="/conversation" 
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Conversation />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/conversation/:conversationId" 
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Conversation />
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
        <StripeProvider>
          <div className="min-h-screen custom-scrollbar">
            <AppRoutes />
          </div>
        </StripeProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
