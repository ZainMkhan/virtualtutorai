import React, { useState, useEffect } from 'react';
import { adminAPI, type SubscriptionTierDetail, type CreateSubscriptionTierRequest } from '../../../services/api';
import { Edit, Trash2, Plus, X } from 'lucide-react';

interface TierFormData extends CreateSubscriptionTierRequest {
  display_name: string;
  description: string;
  price: number;
  billing_interval: 'month' | 'year';
}

const AdminSubscriptionTiers: React.FC = () => {
  const [tiers, setTiers] = useState<SubscriptionTierDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const defaultFormData: TierFormData = {
    display_name: '',
    description: '',
    price: 0,
    billing_interval: 'month',
    conversations_per_month: 10,
    video_minutes_per_month: 30,
    messages_per_month: 500,
    interactive_minutes_per_month: 5,
    max_concurrent_sessions: 1,
    features: {},
    is_active: true,
    is_featured: false,
    display_order: 0,
  };

  const [formData, setFormData] = useState<TierFormData>(defaultFormData);

  // Fetch all tiers
  const fetchTiers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAllSubscriptionTiers();
      if (response.success) {
        setTiers(response.data);
      } else {
        setError(response.message || 'Failed to fetch subscription tiers');
      }
    } catch (error: any) {
      console.error('Fetch tiers error:', error);
      setError('Failed to fetch subscription tiers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleOpenModal = () => {
    setIsEditing(false);
    setEditingTierId(null);
    setFormData(defaultFormData);
    setShowModal(true);
  };

  const handleEditTier = (tier: SubscriptionTierDetail) => {
    setIsEditing(true);
    setEditingTierId(tier.id);
    setFormData({
      display_name: tier.display_name,
      description: tier.description,
      price: typeof tier.price === 'string' ? parseFloat(tier.price) : tier.price,
      billing_interval: tier.billing_interval as 'month' | 'year',
      conversations_per_month: tier.conversations_per_month,
      video_minutes_per_month: tier.video_minutes_per_month,
      messages_per_month: tier.messages_per_month,
      interactive_minutes_per_month: tier.interactive_minutes_per_month,
      max_concurrent_sessions: tier.max_concurrent_sessions,
      features: tier.features || {},
      is_active: tier.is_active,
      is_featured: tier.is_featured,
      display_order: tier.display_order,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingTierId(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (!formData.display_name.trim()) {
        setError('Display name is required');
        return;
      }

      if (!formData.description.trim()) {
        setError('Description is required');
        return;
      }

      if (formData.price < 0) {
        setError('Price must be non-negative');
        return;
      }

      if (isEditing && editingTierId) {
        const response = await adminAPI.updateSubscriptionTier(editingTierId, formData);
        if (response.success) {
          await fetchTiers();
          handleCloseModal();
        } else {
          setError(response.message || 'Failed to update tier');
        }
      } else {
        const response = await adminAPI.createSubscriptionTier(formData);
        if (response.success) {
          await fetchTiers();
          handleCloseModal();
        } else {
          setError(response.message || 'Failed to create tier');
        }
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    try {
      setError(null);
      const response = await adminAPI.deleteSubscriptionTier(tierId);
      if (response.success) {
        await fetchTiers();
        setDeleteConfirm(null);
      } else {
        setError(response.message || 'Failed to delete tier');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      setError('Failed to delete tier');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription tiers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Subscription Tiers Management</h2>
          <button
            onClick={handleOpenModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Tier</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Messages/Month
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interactive Min
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
            {tiers.map((tier) => (
              <tr key={tier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tier.display_name}</p>
                    <p className="text-xs text-gray-500">{tier.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ${typeof tier.price === 'string' ? tier.price : tier.price.toFixed(2)} / {tier.billing_interval}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {tier.messages_per_month || 'Unlimited'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {tier.interactive_minutes_per_month || 'Unlimited'} min
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    tier.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tier.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTier(tier)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(tier.id)}
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

        {tiers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No subscription tiers found. Create one to get started.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit Subscription Tier' : 'Create New Subscription Tier'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Pro, Business, Enterprise"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="What's included in this tier..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Billing Interval */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Interval *
                  </label>
                  <select
                    name="billing_interval"
                    value={formData.billing_interval}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>

                {/* Conversations Per Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conversations Per Month
                  </label>
                  <input
                    type="number"
                    name="conversations_per_month"
                    value={formData.conversations_per_month || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Video Minutes Per Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Minutes Per Month
                  </label>
                  <input
                    type="number"
                    name="video_minutes_per_month"
                    value={formData.video_minutes_per_month || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Messages Per Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Messages Per Month
                  </label>
                  <input
                    type="number"
                    name="messages_per_month"
                    value={formData.messages_per_month || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Interactive Minutes Per Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interactive Minutes Per Month
                  </label>
                  <input
                    type="number"
                    name="interactive_minutes_per_month"
                    value={formData.interactive_minutes_per_month || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Max Concurrent Sessions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Concurrent Sessions
                  </label>
                  <input
                    type="number"
                    name="max_concurrent_sessions"
                    value={formData.max_concurrent_sessions || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Is Active */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>

                {/* Is Featured */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Featured (show prominently)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {isEditing ? 'Update' : 'Create'} Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Subscription Tier
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this subscription tier? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTier(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionTiers;
