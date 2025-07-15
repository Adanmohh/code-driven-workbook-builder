import React, { useRef } from 'react';
import { Upload, FileText, Image } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Processing file...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center space-x-4 mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
            <Image className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Supports PDF, PNG, JPG, JPEG (max 100MB)
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Choose File
          </button>
        </>
      )}
    </div>
  );
};

export default FileUpload;