// 'use client';

// import React, { useEffect, useState } from 'react';
// import api from '@/lib/api';
// import HoverDetails from '../components/HoverDetails';
// import ApprovedUserCard from '../components/ApprovedUserCard';
// import RejectedUserCard from '../components/RejectedUserCard';
// import AllUsersTable from '../components/AllUsersTable';
// import StatusMessage from '../components/StatusMessage';
// import AddNewUserForm from '../components/AddNewUserForm';
// import EmailManagement from '../components/EmailManagement';
// import GroupManagement from '../components/GroupManagement';
// import { UserPlus, Mail } from 'lucide-react';
// import { useSearchParams } from "next/navigation";


// interface User {
//   _id: string;
//   fullName: string;
//   email: string;
//   mobile?: string;
//   createdAt: string;
//   status?: string;
//   emailVerified?: boolean;
//   mobileVerified?: boolean;
// }

// interface ApprovedUser extends User {
//   approvedAt: string;
// }

// interface RejectedUser extends User {
//   rejectedAt: string;
// }

// type UserAction = 'approve' | 'reject';
// type TabType = 'pending' | 'approved' | 'rejected' | 'all' | 'add-new' | 'email-users';

// export default function UserManagement() {
//   const [activeTab, setActiveTab] = useState<TabType>('all');

//   const [pendingUsers, setPendingUsers] = useState<User[]>([]);
//   const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
//   const [rejectedUsers, setRejectedUsers] = useState<RejectedUser[]>([]);

//   const [loading, setLoading] = useState(true);
//   const [actionStatus, setActionStatus] = useState('');


//   const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//   const searchParams = useSearchParams();
//   const defaultTab = searchParams.get("tab") as TabType || "all";



//   // ✅ Fetch all users from backend
//   useEffect(() => {
//     const fetchAllUsers = async () => {
//       try {
//         const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
//           api.get('/admin/panel/pending-users', { headers: { Authorization: `Bearer ${token}` } }),
//           api.get('/admin/panel/approved-users', { headers: { Authorization: `Bearer ${token}` } }),
//           api.get('/admin/panel/rejected-users', { headers: { Authorization: `Bearer ${token}` } }),
//         ]);

//         setPendingUsers(pendingRes.data || []);
//         setApprovedUsers(approvedRes.data || []);
//         setRejectedUsers(rejectedRes.data || []);
//       } catch (err) {
//         console.error("Error fetching users:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (!token) return;

//     fetchAllUsers(); // ✅ initial load

//     const interval = setInterval(() => {
//       fetchAllUsers(); // ✅ auto refresh every 10 seconds
//     }, 10000);

//     return () => clearInterval(interval); // ✅ cleanup
//   }, [token]);


//   // ✅ Approve / Reject user
//   const handleAction = async (userId: string, action: UserAction): Promise<void> => {
//     setActionStatus(`Processing ${action}...`);

//     const user = pendingUsers.find(u => u._id === userId);
//     if (!user) return;

//     try {
//       const res = await api.post(`/user/signup/${action}/${userId}`, null, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.status === 200) {
//         setPendingUsers(prev => prev.filter(u => u._id !== userId));

//         const currentTime = new Date().toISOString();

//         if (action === 'approve') {
//           setApprovedUsers(prev => [...prev, { ...user, approvedAt: currentTime }]);
//           setActionStatus(`User approved successfully`);
//         } else {
//           setRejectedUsers(prev => [...prev, { ...user, rejectedAt: currentTime }]);
//           setActionStatus(`User rejected successfully`);
//         }
//       } else {
//         setActionStatus(`Failed to ${action} user`);
//       }
//     } catch (err) {
//       console.error(`Error during ${action}:`, err);
//       setActionStatus(`Failed to ${action} user`);
//     }
//   };

//   const handleAddUserSuccess = () => {
//     setActiveTab('all');
//   };

//   return (
//     <div className="p-4 sm:p-6 lg:p-8">
//       {/* Header */}
//       <div className="mb-6 sm:mb-8">
//         <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-700">User Management</h1>
//         <p className="text-sm sm:text-base text-gray-600 mt-2">Review and manage user signups</p>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
//         <button onClick={() => setActiveTab('all')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'all' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>All Users</button>

//         <button onClick={() => setActiveTab('add-new')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${activeTab === 'add-new' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
//           <UserPlus className="w-4 h-4" /> Add New User
//         </button>

