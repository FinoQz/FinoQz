// 'use client';

// import React, { JSX, useEffect, useMemo, useRef, useState } from 'react';
// import api from '@/lib/api';
// import { Search, PlusCircle, Trash2, Users, X } from 'lucide-react';
// import StatusMessage from '../components/StatusMessage';

// interface User {
//   _id: string;
//   fullName: string;
//   email: string;
//   mobile?: string;
//   createdAt?: string;
// }

// interface Group {
//   _id: string;
//   name: string;
//   members: string[]; // user ids
//   createdAt?: string;
//   createdBy?: string;
// }

// export default function GroupManagement(): JSX.Element {
//   const [allUsers, setAllUsers] = useState<User[]>([]);
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [groupsLoading, setGroupsLoading] = useState<boolean>(false);

//   // Create panel state
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [debouncedSearch, setDebouncedSearch] = useState<string>('');
//   const searchTimer = useRef<number | null>(null);

//   const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
//   const [groupName, setGroupName] = useState<string>('');
//   const [creating, setCreating] = useState<boolean>(false);
//   const [statusMessage, setStatusMessage] = useState<string>('');

//   const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

//   // Modal state for preview/edit
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [modalGroup, setModalGroup] = useState<Group | null>(null);
//   const [modalSelectedUserIds, setModalSelectedUserIds] = useState<Set<string>>(new Set());
//   const [modalSearch, setModalSearch] = useState<string>('');
//   const [modalDebouncedSearch, setModalDebouncedSearch] = useState<string>('');
//   const modalSearchTimer = useRef<number | null>(null);
//   const [modalSaving, setModalSaving] = useState<boolean>(false);

//   // Fetch all users and groups
//   useEffect(() => {
//     if (!token) return;

//     const fetchData = async (): Promise<void> => {
//       setLoading(true);
//       try {
//         const [usersRes, groupsRes] = await Promise.all([
//           api.get('/admin/panel/all-users', { headers: { Authorization: `Bearer ${token}` } }),
//           api.get('/admin/panel/groups', { headers: { Authorization: `Bearer ${token}` } }),
//         ]);
//         setAllUsers(usersRes?.data ?? []);
//         setGroups(groupsRes?.data ?? []);
//       } catch (err) {
//         // Keep lightweight logging
//         // eslint-disable-next-line no-console
//         console.error('Error fetching users/groups:', err);
//         setStatusMessage('Failed to load users or groups');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [token]);

//   // Debounce create-panel search
//   useEffect(() => {
//     if (searchTimer.current) {
//       window.clearTimeout(searchTimer.current);
//     }
//     searchTimer.current = window.setTimeout(() => {
//       setDebouncedSearch(searchTerm.trim().toLowerCase());
//     }, 250);
//     return () => {
//       if (searchTimer.current) window.clearTimeout(searchTimer.current);
//     };
//   }, [searchTerm]);

//   // Debounce modal search
//   useEffect(() => {
//     if (modalSearchTimer.current) {
//       window.clearTimeout(modalSearchTimer.current);
//     }
//     modalSearchTimer.current = window.setTimeout(() => {
//       setModalDebouncedSearch(modalSearch.trim().toLowerCase());
//     }, 250);
//     return () => {
//       if (modalSearchTimer.current) window.clearTimeout(modalSearchTimer.current);
//     };
//   }, [modalSearch]);

//   const filteredUsers = useMemo<User[]>(() => {
//     if (!debouncedSearch) return allUsers;
//     const q = debouncedSearch;
//     return allUsers.filter((u) =>
//       `${u.fullName} ${u.email} ${u.mobile ?? ''}`.toLowerCase().includes(q)
//     );
//   }, [allUsers, debouncedSearch]);

//   const filteredModalUserSuggestions = useMemo<User[]>(() => {
//     const q = modalDebouncedSearch;
//     const pool = q
//       ? allUsers.filter((u) =>
//           `${u.fullName} ${u.email} ${u.mobile ?? ''}`.toLowerCase().includes(q)
//         )
//       : allUsers;
//     return pool.filter((u) => !modalSelectedUserIds.has(u._id));
//   }, [allUsers, modalDebouncedSearch, modalSelectedUserIds]);

