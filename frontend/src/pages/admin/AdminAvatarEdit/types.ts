export interface AvatarFormData {
  name: string;
  category: 'professional' | 'casual' | 'formal' | 'educational';
  quality: 'high' | 'medium' | 'low';
  is_active: boolean;
  avatar_id: string;
  embed_url: string;
  preview_image: string;
  transparent_background: boolean;
  metadata: Record<string, any>;
}

export const INITIAL_FORM_DATA: AvatarFormData = {
  name: '',
  category: 'professional',
  quality: 'high',
  is_active: true,
  avatar_id: '',
  embed_url: '',
  preview_image: '',
  transparent_background: false,
  metadata: {}
};
