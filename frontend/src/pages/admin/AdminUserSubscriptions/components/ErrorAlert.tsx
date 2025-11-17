import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  error: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  return (
    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-300 text-red-700 rounded-md flex items-center space-x-2">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
};

export default ErrorAlert;