//   // Create-panel helpers
//   const toggleUser = (id: string) => {
//     setSelectedUserIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id);
//       else next.add(id);
//       return next;
//     });
//   };

//   const selectAllVisible = () => {
//     setSelectedUserIds((prev) => {
//       const next = new Set(prev);
//       filteredUsers.forEach((u) => next.add(u._id));
//       return next;
//     });
//   };

//   const clearSelection = () => setSelectedUserIds(new Set());

//   const handleCreateGroup = async (): Promise<void> => {
//     if (!groupName.trim()) {
//       setStatusMessage('Group name is required');
//       return;
//     }
//     if (selectedUserIds.size === 0) {
//       setStatusMessage('Select at least one member for the group');
//       return;
//     }
//     if (!token) {
//       setStatusMessage('Not authorized');
//       return;
//     }

//     setCreating(true);
//     setStatusMessage('Creating group...');
//     try {
//       const body = { name: groupName.trim(), members: Array.from(selectedUserIds) };
//       const res = await api.post('/admin/panel/groups', body, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.status === 201 || res.status === 200) {
//         const groupsRes = await api.get('/admin/panel/groups', { headers: { Authorization: `Bearer ${token}` } });
//         setGroups(groupsRes?.data ?? []);
//         setGroupName('');
//         clearSelection();
//         setStatusMessage('Group created successfully');
//       } else {
//         setStatusMessage('Failed to create group');
//       }
//     } catch (err) {
//       // eslint-disable-next-line no-console
//       console.error('Error creating group:', err);
//       setStatusMessage('Failed to create group');
//     } finally {
//       setCreating(false);
//     }
//   };

//   const handleDeleteGroup = async (groupId: string): Promise<void> => {
//     if (!confirm('Are you sure you want to delete this group?')) return;
//     if (!token) {
//       setStatusMessage('Not authorized');
//       return;
//     }

//     setGroupsLoading(true);
//     setStatusMessage('Deleting group...');
//     try {
//       const res = await api.delete(`/admin/panel/groups/${groupId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.status === 200) {
//         setGroups((prev) => prev.filter((g) => g._id !== groupId));
//         if (modalGroup?._id === groupId) closeModal();
//         setStatusMessage('Group deleted');
//       } else {
//         setStatusMessage('Failed to delete group');
//       }
//     } catch (err) {
//       // eslint-disable-next-line no-console
//       console.error('Error deleting group:', err);
//       setStatusMessage('Failed to delete group');
//     } finally {
//       setGroupsLoading(false);
//     }
//   };

//   // Modal handlers
//   const openModalForGroup = (groupId: string) => {
//     const g = groups.find((x) => x._id === groupId) ?? null;
//     if (!g) {
//       setStatusMessage('Group not found locally');
//       return;
//     }
//     setModalGroup({ ...g });
//     setModalSelectedUserIds(new Set(g.members));
//     setModalSearch('');
//     setModalDebouncedSearch('');
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     if (modalSaving) return; // prevent closing while saving
//     setIsModalOpen(false);
//     setModalGroup(null);
//     setModalSelectedUserIds(new Set());
//     setModalSaving(false);
//   };

//   const toggleModalMember = (id: string) => {
//     setModalSelectedUserIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id);
//       else next.add(id);
//       return next;
//     });
//   };

//   const addSuggestedToModal = (id: string) => {
//     setModalSelectedUserIds((prev) => {
//       const next = new Set(prev);
//       next.add(id);
//       return next;
//     });
//   };

//   const handleSaveModalChanges = async (): Promise<void> => {
//     if (!modalGroup) return;
//     if (!token) {
//       setStatusMessage('Not authorized');
//       return;
//     }

