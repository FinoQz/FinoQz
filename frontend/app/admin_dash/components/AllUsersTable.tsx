'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Ban,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AllUser {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  status: 'Active' | 'Inactive';
  registrationDate: string;
  lastLogin: string;
}

export default function AllUsersTable() {
  // Dummy data
  const allUsersData: AllUser[] = [
    {
      _id: '1',
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      mobile: '+91 98765 43210',
      status: 'Active',
      registrationDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      lastLogin: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: '2',
      fullName: 'Priya Patel',
      email: 'priya.patel@example.com',
      mobile: '+91 87654 32109',
      status: 'Active',
      registrationDate: new Date(Date.now() - 86400000 * 3).toISOString(),
      lastLogin: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      _id: '3',
      fullName: 'Amit Kumar',
      email: 'amit.kumar@example.com',
      mobile: '+91 99988 77766',
      status: 'Inactive',
      registrationDate: new Date(Date.now() - 86400000 * 10).toISOString(),
      lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      _id: '4',
      fullName: 'Sneha Gupta',
      email: 'sneha.gupta@example.com',
      mobile: '+91 88877 66655',
      status: 'Active',
      registrationDate: new Date(Date.now() - 86400000 * 7).toISOString(),
      lastLogin: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  const [users, setUsers] = useState<AllUser[]>(allUsersData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [actionPopup, setActionPopup] = useState<{ userId: string; position: { x: number; y: number } } | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Search and Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.mobile && user.mobile.includes(searchQuery));
    
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Export Functions
  const exportToPDF = () => {
    alert('Export to PDF functionality - Will be implemented with jsPDF library');
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Status', 'Registration Date', 'Last Login'],
      ...filteredUsers.map(u => [
        u.fullName,
        u.email,
        u.mobile || 'N/A',
        u.status,
        formatDate(u.registrationDate),
        formatDateTime(u.lastLogin)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredUsers, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.json';
    a.click();
  };

  const handleActionClick = (userId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setActionPopup({
      userId,
      position: { x: rect.left, y: rect.bottom + 5 }
    });
  };

  const handleAction = (action: string, userId: string) => {
    alert(`${action} action for user ${userId}`);
    setActionPopup(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-900 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
              className="px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300 w-full sm:w-auto"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50/50 transition-all duration-300"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-gray-900 font-semibold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.mobile || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Active'
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {user.status === 'Active' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(user.registrationDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDateTime(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => handleActionClick(user._id, e)}
                      className="px-3 py-1 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Actions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-gray-900 font-semibold text-sm">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{user.fullName}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        user.status === 'Active'
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {user.status === 'Active' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Email:</span>
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Phone:</span>
                  <span>{user.mobile || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Registered:</span>
                  <span>{formatDate(user.registrationDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Last Login:</span>
                  <span className="text-xs">{formatDateTime(user.lastLogin)}</span>
                </div>
              </div>
              <button
                onClick={(e) => handleActionClick(user._id, e)}
                className="w-full mt-3 px-3 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                Actions
              </button>
            </div>
          ))
        )}
      </div>

      {/* Action Popup */}
      {actionPopup && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActionPopup(null)}
          />
          <div
            className="fixed z-50 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-2 w-48 animate-in fade-in zoom-in-95 duration-200"
            style={{
              left: `${actionPopup.position.x}px`,
              top: `${actionPopup.position.y}px`,
            }}
          >
            <button
              onClick={() => handleAction('View', actionPopup.userId)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300"
            >
              <Eye className="w-4 h-4 text-gray-900" />
              View Details
            </button>
            <button
              onClick={() => handleAction('Edit', actionPopup.userId)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300"
            >
              <Edit className="w-4 h-4 text-gray-700" />
              Edit User
            </button>
            <button
              onClick={() => handleAction('Block', actionPopup.userId)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded-xl transition-all duration-300"
            >
              <Ban className="w-4 h-4 text-yellow-600" />
              Block User
            </button>
            <button
              onClick={() => handleAction('Delete', actionPopup.userId)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              Delete User
            </button>
          </div>
        </>
      )}

      {/* Export Buttons */}
      <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-lg">
        <h3 className="text-sm font-semibold text-[#253A7B] mb-4">Export Users Data</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:shadow-lg transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Export to PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
          <button
            onClick={exportToJSON}
            className="flex items-center gap-2 px-4 py-2 bg-[#253A7B] text-white rounded-xl hover:bg-[#1e2f63] hover:shadow-lg transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Export to JSON
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>
    </div>
  );
}
