import type { UserProfile } from '../../../services/api';

export interface EditFormData {
  first_name: string;
  last_name: string;
  email: string;
  dob: string;
  bio: string;
  interests: string[];
}

export const INITIAL_FORM_DATA: EditFormData = {
  first_name: '',
  last_name: '',
  email: '',
  dob: '',
  bio: '',
  interests: []
};

export const mapUserToFormData = (user: UserProfile): EditFormData => ({
  first_name: user.first_name || '',
  last_name: user.last_name || '',
  email: user.email || '',
  dob: user.dob ? user.dob.split('T')[0] : '',
  bio: user.additional_information?.bio || '',
  interests: user.additional_information?.interests || []
});
