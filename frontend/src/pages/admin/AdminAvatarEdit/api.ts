import { avatarAPI } from '../../../services/api';
import type { AvatarFormData } from './types';

export const fetchAvatarData = async (id: string) => {
  const response = await avatarAPI.getAvatar(id);
  return response.data;
};

export const mapAvatarToFormData = (avatar: any): AvatarFormData => ({
  name: avatar.name,
  category: avatar.category as 'professional' | 'casual' | 'formal' | 'educational',
  quality: avatar.quality,
  is_active: avatar.is_active,
  avatar_id: avatar.avatar_id,
  embed_url: avatar.embed_url || '',
  preview_image: avatar.preview_image || '',
  transparent_background: avatar.transparent_background || false,
  metadata: avatar.metadata || {}
});

export const validateAvatarForm = (formData: AvatarFormData, isEditMode: boolean): string | null => {
  if (!formData.name.trim()) return 'Avatar name is required';
  if (!formData.avatar_id.trim()) return 'Avatar ID is required';
  // Only require embed_url when creating new avatar, not when editing
  if (!isEditMode && !formData.embed_url.trim()) return 'Embed URL is required';
  return null;
};

export const submitAvatarUpdate = async (id: string, formData: AvatarFormData) => {
  const response = await avatarAPI.updateAvatar(id, formData);
  return response;
};
