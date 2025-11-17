import React from 'react';
import type { AvatarFormData } from '../types';
import AdminHeader from './AdminHeader';
import Alert from './Alert';
import LoadingState from './LoadingState';
import BasicInfoSection from './BasicInfoSection';
import EmbedUrlSection from './EmbedUrlSection';
import CategoriesQualitySection from './CategoriesQualitySection';
import PreviewImageSection from './PreviewImageSection';
import SettingsSection from './SettingsSection';
import ActiveStatus from './ActiveStatus';
import FormActions from './FormActions';

interface AvatarEditFormProps {
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  formData: AvatarFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmbedUrlChange: (value: string) => void;
  onCategoryChange: (value: 'professional' | 'casual' | 'formal' | 'educational') => void;
  onQualityChange: (value: 'high' | 'medium' | 'low') => void;
  onImageChange: (value: string) => void;
  onTransparentChange: (value: boolean) => void;
  onStatusToggle: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AvatarEditForm: React.FC<AvatarEditFormProps> = ({
  loading,
  saving,
  error,
  success,
  formData,
  onInputChange,
  onEmbedUrlChange,
  onCategoryChange,
  onQualityChange,
  onImageChange,
  onTransparentChange,
  onStatusToggle,
  onCancel,
  onSubmit,
}) => {
  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full">
      <AdminHeader onBack={onCancel} />

      <div className="container mx-auto px-4 py-6">
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Left Column */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <BasicInfoSection formData={formData} onInputChange={onInputChange} />

              <EmbedUrlSection
                formData={formData}
                isRequired={false}
                onChange={onEmbedUrlChange}
              />

              <CategoriesQualitySection
                formData={formData}
                onCategoryChange={onCategoryChange}
                onQualityChange={onQualityChange}
              />
            </div>

            {/* Right Column - Preview and Settings */}
            <div className="space-y-6">
              <PreviewImageSection formData={formData} onImageChange={onImageChange} />

              <SettingsSection
                transparentBackground={formData.transparent_background}
                onTransparentChange={onTransparentChange}
              />

              <ActiveStatus isActive={formData.is_active} onToggle={onStatusToggle} />
            </div>
          </div>

          {/* Form Actions */}
          <FormActions saving={saving} onCancel={onCancel} onSubmit={onSubmit} />
        </form>
      </div>
    </div>
  );
};

export default AvatarEditForm;
