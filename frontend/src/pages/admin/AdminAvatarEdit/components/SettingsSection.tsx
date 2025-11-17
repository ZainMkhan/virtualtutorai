import React from 'react';

interface SettingsSectionProps {
  transparentBackground: boolean;
  onTransparentChange: (value: boolean) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  transparentBackground,
  onTransparentChange
}) => {
  return (
    <div className="flex items-center space-x-6">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={transparentBackground}
          onChange={(e) => onTransparentChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-700">Transparent Background</span>
      </label>
    </div>
  );
};

export default SettingsSection;
