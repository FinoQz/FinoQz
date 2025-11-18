'use client';

import React, { useState } from 'react';
import { Mail, Send, X, CheckSquare, Square, Search } from 'lucide-react';

interface User {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  status: 'Active' | 'Inactive';
}

interface EmailManagementProps {
  onStatusChange?: (status: string) => void;
}

export default function EmailManagement({ onStatusChange }: EmailManagementProps) {
  // Dummy users data
  const allUsers: User[] = [
    { _id: '1', fullName: 'Rahul Sharma', email: 'rahul.sharma@example.com', mobile: '+91 98765 43210', status: 'Active' },
    { _id: '2', fullName: 'Priya Patel', email: 'priya.patel@example.com', mobile: '+91 87654 32109', status: 'Active' },
    { _id: '3', fullName: 'Amit Kumar', email: 'amit.kumar@example.com', mobile: '+91 99988 77766', status: 'Active' },
    { _id: '4', fullName: 'Sneha Gupta', email: 'sneha.gupta@example.com', mobile: '+91 88877 66655', status: 'Inactive' },
    { _id: '5', fullName: 'Vikram Singh', email: 'vikram.singh@example.com', mobile: '+91 77766 55544', status: 'Active' },
    { _id: '6', fullName: 'Anjali Verma', email: 'anjali.verma@example.com', mobile: '+91 66655 44433', status: 'Active' },
    { _id: '7', fullName: 'Rohit Mehta', email: 'rohit.mehta@example.com', mobile: '+91 55544 33322', status: 'Active' },
    { _id: '8', fullName: 'Neha Reddy', email: 'neha.reddy@example.com', mobile: '+91 44433 22211', status: 'Inactive' },
  ];

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const filteredUsers = allUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSendEmail = async () => {
    if (selectedUsers.length === 0) {
      onStatusChange?.('Please select at least one user');
      return;
    }
    if (!emailSubject.trim()) {
      onStatusChange?.('Please enter email subject');
      return;
    }
    if (!emailBody.trim()) {
      onStatusChange?.('Please enter email message');
      return;
    }

    setIsSending(true);
    onStatusChange?.(`Sending email to ${selectedUsers.length} users...`);

    try {
      // API call would go here
      // const selectedEmails = allUsers.filter(u => selectedUsers.includes(u._id)).map(u => u.email);
      // await api.post('/admin/send-email', {
      //   recipients: selectedEmails,
      //   subject: emailSubject,
      //   body: emailBody
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      onStatusChange?.(`Email sent successfully to ${selectedUsers.length} users!`);
      setEmailSubject('');
      setEmailBody('');
      setSelectedUsers([]);

      setTimeout(() => {
        onStatusChange?.('');
      }, 3000);
    } catch (err) {
      console.error('Error sending email:', err);
      onStatusChange?.('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#253A7B] rounded-xl">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#253A7B]">Email Management</h2>
            <p className="text-sm text-gray-600">Select users and compose email</p>
          </div>
        </div>

        {/* Selected Count */}
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Users</h3>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition text-sm"
            />
          </div>

          {/* Select All */}
          <button
            onClick={handleSelectAll}
            className="w-full mb-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            {selectedUsers.length === filteredUsers.length ? (
              <CheckSquare className="w-5 h-5 text-[#253A7B]" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            Select All ({filteredUsers.length})
          </button>

          {/* Users List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user._id)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedUsers.includes(user._id)
                    ? 'border-[#253A7B]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {selectedUsers.includes(user._id) ? (
                      <CheckSquare className="w-5 h-5 text-[#253A7B]" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 text-sm">{user.fullName}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{user.email}</p>
                    {user.mobile && <p className="text-xs text-gray-500 mt-0.5">{user.mobile}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Compose */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compose Email</h3>

          <div className="space-y-4">
            {/* Recipients Info */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">To:</span>{' '}
                {selectedUsers.length > 0
                  ? `${selectedUsers.length} recipient${selectedUsers.length > 1 ? 's' : ''}`
                  : 'No recipients selected'}
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your email message here..."
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition resize-none"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendEmail}
              disabled={isSending || selectedUsers.length === 0}
              className={`w-full px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] shadow-lg hover:shadow-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
                isSending || selectedUsers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send className="w-5 h-5" />
              {isSending ? 'Sending...' : `Send Email${selectedUsers.length > 0 ? ` to ${selectedUsers.length} User${selectedUsers.length > 1 ? 's' : ''}` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
