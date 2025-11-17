export interface SignupFormData {
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

export const INTEREST_OPTIONS = ['AI', 'Programming', 'Mathematics', 'Science', 'Languages', 'History', 'Business', 'Design'];

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
];

export const SIGNUP_STEPS = [
  {
    number: 1,
    title: 'Create Your Account',
    description: 'Set up your login credentials securely',
  },
  {
    number: 2,
    title: 'Tell Us About Yourself',
    description: 'Help us personalize your learning experience',
  },
  {
    number: 3,
    title: 'Complete Your Profile',
    description: 'Customize your interests and preferences',
  },
];

export const validateStep = (step: number, formData: SignupFormData): { isValid: boolean; error: string } => {
  switch (step) {
    case 1:
      if (!formData.first_name || !formData.last_name) {
        return { isValid: false, error: 'Please fill in your name' };
      }
      if (!formData.dob) {
        return { isValid: false, error: 'Please enter your date of birth' };
      }
      if (!formData.preferred_language) {
        return { isValid: false, error: 'Please select a preferred language' };
      }
      return { isValid: true, error: '' };

    case 2:
      if (!formData.username || !formData.email) {
        return { isValid: false, error: 'Please fill in all fields' };
      }
      if (!formData.username.match(/^[a-zA-Z0-9_-]{3,20}$/)) {
        return { isValid: false, error: 'Username must be 3-20 characters (letters, numbers, _, -)' };
      }
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
      if (!formData.password || !formData.password_confirm) {
        return { isValid: false, error: 'Please fill in all fields' };
      }
      if (formData.password.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters' };
      }
      if (formData.password !== formData.password_confirm) {
        return { isValid: false, error: 'Passwords do not match' };
      }
      return { isValid: true, error: '' };

    case 3:
      if (!formData.bio || formData.interests.length === 0) {
        return { isValid: false, error: 'Please fill in bio and select at least one interest' };
      }
      return { isValid: true, error: '' };

    default:
      return { isValid: true, error: '' };
  }
};
