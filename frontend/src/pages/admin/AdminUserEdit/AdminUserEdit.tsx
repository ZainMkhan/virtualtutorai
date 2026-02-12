import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AdminHeader,
  UserHeader,
  EditForm,
  LoadingState,
  NotFoundState
} from './components';
import { INITIAL_FORM_DATA, mapUserToFormData } from './types';
import { fetchUserData, updateUserProfile } from './api';
import type { EditFormData } from './types';
import type { UserProfile } from '../../../services/api';

const AdminUserEdit: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditFormData>(INITIAL_FORM_DATA);
  const [newInterest, setNewInterest] = useState('');

  // Fetch user data
  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const userData = await fetchUserData(parseInt(userId));
        
        if (userData) {
          setUser(userData);
          setFormData(mapUserToFormData(userData));
        } else {
          setError('Failed to load user data');
        }
      } catch (error: any) {
        setError('Failed to load user data');
        console.error('User fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleInterestKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const updatedUser = await updateUserProfile(parseInt(userId), formData);
      
      if (updatedUser) {
        setUser(updatedUser);
        setSuccessMessage('User updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState onBackClick={() => navigate('/dashboard')} />;
  }

  if (!user) {
    return <NotFoundState onBackClick={() => navigate('/dashboard')} />;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <AdminHeader onBackClick={() => navigate('/dashboard')} />

      <main className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <UserHeader user={user} />

          <EditForm
            formData={formData}
            newInterest={newInterest}
            saving={saving}
            error={error}
            successMessage={successMessage}
            onInputChange={handleInputChange}
            onNewInterestChange={setNewInterest}
            onAddInterest={handleAddInterest}
            onRemoveInterest={handleRemoveInterest}
            onInterestKeyPress={handleInterestKeyPress}
            onCancel={() => navigate('/dashboard')}
            onSubmit={handleSubmit}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminUserEdit;