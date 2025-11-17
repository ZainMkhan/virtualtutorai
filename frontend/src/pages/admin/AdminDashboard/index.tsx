import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI, avatarAPI, type UserProfile, type Avatar, type DeleteUserRequest } from '../../../services/api';
import AdminSubscriptionTiers from '../AdminSubscriptionTiers';
import AdminUserSubscriptions from '../AdminUserSubscriptions';
import AdminActivityLogs from '../AdminActivityLogs';
import { AdminPayments } from '../AdminPayments';
import AdminAnalytics from '../AdminAnalytics/AdminAnalytics';
import { DashboardSidebar, TopNavbar, StatsGrid, DeleteUserModal } from './components';
import { 
  Users, Edit, Trash2, Plus, Bot, Eye, AlertCircle, CreditCard, History, Settings, DollarSign, LayoutDashboard
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarsLoading, setAvatarsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarsError, setAvatarsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAvatars, setTotalAvatars] = useState(0);
  const [pageSize] = useState(10);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'avatars' | 'subscriptions' | 'user-subscriptions' | 'activity-logs' | 'payments'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [deleteAction, setDeleteAction] = useState<'soft_delete' | 'change_status' | 'restore'>('soft_delete');
  const [deleteStatus, setDeleteStatus] = useState<'active' | 'inactive' | 'suspended'>('inactive');
  const [deleteReason, setDeleteReason] = useState('');

  // Fetch current admin profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!user?.user_id) return;
      
      try {
        const response = await userAPI.getUserProfile(user.user_id);
        if (response.success) {
          setUserProfile(response.data);
        }
      } catch (error: any) {
        console.error('Admin profile fetch error:', error);
      }
    };

    fetchAdminProfile();
  }, [user?.user_id]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getAllUsers(currentPage, pageSize);
      
      if (response.success) {
        setUsers(response.data.results);
        setTotalUsers(response.data.count);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      setError('Failed to fetch users');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all avatars
  const fetchAvatars = async () => {
    try {
      setAvatarsLoading(true);
      setAvatarsError(null);
      const response = await avatarAPI.getAllAvatars();
      
      if (response.success) {
        setAvatars(response.data.results);
        setTotalAvatars(response.data.count);
      } else {
        setAvatarsError(response.message || 'Failed to fetch avatars');
      }
    } catch (error: any) {
      setAvatarsError('Failed to fetch avatars');
      console.error('Fetch avatars error:', error);
    } finally {
      setAvatarsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAvatars();
  }, [currentPage]);

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  const handleDeleteUser = (user: UserProfile) => {
    setSelectedUser(user);
    if (user.status === 'active') {
      setDeleteAction('change_status');
      setDeleteStatus('suspended');
    } else if (user.status === 'suspended' || user.status === 'inactive') {
      setDeleteAction('restore');
      setDeleteStatus('active');
    } else {
      setDeleteAction('soft_delete');
    }
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setError(null);
      const deleteData: DeleteUserRequest = {
        action: deleteAction,
        status: deleteAction === 'change_status' ? deleteStatus : undefined,
        reason: deleteReason || undefined
      };

      const response = await userAPI.deleteUser(selectedUser.id, deleteData);
      if (response.success) {
        await fetchUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
        setDeleteReason('');
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      setError('Failed to delete user');
      console.error('Delete user error:', error);
    }
  };

  const handleEditUser = (userId: number) => {
    navigate(`/admin/users/${userId}/edit`);
  };

  const handleDeleteAvatar = async (avatarId: string) => {
    if (!window.confirm('Are you sure you want to delete this avatar?')) {
      return;
    }

    try {
      const response = await avatarAPI.deleteAvatar(avatarId);
      if (response.success) {
        await fetchAvatars();
      } else {
        setAvatarsError(response.message || 'Failed to delete avatar');
      }
    } catch (error: any) {
      setAvatarsError('Failed to delete avatar');
      console.error('Delete avatar error:', error);
    }
  };

  // Stats data
  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Active Users',
      value: users.filter(u => u.status === 'active').length,
      icon: AlertCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Suspended',
      value: users.filter(u => u.status === 'suspended').length,
      icon: AlertCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      label: 'Total Avatars',
      value: totalAvatars,
      icon: Bot,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Active Avatars',
      value: avatars.filter(a => a.is_active).length,
      icon: Eye,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      label: 'Admins',
      value: users.filter(u => u.role === 'admin').length,
      icon: Settings,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    }
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { id: 'users', label: 'Users', icon: Users, count: totalUsers },
    { id: 'avatars', label: 'Avatars', icon: Bot, count: totalAvatars },
    { id: 'subscriptions', label: 'Tiers', icon: Settings, count: null },
    { id: 'user-subscriptions', label: 'Subscriptions', icon: CreditCard, count: null },
    { id: 'activity-logs', label: 'Activity', icon: History, count: null },
    { id: 'payments', label: 'Payments', icon: DollarSign, count: null },
  ];

  const totalPages = Math.ceil(totalUsers / pageSize);

  if (loading && avatarsLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        tabs={tabs}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={setSidebarOpen}
        userProfile={userProfile}
      />

      <main className="lg:ml-64">
        <TopNavbar
          onToggleSidebar={setSidebarOpen}
          onLogout={handleLogout}
          userProfile={userProfile}
          showUserMenu={showUserMenu}
          onToggleUserMenu={setShowUserMenu}
        />

        <div className="p-6 lg:p-8 space-y-8">
          {error && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {avatarsError && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{avatarsError}</span>
            </div>
          )}

          {/* Show Analytics by default */}
          {activeTab === 'dashboard' ? (
            <>
              <StatsGrid stats={stats} />
              <AdminAnalytics />
            </>
          ) : null}

          {activeTab !== 'dashboard' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 lg:p-8">
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                    <button
                      onClick={() => navigate('/admin/users/create')}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-md transition-all hover:shadow-lg"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add User</span>
                    </button>
                  </div>

                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                      <div className="text-slate-600">Loading users...</div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900">
                                  {user.full_name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-600">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                  user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                  user.status === 'active' 
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                                    : user.status === 'suspended'
                                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => handleEditUser(user.id)}
                                    className="text-blue-600 hover:text-blue-700 transition-colors"
                                  >
                                    <Edit className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-rose-600 hover:text-rose-700 transition-colors"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {users.length === 0 && (
                        <div className="text-center py-12">
                          <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
                          <p className="text-slate-600 mb-4">Get started by adding your first user.</p>
                        </div>
                      )}

                      {totalPages > 1 && (
                        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
                          <div className="text-sm text-slate-600">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Previous
                            </button>
                            <span className="px-3 py-2 text-sm font-medium text-slate-700">
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'avatars' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Avatar Management</h2>
                    <button
                      onClick={() => navigate('/admin/avatars/create')}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-md transition-all hover:shadow-lg"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Avatar</span>
                    </button>
                  </div>

                  {avatarsLoading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                      <div className="text-slate-600">Loading avatars...</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {avatars.map((avatar) => (
                        <div key={avatar.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-all hover:shadow-md">
                          {avatar.preview_image && (
                            <img
                              src={avatar.preview_image}
                              alt={avatar.name}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                  {avatar.name}
                                </h3>
                                <p className="text-xs text-slate-500 mb-3">
                                  ID: {avatar.avatar_id}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    avatar.category === 'professional' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                                    avatar.category === 'casual' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                                    'bg-slate-100 text-slate-700 border border-slate-300'
                                  }`}>
                                    {avatar.category}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    avatar.is_active ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-rose-100 text-rose-700 border border-rose-300'
                                  }`}>
                                    {avatar.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() => navigate(`/admin/avatars/${avatar.id}/edit`)}
                                  className="text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAvatar(avatar.id)}
                                  className="text-rose-600 hover:text-rose-700 transition-colors"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {avatars.length === 0 && (
                        <div className="col-span-full text-center py-12">
                          <Bot className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No avatars yet</h3>
                          <p className="text-slate-600 mb-4">Create your first avatar to get started.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'subscriptions' && <AdminSubscriptionTiers />}
              {activeTab === 'user-subscriptions' && <AdminUserSubscriptions />}
              {activeTab === 'activity-logs' && <AdminActivityLogs />}
              {activeTab === 'payments' && <AdminPayments />}
            </div>
          </div>
          )}
        </div>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteUser}
        selectedUser={selectedUser}
        deleteAction={deleteAction}
        deleteStatus={deleteStatus}
        deleteReason={deleteReason}
        onActionChange={setDeleteAction}
        onStatusChange={setDeleteStatus}
        onReasonChange={setDeleteReason}
      />
    </div>
  );
};

export default AdminDashboard;
