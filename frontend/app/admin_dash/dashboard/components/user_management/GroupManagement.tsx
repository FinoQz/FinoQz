'use client';

import React, { JSX, useEffect, useMemo, useRef, useState } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { Search, PlusCircle, Trash2, Users, X } from 'lucide-react';
import StatusMessage from './StatusMessage';

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

        const usersArray = Array.isArray(usersRes?.data) ? usersRes.data : (usersRes?.data?.users ?? []);
        setAllUsers(usersArray);
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
    return pool.filter((u) => {
      return !modalSelectedUserIds.has(u._id);
    });
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
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 border-b border-gray-100 pb-6 sm:pb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#253A7B]" />
            Group Management
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Create and manage your user segments and audience groups</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
           <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">{groups.length} active groups</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Group Panel */}
        <div className="lg:col-span-1 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm flex flex-col h-fit">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
            <h3 className="text-md font-semibold text-gray-900">Create New Group</h3>
            <span className="text-xs text-gray-500 font-medium">{selectedCount} selected</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Group Name</label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="E.g. Marketing Team"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#253A7B]/10 focus:border-[#253A7B] transition-all"
              />
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-gray-700 mb-2 block">Add Members</label>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={selectAllVisible}
                  className="flex-1 py-1.5 text-xs font-medium text-[#253A7B] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  Select All
                </button>
                <button 
                  onClick={clearSelection} 
                  className="flex-1 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name/email..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#253A7B] transition-all"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-gray-50 rounded-lg p-1 space-y-1">
              {loading ? (
                <div className="text-center py-6 text-gray-400 text-xs italic">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs italic">No users found</div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUserIds.has(u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => toggleUser(u._id)}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-gray-800 truncate">{u.fullName}</p>
                        <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#253A7B] border-[#253A7B]' : 'bg-white border-gray-200'}`}>
                        {isSelected && <span className="text-[8px] text-white font-bold">✓</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={handleCreateGroup}
            disabled={creating || !groupName.trim() || selectedUserIds.size === 0}
            className="mt-6 w-full py-2.5 bg-[#253A7B] text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {creating ? 'Creating Group...' : 'Create Group'}
          </button>
        </div>

        {/* Groups List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
             <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-gray-900">Existing Groups</h3>
                <span className="text-xs text-gray-500">{groups.length} groups total</span>
             </div>
          </div>

          <div className="min-h-[400px]">
            {groupsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-xl">
                 <div className="w-8 h-8 border-4 border-gray-100 border-t-[#253A7B] rounded-full animate-spin mb-4" />
                 <p className="text-gray-500 text-sm font-medium">Updating groups...</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No groups found</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Click Create Group on the left to organize your users.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {groups.map((g) => (
                  <div key={g._id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:border-[#253A7B]/30 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-gray-50 text-[#253A7B] transition-colors group-hover:bg-blue-50">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-md font-bold text-gray-900">{g.name}</h4>
                          <div className="flex items-center gap-3 mt-0.5">
                             <p className="text-xs text-gray-500 font-medium">{Array.isArray(g.members) ? g.members.length : 0} members</p>
                             <span className="w-1 h-1 bg-gray-200 rounded-full" />
                             <p className="text-[10px] text-gray-400 font-medium">ID: {g._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModalForGroup(g._id)}
                          className="px-4 py-2 text-xs font-semibold text-[#253A7B] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(g._id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
          />          <div className="relative z-60 w-full max-w-4xl mx-4 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col h-[85vh] max-h-[750px] border border-gray-100">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#253A7B]" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-gray-900">Manage Group Members</h3>
                  <p className="text-xs text-gray-500">{modalSelectedUserIds.size} members in this group</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              {/* Left: Active Members */}
              <div className="lg:w-2/3 flex flex-col h-full bg-white">
                <div className="p-6 border-b border-gray-50 bg-gray-50/10">
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Group Name</label>
                  <input
                    value={modalGroup.name}
                    onChange={(e) => setModalGroup((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 outline-none focus:border-[#253A7B] transition-all"
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col">
                   <div className="flex items-center justify-between mb-4 px-1">
                      <p className="text-xs font-bold text-gray-800 uppercase tracking-tight">Active Members</p>
                      <span className="text-[10px] text-gray-400 font-medium">Changes apply permanently on save</span>
                   </div>

                   <div className="space-y-2">
                    {Array.from(modalSelectedUserIds).length === 0 ? (
                      <div className="text-center py-20 bg-gray-50/30 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                         <Users className="w-8 h-8 text-gray-200 mb-2" />
                         <p className="text-xs text-gray-400 font-medium italic">No members found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Array.from(modalSelectedUserIds).map((id) => {
                          const u = getUserById(id);
                          return (
                            <div key={id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-all">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-[10px] font-bold text-[#253A7B] transition-colors">
                                  {u ? u.fullName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-gray-900 truncate">{u ? u.fullName : 'Unknown User'}</div>
                                  <div className="text-[10px] text-gray-500 truncate">{u ? u.email : id}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleModalMember(id)}
                                className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                   </div>
                </div>
              </div>

              {/* Right: Search & Add */}
              <div className="lg:w-1/3 flex flex-col h-full bg-white">
                <div className="p-6 border-b border-gray-50 bg-gray-50/5">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Add More Members</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      placeholder="Find suggestions..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#253A7B] transition-all"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                  {filteredModalUserSuggestions.length === 0 ? (
                    <div className="text-center py-10 italic text-xs text-gray-400">No suggestions found</div>
                  ) : (
                    filteredModalUserSuggestions.slice(0, 50).map((u) => (
                      <div key={u._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:bg-blue-50 group-hover:text-[#253A7B] transition-colors">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-800 truncate">{u.fullName}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => addSuggestedToModal(u._id)}
                          className="px-2 py-1 text-[10px] font-semibold text-[#253A7B] border border-blue-100 bg-blue-50 hover:bg-[#253A7B] hover:text-white rounded transition-all"
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 bg-white border-t border-gray-100 space-y-3">
                  <button
                    onClick={handleSaveModalChanges}
                    disabled={modalSaving}
                    className="w-full py-2.5 bg-[#253A7B] text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {modalSaving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => modalGroup && handleDeleteGroup(modalGroup._id)}
                    className="w-full py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    Delete Group
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
