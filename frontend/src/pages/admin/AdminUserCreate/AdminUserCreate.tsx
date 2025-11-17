import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './components/AdminHeader';
import PageHeader from './components/PageHeader';
import UserForm from './components/UserForm';
import { INITIAL_FORM_DATA } from './types';
import { validateForm } from './utils';
import { submitUserCreation, resetFormData } from './api';

const AdminUserCreate: React.FC = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [newInterest, setNewInterest] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    
    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await submitUserCreation(formData);
      
      if (response.success) {
        setSuccessMessage(`User "${formData.first_name} ${formData.last_name}" created successfully! Redirecting to dashboard...`);
        setFormData(resetFormData());
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <AdminHeader onBackClick={() => navigate('/dashboard')} />

      <main className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <PageHeader title="Create New User" description="Add a new user to the system" />

          <UserForm
            formData={formData}
            newInterest={newInterest}
            loading={loading}
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

export default AdminUserCreate;