//         <button onClick={() => setActiveTab('email-users')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${activeTab === 'email-users' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
//           <Mail className="w-4 h-4" /> Send Email
//         </button>

//         <button onClick={() => setActiveTab('pending')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'pending' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>Pending ({pendingUsers.length})</button>

//         <button onClick={() => setActiveTab('approved')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'approved' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>Approved ({approvedUsers.length})</button>

//         <button onClick={() => setActiveTab('rejected')} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'rejected' ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>Rejected ({rejectedUsers.length})</button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
//         <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
//           <div className="text-xs sm:text-sm font-medium text-gray-800">Pending Approvals</div>
//           <div className="text-2xl sm:text-3xl font-bold text-[#253A7B] mt-2">{pendingUsers.length}</div>
//         </div>

//         <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
//           <div className="text-xs sm:text-sm font-medium text-gray-700">Approved Today</div>
//           <div className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">
//             {approvedUsers.filter(u => new Date(u.approvedAt).toDateString() === new Date().toDateString()).length}
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300">
//           <div className="text-xs sm:text-sm font-medium text-gray-700">Rejected Today</div>
//           <div className="text-2xl sm:text-3xl font-bold text-[#253A7B] mt-2">
//             {rejectedUsers.filter(u => new Date(u.rejectedAt).toDateString() === new Date().toDateString()).length}
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       {loading ? (
//         <div className="text-center py-12">
//           <p className="text-gray-600">Loading users...</p>
//         </div>
//       ) : (
//         <>
//           {activeTab === 'add-new' && <AddNewUserForm onSuccess={handleAddUserSuccess} onStatusChange={setActionStatus} />}
//           {activeTab === 'email-users' && <EmailManagement onStatusChange={setActionStatus} />}

//           {activeTab === 'pending' && (
//             pendingUsers.length === 0 ? (
//               <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-lg">
//                 <div className="text-[#253A7B] text-lg font-medium">No pending users</div>
//                 <p className="text-gray-500 text-sm mt-2">All signups have been reviewed</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {pendingUsers.map(user => (
//                   <HoverDetails key={user._id} user={user} onAction={handleAction} />
//                 ))}
//               </div>
//             )
//           )}

//           {activeTab === 'approved' && (
//             approvedUsers.length === 0 ? (
//               <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-lg">
//                 <div className="text-gray-600 text-lg font-medium">No approved users yet</div>
//                 <p className="text-gray-500 text-sm mt-2">Approved users will appear here</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {approvedUsers.map(user => (
//                   <ApprovedUserCard key={user._id} user={user} />
//                 ))}
//               </div>
//             )
//           )}

//           {activeTab === 'rejected' && (
//             rejectedUsers.length === 0 ? (
//               <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-lg">
//                 <div className="text-gray-600 text-lg font-medium">No rejected users yet</div>
//                 <p className="text-gray-500 text-sm mt-2">Rejected users will appear here</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {rejectedUsers.map(user => (
//                   <RejectedUserCard key={user._id} user={user} />
//                 ))}
//               </div>
//             )
//           )}

//           {activeTab === 'all' && <AllUsersTable />}
//         </>
//       )}

//       <StatusMessage message={actionStatus} />
//     </div>
//   );
// }
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
import GroupManagement from '../components/GroupManagement';
import { UserPlus, Mail, Users } from 'lucide-react';
import { useSearchParams } from "next/navigation";


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


  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;


  // ✅ Fetch all users from backend
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          api.get('api/admin/panel/pending-users', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('api/admin/panel/approved-users', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('api/admin/panel/rejected-users', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setPendingUsers(pendingRes.data || []);
        setApprovedUsers(approvedRes.data || []);
        setRejectedUsers(rejectedRes.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!token) return;

    fetchAllUsers(); // ✅ initial load

    const interval = setInterval(() => {
      fetchAllUsers(); // ✅ auto refresh every 10 seconds
    }, 10000);

    return () => clearInterval(interval); // ✅ cleanup
  }, [token]);


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

      const res = await api.post(`api/user/signup/${action}/${user._id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setPendingUsers(prev => prev.filter(u => u._id !== user._id));

        if (action === 'approve') {
          const approvedAt = res.data?.approvedAt || new Date().toISOString();
          setApprovedUsers(prev => [...prev, { ...user, approvedAt }]);
          setActionStatus(`User approved successfully`);
        } else {
          const rejectedAt = new Date().toISOString(); // backend doesn't return rejectedAt yet
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