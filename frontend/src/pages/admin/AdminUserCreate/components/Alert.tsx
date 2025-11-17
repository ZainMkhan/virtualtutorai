import React from 'react';

interface AlertProps {
  type: 'error' | 'success';
  message: string;
}

const Alert: React.FC<AlertProps> = ({ type, message }) => {
  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = type === 'error' ? 'text-red-600' : 'text-green-600';

  return (
    <div className={`${bgColor} border ${textColor} px-4 py-3 rounded-md`}>
      {message}
    </div>
  );
};

export default Alert;
