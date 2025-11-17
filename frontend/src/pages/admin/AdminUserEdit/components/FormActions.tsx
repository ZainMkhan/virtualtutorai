import React from 'react';

interface FormActionsProps {
  saving: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const FormActions: React.FC<FormActionsProps> = ({ saving, onCancel, onSubmit }) => {
  return (
    <div className="flex justify-end space-x-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        onClick={onSubmit}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

export default FormActions;