//     setModalSaving(true);
//     setStatusMessage('Saving group changes...');
//     try {
//       const payload = { name: modalGroup.name.trim(), members: Array.from(modalSelectedUserIds) };
//       const res = await api.put(`/admin/panel/groups/${modalGroup._id}`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.status === 200) {
//         setGroups((prev) => prev.map((g) => (g._id === modalGroup._id ? { ...g, ...payload } : g)));
//         setStatusMessage('Group updated');
//         closeModal();
//       } else {
//         setStatusMessage('Failed to save group');
//       }
//     } catch (err) {
//       // eslint-disable-next-line no-console
//       console.error('Error saving group:', err);
//       setStatusMessage('Failed to save group');
//     } finally {
//       setModalSaving(false);
//     }
//   };

//   const selectedCount = selectedUserIds.size;

//   const getUserById = (id: string): User | undefined => allUsers.find((u) => u._id === id);

//   return (
//     <div className="p-4 sm:p-6 lg:p-8">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
//           <Users className="w-5 h-5 text-[#253A7B]" />
//           Group Management
//         </h2>
//         <p className="text-sm text-gray-600 mt-1">Create and manage groups of users for broadcasts, permissions or segmentation.</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Create Group Panel */}
//         <div className="lg:col-span-1 bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-medium text-gray-700">Create New Group</h3>
//             <div className="text-sm text-gray-500">{selectedCount} selected</div>
//           </div>

//           <label className="text-sm text-gray-600">Group name</label>
//           <input
//             value={groupName}
//             onChange={(e) => setGroupName(e.target.value)}
//             placeholder="E.g. Marketing Team, Beta Testers"
//             className="mt-2 mb-4 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
//           />

//           <div className="text-sm text-gray-600 mb-2">Members (select from the list)</div>
//           <div className="flex gap-2 mb-3">
//             <button
//               onClick={selectAllVisible}
//               className="px-3 py-2 bg-[#253A7B] text-white rounded-lg text-sm hover:opacity-95 flex items-center gap-2"
//             >
//               <PlusCircle className="w-4 h-4" /> Select all visible
//             </button>
//             <button onClick={clearSelection} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
//               Clear
//             </button>
//           </div>

//           <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
//             <Search className="w-4 h-4 text-gray-400" />
//             <input
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search users by name, email or mobile"
//               className="w-full outline-none text-sm"
//             />
//           </div>

//           <div className="mt-3 max-h-56 overflow-auto">
//             {loading ? (
//               <div className="text-center text-gray-500 py-6">Loading users...</div>
//             ) : filteredUsers.length === 0 ? (
//               <div className="text-center text-gray-500 py-6">No users found</div>
//             ) : (
//               <ul className="space-y-2 mt-2">
//                 {filteredUsers.map((u) => {
//                   const isSelected = selectedUserIds.has(u._id);
//                   return (
//                     <li
//                       key={u._id}
//                       className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-[#EEF2FF]' : ''}`}
//                       onClick={() => toggleUser(u._id)}
//                     >
//                       <div className="flex flex-col">
//                         <span className="text-sm font-medium text-gray-800">{u.fullName}</span>
//                         <span className="text-xs text-gray-500">{u.email}</span>
//                       </div>
//                       <div className="text-sm text-gray-600">{isSelected ? '✓' : ''}</div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             )}
//           </div>

//           <div className="mt-4 flex items-center justify-between">
//             <div className="text-sm text-gray-600">{selectedCount} members selected</div>
//             <button
//               onClick={handleCreateGroup}
//               disabled={creating}
//               className="px-4 py-2 bg-[#253A7B] text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
//             >
//               {creating ? 'Creating...' : 'Create Group'}
//             </button>
//           </div>
//         </div>

//         {/* Groups List */}
//         <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-medium text-gray-700">Existing Groups</h3>
//             <div className="text-sm text-gray-500">{groups.length} groups</div>
//           </div>

