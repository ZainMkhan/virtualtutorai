import React from 'react';
import Alert from './Alert';
import BasicInfoSection from './BasicInfoSection';
import PasswordSection from './PasswordSection';
import NameSection from './NameSection';
import AdditionalInfoSection from './AdditionalInfoSection';
import InterestsSection from './InterestsSection';
import FormActions from './FormActions';
import type { FormData } from '../types';

interface UserFormProps {
  formData: FormData;
  newInterest: string;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onNewInterestChange: (value: string) => void;
  onAddInterest: () => void;
  onRemoveInterest: (interest: string) => void;
  onInterestKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const UserForm: React.FC<UserFormProps> = ({
  formData,
  newInterest,
  loading,
  error,
  successMessage,
  onInputChange,
  onNewInterestChange,
  onAddInterest,
  onRemoveInterest,
  onInterestKeyPress,
  onCancel,
  onSubmit
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {error && <Alert type="error" message={error} />}
        {successMessage && <Alert type="success" message={successMessage} />}

        <BasicInfoSection formData={formData} onInputChange={onInputChange} />
        <PasswordSection formData={formData} onInputChange={onInputChange} />
        <NameSection formData={formData} onInputChange={onInputChange} />
        <AdditionalInfoSection formData={formData} onInputChange={onInputChange} />
        <InterestsSection
          interests={formData.interests}
          newInterest={newInterest}
          onNewInterestChange={onNewInterestChange}
          onAddInterest={onAddInterest}
          onRemoveInterest={onRemoveInterest}
          onKeyPress={onInterestKeyPress}
        />

        <FormActions loading={loading} onCancel={onCancel} onSubmit={onSubmit} />
      </form>
    </div>
  );
};

export default UserForm;
