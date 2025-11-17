'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import HoverDetails from '../components/HoverDetails';
import ApprovedUserCard from '../components/ApprovedUserCard';
import RejectedUserCard from '../components/RejectedUserCard';
import AllUsersTable from '../components/AllUsersTable';
import StatusMessage from '../components/StatusMessage';
import AddNewUserForm from '../components/AddNewUserForm';
import EmailManagement from '../components/EmailManagement';
import { UserPlus, Mail } from 'lucide-react';

interface User {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  createdAt: string;
}

interface ApprovedUser extends User {
  approvedAt: string;
}

interface RejectedUser extends User {
  rejectedAt: string;
}

type UserAction = 'approve' | 'reject';
type TabType = 'pending' | 'approved' | 'rejected' | 'all' | 'add-new' | 'email-users';

export default function UserManagement() {
  // Dummy data for client demo
  const dummyPendingUsers: User[] = [
    {
      _id: '1',
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      mobile: '+91 98765 43210',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      fullName: 'Priya Patel',
      email: 'priya.patel@example.com',
      mobile: '+91 87654 32109',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const dummyApprovedUsers: ApprovedUser[] = [
    {
      _id: '3',
      fullName: 'Amit Kumar',
      email: 'amit.kumar@example.com',
      mobile: '+91 99988 77766',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      approvedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const dummyRejectedUsers: RejectedUser[] = [
    {
      _id: '4',
      fullName: 'Sneha Gupta',
      email: 'sneha.gupta@example.com',
      mobile: '+91 88877 66655',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      rejectedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [pendingUsers, setPendingUsers] = useState<User[]>(dummyPendingUsers);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>(dummyApprovedUsers);
  const [rejectedUsers, setRejectedUsers] = useState<RejectedUser[]>(dummyRejectedUsers);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      try {
        const res = await api.get<User[]>('/admin/panel/pending-users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // If API returns data, use it; otherwise keep dummy data
        if (res.data && res.data.length > 0) {
          setPendingUsers(res.data);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        // Keep dummy data on error
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleAction = async (userId: string, action: UserAction): Promise<void> => {
    setActionStatus(`Processing ${action}...`);
    
    // Find user from pending list
    const user = pendingUsers.find(u => u._id === userId);
    if (!user) return;

    try {
      const res = await api.post(`/user/signup/${action}/${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        // Remove from pending
        setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
        
        // Add to approved or rejected list with timestamp
        const currentTime = new Date().toISOString();
        
        if (action === 'approve') {
          setApprovedUsers((prev) => [...prev, { ...user, approvedAt: currentTime }]);
          setActionStatus(`User approved successfully`);
        } else {
          setRejectedUsers((prev) => [...prev, { ...user, rejectedAt: currentTime }]);
          setActionStatus(`User rejected successfully`);
        }
      } else {
        setActionStatus(`Failed to ${action} user`);
      }
    } catch (err) {
      console.error(`Error during ${action}:`, err);
      setActionStatus(`Failed to ${action} user`);
    }
  };

  const handleAddUserSuccess = () => {
    setActiveTab('all');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-700">User Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Review and manage user signups</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#253A7B] text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => setActiveTab('add-new')}
          className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'add-new'
              ? 'bg-[#253A7B] text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
        <button
          onClick={() => setActiveTab('email-users')}
          className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'email-users'
              ? 'bg-[#253A7B] text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <Mail className="w-4 h-4" />
          Send Email
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-[#253A7B] text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          Pending ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
            activeTab === 'approved'
              ? 'bg-[#253A7B] text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          Approved ({approvedUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
            activeTab === 'rejected'
              ? 'bg-[#253A7B] text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          Rejected ({rejectedUsers.length})
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-xs sm:text-sm font-medium text-gray-800">Pending Approvals</div>
          <div className="text-2xl sm:text-3xl font-bold text-[#253A7B] mt-2">{pendingUsers.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-xs sm:text-sm font-medium text-gray-700">Approved Today</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">
            {approvedUsers.filter(u => {
              const today = new Date().toDateString();
              return new Date(u.approvedAt).toDateString() === today;
            }).length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-xs sm:text-sm font-medium text-gray-700">Rejected Today</div>
          <div className="text-2xl sm:text-3xl font-bold text-[#253A7B] mt-2">
            {rejectedUsers.filter(u => {
              const today = new Date().toDateString();
              return new Date(u.rejectedAt).toDateString() === today;
            }).length}
          </div>
        </div>
      </div>

      {/* User List Based on Active Tab */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : (
        <>
          {/* Add New User Form */}
          {activeTab === 'add-new' && (
            <AddNewUserForm 
              onSuccess={handleAddUserSuccess}
              onStatusChange={setActionStatus}
            />
          )}

          {/* Email Management */}
          {activeTab === 'email-users' && (
            <EmailManagement 
              onStatusChange={setActionStatus}
            />
          )}

          {/* Pending Users */}
          {activeTab === 'pending' && (
            <>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-lg">
                  <div className="text-[#253A7B] text-lg font-medium">No pending users</div>
                  <p className="text-gray-500 text-sm mt-2">All signups have been reviewed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <HoverDetails key={user._id} user={user} onAction={handleAction} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Approved Users */}
          {activeTab === 'approved' && (
            <>
              {approvedUsers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-lg">
                  <div className="text-gray-600 text-lg font-medium">No approved users yet</div>
                  <p className="text-gray-500 text-sm mt-2">Approved users will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedUsers.map((user) => (
                    <ApprovedUserCard key={user._id} user={user} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Rejected Users */}
          {activeTab === 'rejected' && (
            <>
              {rejectedUsers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-lg">
                  <div className="text-gray-600 text-lg font-medium">No rejected users yet</div>
                  <p className="text-gray-500 text-sm mt-2">Rejected users will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rejectedUsers.map((user) => (
                    <RejectedUserCard key={user._id} user={user} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* All Users */}
          {activeTab === 'all' && <AllUsersTable />}
        </>
      )}

      <StatusMessage message={actionStatus} />
    </div>
  );
}
