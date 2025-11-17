import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { avatarAPI, type CreateAvatarRequest } from '../../../../services/api';

export interface FormDataState {
  category: string;
  name: string;
  avatar_id: string;
  embed_url: string;
  preview_image: string;
  quality: 'low' | 'medium' | 'high';
  transparent_background: boolean;
  metadata: Record<string, any>;
  is_active: boolean;
}

export const useAvatarForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormDataState>({
    category: 'General',
    name: '',
    avatar_id: '',
    embed_url: '',
    preview_image: '',
    quality: 'medium',
    transparent_background: false,
    metadata: {},
    is_active: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const updateFormData = (data: Partial<FormDataState>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Avatar name is required';
    if (!formData.avatar_id.trim()) return 'Avatar ID is required';
    if (!formData.embed_url.trim()) return 'Embed URL is required';
    if (!formData.category) return 'Category is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const createData: CreateAvatarRequest = {
        category: formData.category,
        name: formData.name,
        avatar_id: formData.avatar_id,
        embed_url: formData.embed_url,
        preview_image: formData.preview_image,
        quality: formData.quality,
        transparent_background: formData.transparent_background,
        metadata: formData.metadata,
        is_active: formData.is_active
      };

      const response = await avatarAPI.createAvatar(createData);
      
      if (response.success) {
        setSuccessMessage(`Avatar "${formData.name}" created successfully! Redirecting to dashboard...`);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create avatar');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    successMessage,
    handleInputChange,
    updateFormData,
    handleSubmit,
    setError,
    setSuccessMessage
  };
};
