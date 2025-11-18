'use client';

import React, { useState } from 'react';
import { Eye, Mail, CreditCard, RefreshCw, Award, ArrowUpDown } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  paymentStatus: 'paid' | 'unpaid' | 'pending';
  attemptStatus: 'submitted' | 'in-progress' | 'not-attempted';
  score: number | null;
  timeTaken: string | null;
}

interface ParticipantsTableProps {
  selectedParticipants: string[];
  onSelectionChange: (selected: string[]) => void;
  onViewAttempt: (attemptData: any) => void;
}

export default function ParticipantsTable({
  selectedParticipants,
  onSelectionChange,
  onViewAttempt
}: ParticipantsTableProps) {
  const [sortField, setSortField] = useState<keyof Participant>('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const participants: Participant[] = [
    {
      id: '1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@email.com',
      phone: '+91 98765 43210',
      registrationDate: '2025-01-15',
      paymentStatus: 'paid',
      attemptStatus: 'submitted',
      score: 85,
      timeTaken: '42 min'
    },
    {
      id: '2',
      name: 'Priya Patel',
      email: 'priya.patel@email.com',
      phone: '+91 87654 32109',
      registrationDate: '2025-01-14',
      paymentStatus: 'paid',
      attemptStatus: 'submitted',
      score: 92,
      timeTaken: '38 min'
    },
    {
      id: '3',
      name: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      phone: '+91 76543 21098',
      registrationDate: '2025-01-14',
      paymentStatus: 'pending',
      attemptStatus: 'in-progress',
      score: null,
      timeTaken: null
    },
    {
      id: '4',
      name: 'Sneha Singh',
      email: 'sneha.singh@email.com',
      phone: '+91 65432 10987',
      registrationDate: '2025-01-13',
      paymentStatus: 'paid',
      attemptStatus: 'submitted',
      score: 78,
      timeTaken: '45 min'
    },
    {
      id: '5',
      name: 'Vikram Reddy',
      email: 'vikram.reddy@email.com',
      phone: '+91 54321 09876',
      registrationDate: '2025-01-13',
      paymentStatus: 'unpaid',
      attemptStatus: 'not-attempted',
      score: null,
      timeTaken: null
    },
    {
      id: '6',
      name: 'Anjali Verma',
      email: 'anjali.verma@email.com',
      phone: '+91 43210 98765',
      registrationDate: '2025-01-12',
      paymentStatus: 'paid',
      attemptStatus: 'submitted',
      score: 88,
      timeTaken: '40 min'
    }
  ];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(participants.map(p => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedParticipants, id]);
    } else {
      onSelectionChange(selectedParticipants.filter(pid => pid !== id));
    }
  };

  const handleSort = (field: keyof Participant) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: string, type: 'payment' | 'attempt') => {
    if (type === 'payment') {
      const colors = {
        paid: 'bg-green-100 text-green-700 border-green-200',
        unpaid: 'bg-red-100 text-red-700 border-red-200',
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
      };
      return (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${colors[status as keyof typeof colors]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    } else {
      const colors = {
        submitted: 'bg-green-100 text-green-700 border-green-200',
        'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
        'not-attempted': 'bg-gray-100 text-gray-700 border-gray-200'
      };
      return (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${colors[status as keyof typeof colors]}`}>
          {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">All Participants</h3>
        <p className="text-sm text-gray-600 mt-1">{participants.length} total registrations</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-4 px-6 text-left">
                <input
                  type="checkbox"
                  checked={selectedParticipants.length === participants.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 accent-[#253A7B] cursor-pointer"
                />
              </th>
              <th className="py-4 px-6 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase hover:text-[#253A7B] transition"
                >
                  Name
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
              <th className="py-4 px-6 text-left">
                <button
                  onClick={() => handleSort('registrationDate')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase hover:text-[#253A7B] transition"
                >
                  Registration
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="py-4 px-6 text-left">
                <button
                  onClick={() => handleSort('score')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase hover:text-[#253A7B] transition"
                >
                  Score
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
              <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, index) => (
              <tr
                key={participant.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <td className="py-4 px-6">
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(participant.id)}
                    onChange={(e) => handleSelectOne(participant.id, e.target.checked)}
                    className="w-4 h-4 accent-[#253A7B] cursor-pointer"
                  />
                </td>
                <td className="py-4 px-6">
                  <p className="font-medium text-gray-900">{participant.name}</p>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{participant.email}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{participant.phone}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{participant.registrationDate}</td>
                <td className="py-4 px-6">{getStatusBadge(participant.paymentStatus, 'payment')}</td>
                <td className="py-4 px-6">{getStatusBadge(participant.attemptStatus, 'attempt')}</td>
                <td className="py-4 px-6">
                  {participant.score !== null ? (
                    <span className="font-bold text-gray-900">{participant.score}%</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {participant.timeTaken || '—'}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onViewAttempt(participant)}
                      disabled={participant.attemptStatus === 'not-attempted'}
                      className="p-2 hover:bg-blue-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="View Attempt"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      className="p-2 hover:bg-purple-100 rounded-lg transition"
                      title="Send Message"
                    >
                      <Mail className="w-4 h-4 text-purple-600" />
                    </button>
                    <button
                      className="p-2 hover:bg-green-100 rounded-lg transition"
                      title="Mark as Paid"
                    >
                      <CreditCard className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      className="p-2 hover:bg-red-100 rounded-lg transition"
                      title="Refund"
                    >
                      <RefreshCw className="w-4 h-4 text-red-600" />
                    </button>
                    <button
                      disabled={participant.attemptStatus !== 'submitted'}
                      className="p-2 hover:bg-yellow-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Generate Certificate"
                    >
                      <Award className="w-4 h-4 text-yellow-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
        <p>Showing {participants.length} of {participants.length} participants</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            Previous
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
