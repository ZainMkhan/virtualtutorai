import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI, avatarAPI, type UserProfile, type Avatar, type DeleteUserRequest } from '../../services/api';
import AdminSubscriptionTiers from './AdminSubscriptionTiers';
import AdminUserSubscriptions from './AdminUserSubscriptions';
import AdminActivityLogs from './AdminActivityLogs';
import AdminPayments from './AdminPayments';
import { 
  Users, Edit, Trash2, Plus, Bot, Eye, X, CreditCard, History, Settings, DollarSign,
  Menu, ChevronDown, TrendingUp, AlertCircle, CheckCircle, LogOut,
  BarChart3
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
  const [activeTab, setActiveTab] = useState<'users' | 'avatars' | 'subscriptions' | 'user-subscriptions' | 'activity-logs' | 'payments'>('users');
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
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Active Users',
      value: users.filter(u => u.status === 'active').length,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      trend: '+8%',
      trendUp: true
    },
    {
      label: 'Suspended',
      value: users.filter(u => u.status === 'suspended').length,
      icon: AlertCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      trend: '-2%',
      trendUp: false
    },
    {
      label: 'Total Avatars',
      value: totalAvatars,
      icon: Bot,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      trend: '+5%',
      trendUp: true
    },
    {
      label: 'Active Avatars',
      value: avatars.filter(a => a.is_active).length,
      icon: Eye,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      trend: '+3%',
      trendUp: true
    },
    {
      label: 'Admins',
      value: users.filter(u => u.role === 'admin').length,
      icon: Settings,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      trend: '0%',
      trendUp: false
    }
  ];

  const tabs = [
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
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-slate-200 transition-transform duration-300 shadow-lg ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Admin</p>
                <p className="text-xs text-slate-500">Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Content */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== null && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {userProfile?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{userProfile?.email || 'Admin'}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Top Navigation Bar */}
        <nav className="sticky top-0 z-30 h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-xs text-slate-500 mt-1">Welcome back, Administrator</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {userProfile?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">{userProfile?.email || 'Admin'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-300 rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-6 lg:p-8 space-y-8">
          {/* Error Messages */}
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="group relative bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-all hover:shadow-md overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                      <p className="text-4xl font-bold text-slate-900 mt-3">{stat.value}</p>
                      <p className={`text-xs font-semibold mt-3 flex items-center space-x-1 ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <TrendingUp className="w-3 h-3" />
                        <span>{stat.trendUp ? '+' : '-'}{stat.trend}</span>
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-4 rounded-lg group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-7 h-7 ${stat.textColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tab Content */}
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

                      {/* Pagination */}
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
        </div>
      </main>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white border border-slate-300 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Delete User: {selectedUser.full_name}
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Current Status:</span>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                      : 'bg-rose-100 text-rose-700 border border-rose-300'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Email: {selectedUser.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Action
                </label>
                <select
                  value={deleteAction}
                  onChange={(e) => setDeleteAction(e.target.value as 'soft_delete' | 'change_status' | 'restore')}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="soft_delete">Soft Delete</option>
                  <option value="change_status">Change Status</option>
                  <option value="restore">Restore</option>
                </select>
              </div>

              {deleteAction === 'change_status' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={deleteStatus}
                    onChange={(e) => setDeleteStatus(e.target.value as 'active' | 'inactive' | 'suspended')}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter reason for this action..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 rounded-lg transition-all shadow-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
