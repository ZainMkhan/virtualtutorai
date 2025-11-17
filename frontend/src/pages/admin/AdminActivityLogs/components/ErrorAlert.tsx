import React from 'react';

interface ErrorAlertProps {
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-300 text-red-700 rounded-md">
      {message}
    </div>
  );
};

export default ErrorAlert;
