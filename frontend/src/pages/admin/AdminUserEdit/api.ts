import type { UserProfile, UpdateUserRequest } from '../../../services/api';
import { userAPI } from '../../../services/api';
import type { EditFormData } from './types';

export const fetchUserData = async (userId: number) => {
  const response = await userAPI.getUserProfile(userId);
  return response.success ? response.data : null;
};

export const submitUserUpdate = async (userId: number, formData: EditFormData): Promise<UpdateUserRequest> => {
  return {
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: formData.email,
    dob: formData.dob || undefined,
    additional_information: {
      bio: formData.bio,
      interests: formData.interests
    }
  };
};

export const updateUserProfile = async (userId: number, formData: EditFormData) => {
  const updateData = await submitUserUpdate(userId, formData);
  const response = await userAPI.updateUserProfile(userId, updateData);
  return response.success ? response.data : null;
};
