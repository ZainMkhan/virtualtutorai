import React from 'react';
import AlertSection from './AlertSection';
import NameSection from './NameSection';
import EmailDobSection from './EmailDobSection';
import BioSection from './BioSection';
import InterestsSection from './InterestsSection';
import FormActions from './FormActions';
import type { EditFormData } from '../types';

interface EditFormProps {
  formData: EditFormData;
  newInterest: string;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onNewInterestChange: (value: string) => void;
  onAddInterest: () => void;
  onRemoveInterest: (interest: string) => void;
  onInterestKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const EditForm: React.FC<EditFormProps> = ({
  formData,
  newInterest,
  saving,
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
        <h2 className="text-xl font-semibold text-gray-900">Edit User Information</h2>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <AlertSection error={error} successMessage={successMessage} />

        <NameSection formData={formData} onInputChange={onInputChange} />
        <EmailDobSection formData={formData} onInputChange={onInputChange} />
        <BioSection formData={formData} onInputChange={onInputChange} />
        <InterestsSection
          interests={formData.interests}
          newInterest={newInterest}
          onNewInterestChange={onNewInterestChange}
          onAddInterest={onAddInterest}
          onRemoveInterest={onRemoveInterest}
          onKeyPress={onInterestKeyPress}
        />

        <FormActions saving={saving} onCancel={onCancel} onSubmit={onSubmit} />
      </form>
    </div>
  );
};

export default EditForm;
