import type { FormData } from './types';

export const validateForm = (formData: FormData): string | null => {
  if (!formData.username.trim()) return 'Username is required';
  if (!formData.email.trim()) return 'Email is required';
  if (!formData.password) return 'Password is required';
  if (formData.password !== formData.password_confirm) return 'Passwords do not match';
  if (formData.password.length < 6) return 'Password must be at least 6 characters';
  if (!formData.first_name.trim()) return 'First name is required';
  if (!formData.last_name.trim()) return 'Last name is required';
  return null;
};
