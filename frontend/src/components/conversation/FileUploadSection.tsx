import React from 'react';
import FileUpload, { type UploadedFile } from '@/components/shared/FileUpload';

interface FileUploadSectionProps {
  showFileUpload: boolean;
  attachedFile: UploadedFile | null;
  onFileSelect: (file: UploadedFile) => void;
  onToggle: (show: boolean) => void;
  onRemove: () => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  showFileUpload,
  attachedFile,
  onFileSelect,
  onToggle,
  onRemove,
}) => {
  return (
    <>
      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="mb-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">Upload File or Image</h3>
            <button
              onClick={() => onToggle(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <FileUpload 
            onFileSelect={(file) => {
              onFileSelect(file);
              onToggle(false);
            }}
          />
        </div>
      )}

      {/* File Preview */}
      {attachedFile && (
        <div className="mb-4 relative bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-3">
          {attachedFile.preview ? (
            <img
              src={attachedFile.preview}
              alt={attachedFile.name}
              className="w-16 h-16 object-cover rounded border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">FILE</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{attachedFile.name}</p>
            <p className="text-xs text-gray-500">{(attachedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 border border-gray-200"
            title="Remove file"
          >
            <span className="text-gray-500 hover:text-gray-700 text-lg">×</span>
          </button>
        </div>
      )}
    </>
  );
};

export default FileUploadSection;
