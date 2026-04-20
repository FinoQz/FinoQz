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
import { UserPlus, Mail, Users, Clock, UserCheck, UserX, FileText } from 'lucide-react';
import { useSearchParams } from "next/navigation";
import { io, Socket } from 'socket.io-client';
import ManagementSkeleton from '../components/user_management/ManagementSkeleton';

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

  // Track loading per category
  const [loadingStates, setLoadingStates] = useState({
    pending: false,
    approved: false,
    rejected: false,
    initial: true
  });

  const [actionStatus, setActionStatus] = useState('');
  const socketRef = useRef<Socket | null>(null);

  // ✅ 1. Initial Fetch (Active Tab Only)
  useEffect(() => {
    const fetchActiveTabData = async () => {
      setLoadingStates(prev => ({ ...prev, initial: true }));
      try {
        if (activeTab === 'pending') {
          const res = await apiAdmin.get('api/admin/panel/pending-users');
          setPendingUsers(res.data || []);
        } else if (activeTab === 'approved') {
          const res = await apiAdmin.get('api/admin/panel/approved-users');
          setApprovedUsers(res.data || []);
        } else if (activeTab === 'rejected') {
          const res = await apiAdmin.get('api/admin/panel/rejected-users');
          setRejectedUsers(res.data || []);
        } else if (activeTab === 'all') {
          // AllUsersTable handles its own fetching
        }
      } catch (err) {
        console.error("Error fetching active tab data:", err);
      } finally {
        setLoadingStates(prev => ({ ...prev, initial: false }));
      }
    };

    fetchActiveTabData();
  }, [activeTab]);

  // ✅ 2. Background Prefetch (After initial mount)
  useEffect(() => {
    const prefetchOtherData = async () => {
      try {
        const fetchPending = async () => {
          if (activeTab !== 'pending' && pendingUsers.length === 0) {
            const res = await apiAdmin.get('api/admin/panel/pending-users');
            setPendingUsers(res.data || []);
          }
        };

        const fetchApproved = async () => {
          if (activeTab !== 'approved' && approvedUsers.length === 0) {
            const res = await apiAdmin.get('api/admin/panel/approved-users');
            setApprovedUsers(res.data || []);
          }
        };

        const fetchRejected = async () => {
          if (activeTab !== 'rejected' && rejectedUsers.length === 0) {
            const res = await apiAdmin.get('api/admin/panel/rejected-users');
            setRejectedUsers(res.data || []);
          }
        };

        // Run in series to avoid network congestion
        await fetchPending();
        await fetchApproved();
        await fetchRejected();
      } catch (err) {
        console.warn("Background prefetch error:", err);
      }
    };

    if (!loadingStates.initial) {
      prefetchOtherData();
    }
  }, [loadingStates.initial]);

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
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6 sm:pb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Review and manage user signups and access</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        {[
          { label: 'Pending Approvals', value: pendingUsers.length, icon: Clock, color: 'text-amber-600' },
          { 
            label: 'Approved Today', 
            value: approvedUsers.filter(u => new Date(u.approvedAt).toDateString() === new Date().toDateString()).length, 
            icon: UserCheck, 
            color: 'text-green-600' 
          },
          { 
            label: 'Rejected Today', 
            value: rejectedUsers.filter(u => new Date(u.rejectedAt).toDateString() === new Date().toDateString()).length, 
            icon: UserX, 
            color: 'text-red-500' 
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-sm flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-gray-50 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs / Filters Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[
            { id: 'all', label: 'All Users', icon: Users },
            { id: 'add-new', label: 'Add User', icon: UserPlus },
            { id: 'email-users', label: 'Email', icon: Mail },
            { id: 'groups', label: 'Groups', icon: Users },
            { id: 'pending', label: `Pending (${pendingUsers.length})`, icon: Clock },
            { id: 'approved', label: `Approved (${approvedUsers.length})`, icon: UserCheck },
            { id: 'rejected', label: `Rejected (${rejectedUsers.length})`, icon: UserX },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-50/70 text-[#253A7B] border border-blue-100/50'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#253A7B]' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Rendering Logic */}
      {activeTab === 'add-new' && <AddNewUserForm onSuccess={handleAddUserSuccess} onStatusChange={setActionStatus} />}
      {activeTab === 'email-users' && <EmailManagement onStatusChange={setActionStatus} />}
      {activeTab === 'groups' && <GroupManagement />}

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        loadingStates.initial && pendingUsers.length === 0 ? (
          <ManagementSkeleton />
        ) : pendingUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No pending users</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">All signups have been reviewed and processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map(user => (
              <HoverDetails key={user._id} user={user} onAction={handleAction} />
            ))}
          </div>
        )
      )}

      {/* Approved Tab */}
      {activeTab === 'approved' && (
        loadingStates.initial && approvedUsers.length === 0 ? (
          <ManagementSkeleton />
        ) : approvedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
              <UserCheck className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No approved users</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Approved users will appear here after review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedUsers.map(user => (
              <ApprovedUserCard key={user._id} user={user} />
            ))}
          </div>
        )
      )}

      {/* Rejected Tab */}
      {activeTab === 'rejected' && (
        loadingStates.initial && rejectedUsers.length === 0 ? (
          <ManagementSkeleton />
        ) : rejectedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
              <UserX className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No rejected users</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Any rejected user signups will appear here.</p>
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

      <StatusMessage message={actionStatus} />
    </div>
  );
}