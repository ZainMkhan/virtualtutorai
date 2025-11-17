import React from 'react';

interface Alert {
  type: 'error' | 'success';
  message: string;
}

interface AlertSectionProps {
  error: string | null;
  successMessage: string | null;
}

const AlertSection: React.FC<AlertSectionProps> = ({ error, successMessage }) => {
  if (!error && !successMessage) return null;

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}
    </>
  );
};

export default AlertSection;
