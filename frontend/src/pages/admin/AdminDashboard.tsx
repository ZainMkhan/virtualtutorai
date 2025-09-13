import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI, avatarAPI, type UserProfile, type Avatar, type DeleteUserRequest } from '../../services/api';
import Logo from '../../components/Logo';
import UserMenu from '../../components/user/UserMenu';
import { Users, Edit, Trash2, Plus, Bot, Eye, X } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
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
  const [activeTab, setActiveTab] = useState<'users' | 'avatars'>('users');
  
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

  const handleDeleteUser = (user: UserProfile) => {
    setSelectedUser(user);
    
    // Set smart defaults based on current user status
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
        // Refresh users list
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
        // Refresh the avatars list
        await fetchAvatars();
      } else {
        setAvatarsError(response.message || 'Failed to delete avatar');
      }
    } catch (error: any) {
      setAvatarsError('Failed to delete avatar');
      console.error('Delete avatar error:', error);
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  if (loading && avatarsLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo size="md" showText={true} textColor="text-gray-900" />
              <span className="ml-2 text-xl font-semibold text-red-600">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {userProfile?.full_name || user?.email} (Administrator)
              </span>
              <UserMenu userProfile={userProfile} />
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {avatarsError && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-6">
            {avatarsError}
          </div>
        )}

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Users</p>
                <p className="text-xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Active Users</p>
                <p className="text-xl font-bold text-green-900">{users.filter(u => u.status === 'active').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Suspended</p>
                <p className="text-xl font-bold text-red-900">{users.filter(u => u.status === 'suspended').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Admins</p>
                <p className="text-xl font-bold text-orange-900">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Bot className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Avatars</p>
                <p className="text-xl font-bold text-purple-900">{totalAvatars}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Eye className="h-6 w-6 text-indigo-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Active Avatars</p>
                <p className="text-xl font-bold text-indigo-900">{avatars.filter(a => a.is_active).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="inline-block w-4 h-4 mr-2" />
                Users ({totalUsers})
              </button>
              <button
                onClick={() => setActiveTab('avatars')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'avatars'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bot className="inline-block w-4 h-4 mr-2" />
                Avatars ({totalAvatars})
              </button>
            </nav>
          </div>
        </div>

        {/* Users Management */}
        {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <button
                onClick={() => navigate('/admin/users/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="text-gray-600">Loading users...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : user.status === 'suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <span className="px-3 py-2 text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Avatar Management */}
        {activeTab === 'avatars' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Avatar Management</h2>
              <button
                onClick={() => navigate('/admin/avatars/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Avatar</span>
              </button>
            </div>
          </div>

          {avatarsLoading ? (
            <div className="p-6 text-center">
              <div className="text-gray-600">Loading avatars...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {avatars.map((avatar) => (
                <div key={avatar.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {avatar.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Avatar ID: {avatar.avatar_id}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${
                            avatar.category === 'professional' ? 'bg-blue-100 text-blue-800' :
                            avatar.category === 'casual' ? 'bg-green-100 text-green-800' :
                            avatar.category === 'formal' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {avatar.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${
                            avatar.quality === 'high' ? 'bg-green-100 text-green-800' :
                            avatar.quality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {avatar.quality} quality
                          </span>
                          <span className={`px-2 py-1 rounded-full ${
                            avatar.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {avatar.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => navigate(`/admin/avatars/${avatar.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Avatar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAvatar(avatar.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Avatar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {avatars.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No avatars yet</h3>
                  <p className="text-gray-500 mb-4">Create your first avatar to get started.</p>
                  <button
                    onClick={() => navigate('/admin/avatars/create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Create Avatar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </main>

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete User: {selectedUser.full_name}
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedUser.status === 'suspended'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-sm text-gray-600">Email: {selectedUser.email}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <select
                    value={deleteAction}
                    onChange={(e) => setDeleteAction(e.target.value as 'soft_delete' | 'change_status' | 'restore')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="soft_delete">Soft Delete</option>
                    <option value="change_status">Change Status</option>
                    <option value="restore">Restore</option>
                  </select>
                </div>

                {deleteAction === 'change_status' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Status
                    </label>
                    <select
                      value={deleteStatus}
                      onChange={(e) => setDeleteStatus(e.target.value as 'active' | 'inactive' | 'suspended')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter reason for this action..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Confirm {deleteAction === 'soft_delete' ? 'Delete' : deleteAction === 'change_status' ? 'Status Change' : 'Restore'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;