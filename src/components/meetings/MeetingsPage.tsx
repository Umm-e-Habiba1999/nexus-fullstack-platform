import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import MeetingList from './MeetingList';
import MeetingScheduleModal from './MeetingScheduleModal';

const MeetingsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Schedule and manage your business meetings
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Schedule Meeting
        </button>
      </div>

      <MeetingList />

      <MeetingScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default MeetingsPage;
