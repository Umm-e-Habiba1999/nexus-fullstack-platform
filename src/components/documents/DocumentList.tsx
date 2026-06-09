import React, { useEffect, useState } from 'react';
import { FileText, Download, Trash2, Eye, Clock, User, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { documentApi } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface Document {
  _id: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'ready' | 'error' | 'signed';
  version: number;
  tags: string[];
  notes: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
  meetingId?: string;
  eSignature?: {
    signatureUrl: string;
    signatureDate: string;
    signedBy: {
      _id: string;
      name: string;
    };
  };
  createdAt: string;
}

const DocumentList = ({ meetingId, showMeetingDocsOnly = false }: { meetingId?: string, showMeetingDocsOnly?: boolean }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'signed' | 'unsigned'>('all');

  useEffect(() => {
    loadDocuments();
  }, [filter, meetingId]);

  const loadDocuments = async () => {
    try {
      const params: any = { page: 1, limit: 50 };

      if (showMeetingDocsOnly && meetingId) {
        const response = await documentApi.getByMeeting(meetingId);
        setDocuments(response.data.documents || []);
      } else {
        const response = await documentApi.getAll(params);
        setDocuments(response.data.documents || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentApi.delete(documentId);
      toast.success('Document deleted successfully');
      loadDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'signed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'signed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'DOC';
    if (mimeType.includes('excel') || mimeType.includes('csv')) return 'XLS';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'PPT';
    if (mimeType.includes('image')) return 'IMG';
    return 'FILE';
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'PDF': return 'text-red-500';
      case 'DOC': return 'text-blue-600';
      case 'XLS': return 'text-green-600';
      case 'PPT': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {(['all', 'signed', 'unsigned'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No documents found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Upload your first document to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents
            .filter((doc) => {
              if (filter === 'signed') return doc.status === 'signed';
              if (filter === 'unsigned') return doc.status !== 'signed';
              return true;
            })
            .map((document) => (
              <div
                key={document._id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${getIconColor(getFileType(document.mimeType))} bg-opacity-10`}>
                      {getFileType(document.mimeType) === 'PDF' && <FileText className="w-8 h-8" />}
                      {getFileType(document.mimeType) === 'DOC' && <FileText className="w-8 h-8" />}
                      {getFileType(document.mimeType) === 'XLS' && <FileText className="w-8 h-8" />}
                      {getFileType(document.mimeType) === 'PPT' && <FileText className="w-8 h-8" />}
                      {getFileType(document.mimeType) === 'IMG' && <FileText className="w-8 h-8" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate" title={document.originalName}>
                          {document.originalName}
                        </h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {getStatusIcon(document.status)}
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </span>
                        {document.version > 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            v{document.version}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {formatFileSize(document.fileSize)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(document.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {document.uploadedBy.name}
                        </span>
                        {document.eSignature && (
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <CheckCircle className="w-3 h-3" />
                            Signed
                          </span>
                        )}
                      </div>

                      {document.tags && document.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {document.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {document.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                          {document.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    {user?.id === document.uploadedBy._id && (
                      <button
                        onClick={() => handleDelete(document._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
