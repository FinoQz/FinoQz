'use client';

import React from 'react';
import { Calendar, Clock, Eye, Users } from 'lucide-react';

interface ScheduleVisibilityProps {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  visibility: 'public' | 'private';
  assignedGroups: string[];
  onStartDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onVisibilityChange: (value: 'public' | 'private') => void;
  onAssignedGroupsChange: (groups: string[]) => void;
  postType: 'live' | 'scheduled';
  onPostTypeChange: (type: 'live' | 'scheduled') => void;
}

const availableGroups = [
  'Finance Beginners',
  'Advanced Traders',
  'Tax Planning Group',
  'Corporate Professionals',
  'Student Community'
];

export default function ScheduleVisibility({
  startDate,
  startTime,
  endDate,
  endTime,
  visibility,
  assignedGroups,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onVisibilityChange,
  onAssignedGroupsChange,
  postType,
  onPostTypeChange
}: ScheduleVisibilityProps) {
  // Logic: If postType is changed to live, clear schedule fields
  React.useEffect(() => {
    if (postType === 'live') {
      onStartDateChange('');
      onStartTimeChange('');
      onEndDateChange('');
      onEndTimeChange('');
    }
  }, [postType, onStartDateChange, onStartTimeChange, onEndDateChange, onEndTimeChange]);

  // Helper: For start date, don't allow past dates
  // For start time, if today, don't allow past time
  const minDate = new Date().toISOString().split('T')[0];
  const isStartToday = startDate === minDate || !startDate;

  // Calculate minTime as current time in HH:MM format
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const minTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  function handleGroupToggle(group: string): void {
    if (assignedGroups.includes(group)) {
      onAssignedGroupsChange(assignedGroups.filter(g => g !== group));
    } else {
      onAssignedGroupsChange([...assignedGroups, group]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule & Visibility</h2>
        <p className="text-sm text-gray-600">Set when and who can access this quiz</p>
      </div>

      {/* Post Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Post Type <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            type="button"
            className={`px-4 py-2 rounded-xl border-2 font-semibold transition w-full sm:w-auto ${
              postType === 'live'
                ? 'border-[#253A7B] bg-[#253A7B] text-white'
                : 'border-gray-200 bg-white text-[#253A7B] hover:border-[#253A7B]'
            }`}
            onClick={() => onPostTypeChange('live')}
          >
            Post Live (Now)
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-xl border-2 font-semibold transition w-full sm:w-auto ${
              postType === 'scheduled'
                ? 'border-[#253A7B] bg-[#253A7B] text-white'
                : 'border-gray-200 bg-white text-[#253A7B] hover:border-[#253A7B]'
            }`}
            onClick={() => onPostTypeChange('scheduled')}
          >
            Scheduled Post
          </button>
        </div>
      </div>

      {/* Schedule Fields */}
      {postType === 'scheduled' && (
        <>
          {/* Start Date/Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Start Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={startDate}
                  min={minDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  value={startTime}
                  min={isStartToday ? minTime : undefined}
                  onChange={(e) => onStartTimeChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* End Date/Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              End Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={endDate}
                  min={startDate || minDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  value={endTime}
                  min={endDate === startDate && startTime ? startTime : undefined}
                  onChange={(e) => onEndTimeChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Visibility <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Public */}
          <div
            onClick={() => onVisibilityChange('public')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              visibility === 'public'
                ? 'border-[#253A7B] bg-white'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <Eye className={`w-5 h-5 mt-0.5 ${visibility === 'public' ? 'text-[#253A7B]' : 'text-gray-400'}`} />
              <div>
                <h4 className={`font-semibold text-sm mb-1 ${visibility === 'public' ? 'text-[#253A7B]' : 'text-gray-900'}`}>
                  Public
                </h4>
                <p className="text-xs text-gray-600">Visible to everyone</p>
              </div>
            </div>
          </div>

          {/* Private */}
          <div
            onClick={() => onVisibilityChange('private')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              visibility === 'private'
                ? 'border-[#253A7B] bg-white'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <Eye className={`w-5 h-5 mt-0.5 ${visibility === 'private' ? 'text-[#253A7B]' : 'text-gray-400'}`} />
              <div>
                <h4 className={`font-semibold text-sm mb-1 ${visibility === 'private' ? 'text-[#253A7B]' : 'text-gray-900'}`}>
                  Private
                </h4>
                <p className="text-xs text-gray-600">Assigned groups only</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign to Groups (only if private) */}
      {visibility === 'private' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Assign to Groups <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {availableGroups.map((group) => (
              <div
                key={group}
                onClick={() => handleGroupToggle(group)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                  assignedGroups.includes(group)
                    ? 'border-[#253A7B] bg-white'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  assignedGroups.includes(group) ? 'border-[#253A7B] bg-[#253A7B]' : 'border-gray-300'
                }`}>
                  {assignedGroups.includes(group) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <Users className="w-5 h-5 text-gray-400" />
                <span className={`text-sm font-medium ${assignedGroups.includes(group) ? 'text-[#253A7B]' : 'text-gray-900'}`}>
                  {group}
                </span>
              </div>
            ))}
          </div>
          {assignedGroups.length > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              {assignedGroups.length} group{assignedGroups.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}
    </div>
  );
}
