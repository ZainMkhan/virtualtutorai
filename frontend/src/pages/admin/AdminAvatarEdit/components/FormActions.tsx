import React from 'react';
import { Bot } from 'lucide-react';

interface FormActionsProps {
  saving: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const FormActions: React.FC<FormActionsProps> = ({ saving, onCancel, onSubmit }) => {
  return (
    <div className="flex justify-end space-x-4 pt-6">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        onClick={onSubmit}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Updating...</span>
          </>
        ) : (
          <>
            <Bot className="h-4 w-4" />
            <span>Update Avatar</span>
          </>
        )}
      </button>
    </div>
  );
};

export default FormActions;
