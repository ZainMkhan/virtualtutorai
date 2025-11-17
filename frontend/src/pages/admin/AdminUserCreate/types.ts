export interface FormData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  dob: string;
  preferred_language: string;
  bio: string;
  interests: string[];
}

export const INITIAL_FORM_DATA: FormData = {
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
};