//           {groupsLoading ? (
//             <div className="text-center py-8 text-gray-500">Working...</div>
//           ) : groups.length === 0 ? (
//             <div className="text-center py-12 text-gray-500">No groups yet. Create your first group.</div>
//           ) : (
//             <div className="space-y-3">
//               {groups.map((g) => (
//                 <div key={g._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:shadow-sm">
//                   <div>
//                     <div className="text-md font-medium text-gray-800">{g.name}</div>
//                     <div className="text-xs text-gray-500">{g.members.length} members</div>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => openModalForGroup(g._id)}
//                       className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
//                     >
//                       Preview / Edit
//                     </button>

//                     <button
//                       onClick={() => handleDeleteGroup(g._id)}
//                       className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-2"
//                     >
//                       <Trash2 className="w-4 h-4" /> Delete
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="mt-6">
//         <StatusMessage message={statusMessage} />
//       </div>

//       {/* Modal: Preview & Edit Group */}
//       {isModalOpen && modalGroup && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
//           {/* backdrop */}
//           <div
//             className="absolute inset-0 bg-black/40"
//             onClick={() => {
//               if (!modalSaving) closeModal();
//             }}
//           />

//           <div className="relative z-60 w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
//             <div className="flex items-center justify-between p-4 border-b border-gray-100">
//               <div className="flex items-center gap-3">
//                 <div className="text-lg font-medium text-gray-800">Edit Group</div>
//                 <div className="text-sm text-gray-500">Preview and manage members</div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => {
//                     if (!modalSaving) closeModal();
//                   }}
//                   className="p-2 rounded-md hover:bg-gray-100"
//                   title="Close"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* Left: group info + member list */}
//               <div className="lg:col-span-2">
//                 <label className="text-sm text-gray-600">Group name</label>
//                 <input
//                   value={modalGroup.name}
//                   onChange={(e) => setModalGroup((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
//                   className="mt-2 mb-4 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
//                 />

//                 <div className="flex items-center justify-between mb-2">
//                   <div className="text-sm text-gray-700 font-medium">Members ({modalSelectedUserIds.size})</div>
//                   <div className="text-xs text-gray-500">You can remove or add members here</div>
//                 </div>

//                 <div className="max-h-64 overflow-auto border border-gray-100 rounded-lg p-2">
//                   {Array.from(modalSelectedUserIds).length === 0 ? (
//                     <div className="text-center py-6 text-gray-500">No members in this group</div>
//                   ) : (
//                     <ul className="space-y-2">
//                       {Array.from(modalSelectedUserIds).map((id) => {
//                         const u = getUserById(id);
//                         return (
//                           <li key={id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
//                             <div className="flex items-center gap-3">
//                               <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center text-sm font-medium text-[#253A7B]">
//                                 {u ? u.fullName.split(' ').map((s) => s[0]).slice(0, 2).join('') : 'U'}
//                               </div>
//                               <div>
//                                 <div className="text-sm font-medium text-gray-800">{u ? u.fullName : 'Unknown User'}</div>
//                                 <div className="text-xs text-gray-500">{u ? u.email : id}</div>
//                               </div>
//                             </div>

//                             <button
//                               onClick={() => toggleModalMember(id)}
//                               className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100"
//                             >
//                               Remove
//                             </button>
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   )}
//                 </div>
//               </div>

//               {/* Right: add members via search/suggestions */}
//               <div className="lg:col-span-1">
//                 <div className="text-sm text-gray-600 mb-2">Add members</div>
//                 <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 mb-3">
//                   <Search className="w-4 h-4 text-gray-400" />
//                   <input
//                     value={modalSearch}
//                     onChange={(e) => setModalSearch(e.target.value)}
//                     placeholder="Search users by name or email"
//                     className="w-full outline-none text-sm"
//                   />
//                 </div>

//                 <div className="max-h-56 overflow-auto">
//                   {filteredModalUserSuggestions.length === 0 ? (
//                     <div className="text-center text-gray-500 py-6">No suggestions</div>
//                   ) : (
//                     <ul className="space-y-2">
//                       {filteredModalUserSuggestions.slice(0, 40).map((u) => (
//                         <li key={u._id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
//                           <div className="flex items-center gap-3">
//                             <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
//                               {u.fullName.split(' ').map((s) => s[0]).slice(0, 2).join('')}
//                             </div>
//                             <div>
//                               <div className="text-sm font-medium text-gray-800">{u.fullName}</div>
//                               <div className="text-xs text-gray-500">{u.email}</div>
//                             </div>
//                           </div>

