import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { documentApi } from '../../services/api';
import toast from 'react-hot-toast';

const DocumentUpload = ({ onUploadComplete, meetingId }: { onUploadComplete?: (doc: any) => void, meetingId?: string }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a valid document.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setFile(file);
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      const tags = meetingId ? ['meeting', meetingId] : [];
      const response = await documentApi.upload(file, meetingId || null, tags, '');

      toast.success('Document uploaded successfully!');
      if (onUploadComplete) {
        onUploadComplete(response.data.document);
      }
      setFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-12 h-12 text-red-500" />;
    if (type.includes('image')) return <FileText className="w-12 h-12 text-blue-500" />;
    if (type.includes('word')) return <FileText className="w-12 h-12 text-blue-600" />;
    if (type.includes('excel') || type.includes('csv')) return <FileText className="w-12 h-12 text-green-600" />;
    if (type.includes('powerpoint')) return <FileText className="w-12 h-12 text-orange-500" />;
    return <FileText className="w-12 h-12 text-gray-500" />;
  };

  // If file is already uploaded, show preview
  if (file && !isUploading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {getFileIcon(file.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
                </p>
              </div>
              <button
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-800'
      }`}
    >
      <input
        type="file"
        id="file-upload"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
          <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Drag & drop your document here
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            or <span className="text-blue-600 dark:text-blue-400 font-medium">browse files</span>
          </p>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
          Supported formats: PDF, DOC, DOCX, XLS, XLSX, CSV, PPT, PPTX, JPG, PNG, GIF
          <br />
          Max size: 10MB
        </p>
      </div>
    </div>
  );
};

export default DocumentUpload;
