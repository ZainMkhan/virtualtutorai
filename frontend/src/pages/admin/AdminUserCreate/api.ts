import type { FormData } from './types';
import { userAPI, type CreateUserRequest } from '../../../services/api';

export const resetFormData = (): FormData => ({
  username: '',
  email: '',
  password: '',
  password_confirm: '',
  first_name: '',
  last_name: '',
  dob: '',
  preferred_language: 'en',
  bio: '',
  interests: []
});

export const createUserPayload = (formData: FormData): CreateUserRequest => ({
  username: formData.username,
  email: formData.email,
  password: formData.password,
  password_confirm: formData.password_confirm,
  first_name: formData.first_name,
  last_name: formData.last_name,
  dob: formData.dob || undefined,
  preferred_language: formData.preferred_language || 'en',
  additional_information: {
    bio: formData.bio,
    interests: formData.interests
  }
});

export const submitUserCreation = async (formData: FormData) => {
  const createData = createUserPayload(formData);
  const response = await userAPI.createUser(createData);
  return response;
};
