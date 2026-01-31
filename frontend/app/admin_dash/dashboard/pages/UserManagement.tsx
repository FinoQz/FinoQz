'use client';

import React, { useEffect, useState, useRef } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import HoverDetails from '../components/user_management/HoverDetails';
import ApprovedUserCard from '../components/user_management/ApprovedUserCard';
import RejectedUserCard from '../components/user_management/RejectedUserCard';
import AllUsersTable from '../components/user_management/AllUsersTable';
import StatusMessage from '../components/user_management/StatusMessage';
import AddNewUserForm from '../components/user_management/AddNewUserForm';
import EmailManagement from '../components/user_management/EmailManagement';
import GroupManagement from '../components/user_management/GroupManagement';
import { UserPlus, Mail, Users } from 'lucide-react';
import { useSearchParams } from "next/navigation";
import { io, Socket } from 'socket.io-client';

interface User {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  createdAt: string;
  status?: string;
  emailVerified?: boolean;
  mobileVerified?: boolean;
}

interface ApprovedUser extends User {
  approvedAt: string;
}

interface RejectedUser extends User {
  rejectedAt: string;
}

type UserAction = 'approve' | 'reject';
type TabType = 'pending' | 'approved' | 'rejected' | 'all' | 'add-new' | 'email-users' | 'groups';

export default function UserManagement() {
  const searchParams = useSearchParams();
  const defaultTab = (searchParams.get("tab") as TabType) || "all";

  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<RejectedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState('');
  const socketRef = useRef<Socket | null>(null);

  // ✅ Initial fetch
  useEffect(() => {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const fetchAllUsers = async () => {
      try {
        const pendingRes = await apiAdmin.get('api/admin/panel/pending-users');
        await delay(300);
        const approvedRes = await apiAdmin.get('api/admin/panel/approved-users');
        await delay(300);
        const rejectedRes = await apiAdmin.get('api/admin/panel/rejected-users');

        setPendingUsers(pendingRes.data || []);
        setApprovedUsers(approvedRes.data || []);
        setRejectedUsers(rejectedRes.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers(); // ✅ only once on mount
  }, []);

  // ✅ WebSocket listener for real-time updates
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return;

    // ✅ Single socket instance
    if (!socketRef.current) {
      socketRef.current = io(backendUrl, { withCredentials: true });
    }
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket:', socket.id);
    });

    socket.on('users:update', (data) => {
      console.log('📡 Real-time user update:', data);
      if (data.pending) setPendingUsers(data.pending);
      if (data.approved) setApprovedUsers(data.approved);
      if (data.rejected) setRejectedUsers(data.rejected);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    return () => {
      // ✅ सिर्फ listeners हटाओ, disconnect मत करो
      socket.off('users:update');
    };
  }, []);

  // ✅ Approve / Reject user
  const handleAction = async (userId: string, action: UserAction): Promise<void> => {
    setActionStatus(`Processing ${action}...`);

    const user = pendingUsers.find(u => u._id === userId);
    if (!user) {
      console.warn("❌ User not found in pending list for ID:", userId);
      return;
    }

    try {
      console.log("📤 Sending action:", action, "for user ID:", user._id);

      const res = await apiAdmin.post(`api/admin/panel/${action}/${user._id}`);

      if (res.status === 200) {
        setPendingUsers(prev => prev.filter(u => u._id !== user._id));

        if (action === 'approve') {
          const approvedAt = res.data?.user?.approvedAt || new Date().toISOString();
          setApprovedUsers(prev => [...prev, { ...user, approvedAt }]);
          setActionStatus(`User approved successfully`);
        } else {
          const rejectedAt = res.data?.user?.rejectedAt || new Date().toISOString();
          setRejectedUsers(prev => [...prev, { ...user, rejectedAt }]);
          setActionStatus(`User rejected successfully`);
        }
      } else {
        console.warn(`⚠️ Unexpected response during ${action}:`, res);
        setActionStatus(`Failed to ${action} user`);
      }
    } catch (err) {
      console.error(`❌ Error during ${action}:`, err);
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
        <button onClick={() => setActiveTab('all')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'all' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>All Users</button>

        <button onClick={() => setActiveTab('add-new')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${activeTab === 'add-new' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
          <UserPlus className="w-4 h-4" /> Add New User
        </button>

        <button onClick={() => setActiveTab('email-users')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${activeTab === 'email-users' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
          <Mail className="w-4 h-4" /> Send Email
        </button>

        <button onClick={() => setActiveTab('groups')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${activeTab === 'groups' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
          <Users className="w-4 h-4" /> Groups
        </button>

        <button onClick={() => setActiveTab('pending')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'pending' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>Pending ({pendingUsers.length})</button>

        <button onClick={() => setActiveTab('approved')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'approved' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>Approved ({approvedUsers.length})</button>

        <button onClick={() => setActiveTab('rejected')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'rejected' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>Rejected ({rejectedUsers.length})</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-xs sm:text-sm font-medium text-gray-800">Pending Approvals</div>
          <div className="text-2xl sm:text-3xl font-bold text-[#253A7B] mt-2">{pendingUsers.length}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-xs sm:text-sm font-medium text-gray-700">Approved Today</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">
            {approvedUsers.filter(u => new Date(u.approvedAt).toDateString() === new Date().toDateString()).length}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-xs sm:text-sm font-medium text-gray-700">Rejected Today</div>
          <div className="text-2xl sm:text-3xl font-bold text-[#253A7B] mt-2">
            {rejectedUsers.filter(u => new Date(u.rejectedAt).toDateString() === new Date().toDateString()).length}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : (
        <>
          {activeTab === 'add-new' && <AddNewUserForm onSuccess={handleAddUserSuccess} onStatusChange={setActionStatus} />}
          {activeTab === 'email-users' && <EmailManagement onStatusChange={setActionStatus} />}

          {activeTab === 'groups' && <GroupManagement />}

          {activeTab === 'pending' && (
            pendingUsers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-lg">
                <div className="text-[#253A7B] text-lg font-medium">No pending users</div>
                <p className="text-gray-500 text-sm mt-2">All signups have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map(user => (
                  <HoverDetails key={user._id} user={user} onAction={handleAction} />
                ))}
              </div>
            )
          )}

          {activeTab === 'approved' && (
            approvedUsers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-lg">
                <div className="text-gray-600 text-lg font-medium">No approved users yet</div>
                <p className="text-gray-500 text-sm mt-2">Approved users will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedUsers.map(user => (
                  <ApprovedUserCard key={user._id} user={user} />
                ))}
              </div>
            )
          )}

          {activeTab === 'rejected' && (
            rejectedUsers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-lg">
                <div className="text-gray-600 text-lg font-medium">No rejected users yet</div>
                <p className="text-gray-500 text-sm mt-2">Rejected users will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rejectedUsers.map(user => (
                  <RejectedUserCard key={user._id} user={user} />
                ))}
              </div>
            )
          )}

          {activeTab === 'all' && <AllUsersTable />}
        </>
      )}

      <StatusMessage message={actionStatus} />
    </div>
  );
}