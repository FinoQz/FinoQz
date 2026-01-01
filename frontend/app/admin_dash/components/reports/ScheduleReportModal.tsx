'use client';

import React, { useState } from 'react';
import { Calendar, Mail, X } from 'lucide-react';

interface ScheduleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (schedule: ScheduleConfig) => void;
}

export interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  reportType: string;
  includePII: boolean;
}

export default function ScheduleReportModal({ isOpen, onClose, onSchedule }: ScheduleReportModalProps) {
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    frequency: 'weekly',
    time: '09:00',
    recipients: [],
    reportType: 'summary',
    includePII: false
  });
  const [emailInput, setEmailInput] = useState('');

  const handleAddEmail = () => {
    if (emailInput && emailInput.includes('@')) {
      setSchedule({
        ...schedule,
        recipients: [...schedule.recipients, emailInput]
      });
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setSchedule({
      ...schedule,
      recipients: schedule.recipients.filter(e => e !== email)
    });
  };

  const handleSchedule = () => {
    if (schedule.recipients.length > 0) {
      onSchedule(schedule);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#253A7B]" />
            <h3 className="text-lg font-bold text-gray-900">Schedule Report</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Frequency */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['daily', 'weekly', 'monthly'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setSchedule({ ...schedule, frequency: freq as any })}
                  className={`px-4 py-2 rounded-lg border-2 font-medium text-sm capitalize transition ${
                    schedule.frequency === freq
                      ? 'border-[#253A7B] bg-blue-50 text-[#253A7B]'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Delivery Time
            </label>
            <input
              type="time"
              value={schedule.time}
              onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
            />
          </div>

          {/* Report Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Report Type
            </label>
            <select
              value={schedule.reportType}
              onChange={(e) => setSchedule({ ...schedule, reportType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Report</option>
              <option value="analytics">Analytics Report</option>
            </select>
          </div>

          {/* Include PII */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={schedule.includePII}
              onChange={(e) => setSchedule({ ...schedule, includePII: e.target.checked })}
              className="w-4 h-4 text-[#253A7B] border-gray-300 rounded focus:ring-[#253A7B]"
            />
            <span className="text-sm text-gray-700">Include user PII in report</span>
          </label>

          {/* Recipients */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Email Recipients
            </label>
            <div className="flex gap-2 mb-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
                />
              </div>
              <button
                onClick={handleAddEmail}
                className="px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium text-sm"
              >
                Add
              </button>
            </div>

            {/* Email List */}
            {schedule.recipients.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {schedule.recipients.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="p-1 hover:bg-gray-200 rounded transition"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              Reports will be automatically generated and sent to the specified email addresses at the scheduled time.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={schedule.recipients.length === 0}
            className="px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Schedule Report
          </button>
        </div>
      </div>
    </div>
  );
}
