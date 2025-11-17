import React, { useRef, useState } from 'react';
import { X, FileIcon, Image as ImageIcon, AlertCircle } from 'lucide-react';

export interface UploadedFile {
  file: File;
  preview?: string; // For images
  base64: string;
  type: string;
  name: string;
  size: number;
}

interface FileUploadProps {
  onFileSelect: (file: UploadedFile) => void;
  acceptedTypes?: string;
  maxSize?: number; // in bytes
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = 'image/*',
  maxSize = 20 * 1024 * 1024, // 20MB default
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setError(null);

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
      return;
    }

    // Validate file type
    const allowedTypes = acceptedTypes.split(',').map(t => t.trim());
    const isAllowed = allowedTypes.some(type => {
      if (type === 'image/*') {
        return file.type.startsWith('image/');
      }
      if (type.startsWith('.')) {
        return file.name.endsWith(type);
      }
      return file.type === type;
    });

    if (!isAllowed) {
      setError(`File type not allowed. Accepted: ${acceptedTypes}`);
      return;
    }

    // Read file as Base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      
      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = base64String;
      }

      onFileSelect({
        file,
        preview,
        base64: base64String,
        type: file.type,
        name: file.name,
        size: file.size,
      });
    };

    reader.onerror = () => {
      setError('Failed to read file');
    };

    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInput}
        accept={acceptedTypes}
        className="hidden"
      />

      <div onClick={() => fileInputRef.current?.click()}>
        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-700">
          Drag and drop your file here
        </p>
        <p className="text-xs text-gray-500 mt-1">
          or click to select (Images only)
        </p>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

export interface FilePreviewProps {
  file: UploadedFile;
  onRemove: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/');
  const fileSize = (file.size / 1024 / 1024).toFixed(2);

  return (
    <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-3">
      {isImage ? (
        <img
          src={file.preview}
          alt={file.name}
          className="w-16 h-16 object-cover rounded border border-gray-200"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
          <FileIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{fileSize} MB</p>
      </div>

      <button
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 border border-gray-200"
        title="Remove file"
      >
        <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
      </button>
    </div>
  );
};
