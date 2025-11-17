import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AvatarEditForm } from './components';
import { INITIAL_FORM_DATA, type AvatarFormData } from './types';
import { fetchAvatarData, mapAvatarToFormData, validateAvatarForm, submitAvatarUpdate } from './api';

const AdminAvatarEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<AvatarFormData>(INITIAL_FORM_DATA);

  useEffect(() => {
    if (id) {
      loadAvatar();
    }
  }, [id]);

  const loadAvatar = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const avatar = await fetchAvatarData(id);
      const mappedData = mapAvatarToFormData(avatar);
      setFormData(mappedData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmbedUrlChange = (value: string) => {
    setFormData(prev => ({ ...prev, embed_url: value }));
  };

  const handleCategoryChange = (value: 'professional' | 'casual' | 'formal' | 'educational') => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleQualityChange = (value: 'high' | 'medium' | 'low') => {
    setFormData(prev => ({ ...prev, quality: value }));
  };

  const handleImageChange = (value: string) => {
    setFormData(prev => ({ ...prev, preview_image: value }));
  };

  const handleTransparentChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, transparent_background: value }));
  };

  const handleStatusToggle = () => {
    setFormData(prev => ({ ...prev, is_active: !prev.is_active }));
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form with isEditMode=true to make embed_url optional
    const validationError = validateAvatarForm(formData, true);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!id) {
      setError('Avatar ID is missing');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      await submitAvatarUpdate(id, formData);
      setSuccess('Avatar updated successfully!');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update avatar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AvatarEditForm
      loading={loading}
      saving={saving}
      error={error}
      success={success}
      formData={formData}
      onInputChange={handleInputChange}
      onEmbedUrlChange={handleEmbedUrlChange}
      onCategoryChange={handleCategoryChange}
      onQualityChange={handleQualityChange}
      onImageChange={handleImageChange}
      onTransparentChange={handleTransparentChange}
      onStatusToggle={handleStatusToggle}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  );
};

export default AdminAvatarEdit;