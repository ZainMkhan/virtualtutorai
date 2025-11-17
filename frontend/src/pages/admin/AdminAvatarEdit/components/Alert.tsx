import React from 'react';

interface AlertProps {
  type: 'error' | 'success';
  message: string;
}

const Alert: React.FC<AlertProps> = ({ type, message }) => {
  const bgColor = type === 'error' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-green-50 border-green-300 text-green-700';

  return (
    <div className={`border ${bgColor} px-4 py-3 rounded-md mb-6`}>
      {message}
    </div>
  );
};

export default Alert;