//                           <button
//                             onClick={() => addSuggestedToModal(u._id)}
//                             className="px-2 py-1 text-xs bg-[#253A7B] text-white rounded-md hover:opacity-95"
//                           >
//                             Add
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </div>

//                 <div className="mt-4 flex flex-col gap-2">
//                   <button
//                     onClick={handleSaveModalChanges}
//                     disabled={modalSaving}
//                     className="px-4 py-2 bg-[#253A7B] text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
//                   >
//                     {modalSaving ? 'Saving...' : 'Save changes'}
//                   </button>

//                   <button
//                     onClick={() => modalGroup && handleDeleteGroup(modalGroup._id)}
//                     className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
//                   >
//                     Delete group
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
'use client';

import React, { JSX, useEffect, useMemo, useRef, useState } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { Search, PlusCircle, Trash2, Users, X } from 'lucide-react';
import StatusMessage from '../components/StatusMessage';

interface User {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  createdAt?: string;
}

interface Group {
  _id: string;
  name: string;
  members: (string | User)[];
  createdAt?: string;
  createdBy?: string;
}

export default function GroupManagement(): JSX.Element {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [groupsLoading, setGroupsLoading] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const searchTimer = useRef<number | null>(null);

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalGroup, setModalGroup] = useState<Group | null>(null);
  const [modalSelectedUserIds, setModalSelectedUserIds] = useState<Set<string>>(new Set());
  const [modalSearch, setModalSearch] = useState<string>('');
  const [modalDebouncedSearch, setModalDebouncedSearch] = useState<string>('');
  const modalSearchTimer = useRef<number | null>(null);
  const [modalSaving, setModalSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        const [usersRes, groupsRes] = await Promise.all([
          apiAdmin.get('api/admin/panel/all-users'),
          apiAdmin.get('api/admin/panel/groups'),
        ]);
        setAllUsers(usersRes?.data ?? []);
        setGroups(groupsRes?.data ?? []);
      } catch (err) {
        console.error('Error fetching users/groups:', err);
        setStatusMessage('Failed to load users or groups');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, 250);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (modalSearchTimer.current) clearTimeout(modalSearchTimer.current);
    modalSearchTimer.current = window.setTimeout(() => {
      setModalDebouncedSearch(modalSearch.trim().toLowerCase());
    }, 250);
    return () => {
      if (modalSearchTimer.current) clearTimeout(modalSearchTimer.current);
    };
  }, [modalSearch]);

  const filteredUsers = useMemo<User[]>(() => {
    if (!debouncedSearch) return allUsers;
    return allUsers.filter((u) =>
      `${u.fullName} ${u.email} ${u.mobile ?? ''}`.toLowerCase().includes(debouncedSearch)
    );
  }, [allUsers, debouncedSearch]);

  const filteredModalUserSuggestions = useMemo<User[]>(() => {
    const pool = modalDebouncedSearch
      ? allUsers.filter((u) =>
        `${u.fullName} ${u.email} ${u.mobile ?? ''}`.toLowerCase().includes(modalDebouncedSearch)
      )
      : allUsers;
    return pool.filter((u) => !modalSelectedUserIds.has(u._id));
  }, [allUsers, modalDebouncedSearch, modalSelectedUserIds]);

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      filteredUsers.forEach((u) => next.add(u._id));
      return next;
    });
  };

  const clearSelection = () => setSelectedUserIds(new Set());

  const handleCreateGroup = async (): Promise<void> => {
    if (!groupName.trim()) return setStatusMessage('Group name is required');
    if (selectedUserIds.size === 0) return setStatusMessage('Select at least one member');

    setCreating(true);
    setStatusMessage('Creating group...');
    try {
      const body = { name: groupName.trim(), members: Array.from(selectedUserIds) };
      const res = await apiAdmin.post('api/admin/panel/groups', body);
      if (res.status === 201 || res.status === 200) {
        const groupsRes = await apiAdmin.get('api/admin/panel/groups');
        setGroups(groupsRes?.data ?? []);
        setGroupName('');
        clearSelection();
        setStatusMessage('Group created successfully');
      } else {
        setStatusMessage('Failed to create group');
      }
    } catch (err) {
      console.error('Error creating group:', err);
      setStatusMessage('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    setGroupsLoading(true);
    setStatusMessage('Deleting group...');
    try {
      const res = await apiAdmin.delete(`api/admin/panel/groups/${groupId}`);
      if (res.status === 200) {
        setGroups((prev) => prev.filter((g) => g._id !== groupId));
        if (modalGroup?._id === groupId) closeModal();
        setStatusMessage('Group deleted');
      } else {
        setStatusMessage('Failed to delete group');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      setStatusMessage('Failed to delete group');
    } finally {
      setGroupsLoading(false);
    }
  };

  const openModalForGroup = (groupId: string) => {
    const g = groups.find((x) => x._id === groupId) ?? null;
    if (!g) return setStatusMessage('Group not found locally');

    setModalGroup({ ...g });
    const memberIds = g.members.map((m) => (typeof m === 'string' ? m : (m as User)._id));
    setModalSelectedUserIds(new Set(memberIds));
    setModalSearch('');
    setModalDebouncedSearch('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (modalSaving) return;
    setIsModalOpen(false);
    setModalGroup(null);
    setModalSelectedUserIds(new Set());
    setModalSaving(false);
  };

  const toggleModalMember = (id: string) => {
    setModalSelectedUserIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addSuggestedToModal = (id: string) => {
    setModalSelectedUserIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleSaveModalChanges = async (): Promise<void> => {
    if (!modalGroup) return;

    setModalSaving(true);
    setStatusMessage('Saving group changes...');
    try {
      const payload = { name: modalGroup.name.trim(), members: Array.from(modalSelectedUserIds) };
      const res = await apiAdmin.put(`api/admin/panel/groups/${modalGroup._id}`, payload);
      if (res.status === 200) {
        const updatedGroup = res.data;
        setGroups((prev) => prev.map((g) => (g._id === modalGroup._id ? updatedGroup : g)));
        setStatusMessage('Group updated');
        closeModal();
      } else {
        setStatusMessage('Failed to save group');
      }
    } catch (err) {
      console.error('Error saving group:', err);
      setStatusMessage('Failed to save group');
    } finally {
      setModalSaving(false);
    }
  };

  const selectedCount = selectedUserIds.size;
  const getUserById = (id: string): User | undefined => allUsers.find((u) => u._id === id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#253A7B]" />
          Group Management
        </h2>
        <p className="text-sm text-gray-600 mt-1">Create and manage groups of users for broadcasts, permissions or segmentation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Group Panel */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Create New Group</h3>
            <div className="text-sm text-gray-500">{selectedCount} selected</div>
          </div>

          <label className="text-sm text-gray-600">Group name</label>
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="E.g. Marketing Team, Beta Testers"
            className="mt-2 mb-4 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
          />

          <div className="text-sm text-gray-600 mb-2">Members (select from the list)</div>
          <div className="flex gap-2 mb-3">
            <button
              onClick={selectAllVisible}
              className="px-3 py-2 bg-[#253A7B] text-white rounded-lg text-sm hover:opacity-95 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Select all visible
            </button>
            <button onClick={clearSelection} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name, email or mobile"
              className="w-full outline-none text-sm"
            />
          </div>

          <div className="mt-3 max-h-56 overflow-auto">
            {loading ? (
              <div className="text-center text-gray-500 py-6">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-gray-500 py-6">No users found</div>
            ) : (
              <ul className="space-y-2 mt-2">
                {filteredUsers.map((u) => {
                  const isSelected = selectedUserIds.has(u._id);
                  return (
                    <li
                      key={u._id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-[#EEF2FF]' : ''}`}
                      onClick={() => toggleUser(u._id)}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">{u.fullName}</span>
                        <span className="text-xs text-gray-500">{u.email}</span>
                      </div>
                      <div className="text-sm text-gray-600">{isSelected ? '✓' : ''}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">{selectedCount} members selected</div>
            <button
              onClick={handleCreateGroup}
              disabled={creating}
              className="px-4 py-2 bg-[#253A7B] text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>

        {/* Groups List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Existing Groups</h3>
            <div className="text-sm text-gray-500">{groups.length} groups</div>
          </div>

          {groupsLoading ? (
            <div className="text-center py-8 text-gray-500">Working...</div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No groups yet. Create your first group.</div>
          ) : (
            <div className="space-y-3">
              {groups.map((g) => (
                <div key={g._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:shadow-sm">
                  <div>
                    <div className="text-md font-medium text-gray-800">{g.name}</div>
                    <div className="text-xs text-gray-500">{Array.isArray(g.members) ? g.members.length : 0} members</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModalForGroup(g._id)}
                      className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Preview / Edit
                    </button>

                    <button
                      onClick={() => handleDeleteGroup(g._id)}
                      className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <StatusMessage message={statusMessage} />
      </div>

      {/* Modal: Preview & Edit Group */}
      {isModalOpen && modalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (!modalSaving) closeModal();
            }}
          />

          <div className="relative z-60 w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="text-lg font-medium text-gray-800">Edit Group</div>
                <div className="text-sm text-gray-500">Preview and manage members</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!modalSaving) closeModal();
                  }}
                  className="p-2 rounded-md hover:bg-gray-100"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: group info + member list */}
              <div className="lg:col-span-2">
                <label className="text-sm text-gray-600">Group name</label>
                <input
                  value={modalGroup.name}
                  onChange={(e) => setModalGroup((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                  className="mt-2 mb-4 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
                />

                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-700 font-medium">Members ({modalSelectedUserIds.size})</div>
                  <div className="text-xs text-gray-500">You can remove or add members here</div>
                </div>

                <div className="max-h-64 overflow-auto border border-gray-100 rounded-lg p-2">
                  {Array.from(modalSelectedUserIds).length === 0 ? (
                    <div className="text-center py-6 text-gray-500">No members in this group</div>
                  ) : (
                    <ul className="space-y-2">
                      {Array.from(modalSelectedUserIds).map((id) => {
                        const u = getUserById(id);
                        return (
                          <li key={id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center text-sm font-medium text-[#253A7B]">
                                {u ? u.fullName.split(' ').map((s) => s[0]).slice(0, 2).join('') : 'U'}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">{u ? u.fullName : 'Unknown User'}</div>
                                <div className="text-xs text-gray-500">{u ? u.email : id}</div>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleModalMember(id)}
                              className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                            >
                              Remove
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right: add members via search/suggestions */}
              <div className="lg:col-span-1">
                <div className="text-sm text-gray-600 mb-2">Add members</div>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 mb-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Search users by name or email"
                    className="w-full outline-none text-sm"
                  />
                </div>

                <div className="max-h-56 overflow-auto">
                  {filteredModalUserSuggestions.length === 0 ? (
                    <div className="text-center text-gray-500 py-6">No suggestions</div>
                  ) : (
                    <ul className="space-y-2">
                      {filteredModalUserSuggestions.slice(0, 40).map((u) => (
                        <li key={u._id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                              {u.fullName.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-800">{u.fullName}</div>
                              <div className="text-xs text-gray-500">{u.email}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => addSuggestedToModal(u._id)}
                            className="px-2 py-1 text-xs bg-[#253A7B] text-white rounded-md hover:opacity-95"
                          >
                            Add
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={handleSaveModalChanges}
                    disabled={modalSaving}
                    className="px-4 py-2 bg-[#253A7B] text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {modalSaving ? 'Saving...' : 'Save changes'}
                  </button>

                  <button
                    onClick={() => modalGroup && handleDeleteGroup(modalGroup._id)}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                  >
                    Delete group
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
