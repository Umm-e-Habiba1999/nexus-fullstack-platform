import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, User, MoreVertical, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import { meetingApi } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface Meeting {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  type: 'general' | 'investor-meeting' | 'entrepreneur-update' | 'pitch-session';
  organizer: {
    _id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
  participants: Array<{
    _id: string;
    name: string;
    email: string;
    avatarUrl: string;
  }>;
  createdAt: string;
}

const MeetingList = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    loadMeetings();
  }, [filter]);

  const loadMeetings = async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (filter === 'upcoming') {
        // Filter upcoming meetings (this would ideally be done in the backend)
        params.status = ['scheduled', 'accepted'];
      }

      const response = await meetingApi.getAll(params);
      setMeetings(response.data.meetings || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load meetings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (meetingId: string, status: 'accepted' | 'rejected' | 'cancelled') => {
    try {
      await meetingApi.updateStatus(meetingId, status);
      toast.success(`Meeting ${status}`);
      loadMeetings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${status} meeting`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'scheduled':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Meetings</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {meetings.length} scheduled meeting{meetings.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {(['all', 'upcoming', 'past'] as const).map((f) => (
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

      {/* Meeting Cards */}
      {meetings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No meetings found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Schedule your first meeting to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Meeting Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {getStatusIcon(meeting.status)}
                      {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {meeting.type.replace('-', ' ')}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {meeting.title}
                  </h3>

                  {/* Meeting Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(meeting.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
                    </div>
                    {meeting.description && (
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        {meeting.description}
                      </div>
                    )}
                  </div>

                  {/* Participants */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>Organized by: {meeting.organizer.name}</span>
                    {meeting.participants.length > 0 && (
                      <span className="text-gray-400">|</span>
                    )}
                    {meeting.participants.slice(0, 3).map((p) => (
                      <div key={p._id} className="relative">
                        <img
                          src={p.avatarUrl || `https://ui-avatars.com/api/?name=${p.name}`}
                          alt={p.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      </div>
                    ))}
                    {meeting.participants.length > 3 && (
                      <span>+{meeting.participants.length - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Action Menu */}
                <div className="flex flex-col gap-2">
                  {user?.role === 'entrepreneur' && meeting.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(meeting._id, 'accepted')}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Accept meeting"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(meeting._id, 'rejected')}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Reject meeting"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
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

export default MeetingList;
