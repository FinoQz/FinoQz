'use client';

import React, { useState, useEffect } from "react";
import apiUser from "@/lib/apiUser"; // ✅ use cookie-based axios instance

type PendingUser = { _id: string; fullName: string; email: string };
type PendingUsersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  users: PendingUser[];
};

export default function PendingUsersModal({ isOpen, onClose, users }: PendingUsersModalProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState<PendingUser[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLocalUsers(users);
    }
  }, [isOpen, users]);

  if (!isOpen) return null;

  const handleAction = async (userId: string, action: "approve" | "reject") => {
    try {
      setLoadingId(userId);

      const res = await apiUser.post(`api/admin/panel/${action}/${userId}`); // ✅ no headers needed

      if (res.status === 200) {
        setLocalUsers(prev => prev.filter(u => u._id !== userId));
      }

      setLoadingId(null);
    } catch (err) {
      console.error(`❌ ${action} failed`, err);
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending User Requests</h2>

        {localUsers.length === 0 ? (
          <p className="text-gray-600 text-sm">No pending requests</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {localUsers.map((u) => (
              <div key={u._id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-800">{u.fullName}</p>
                  <p className="text-sm text-gray-600">{u.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(u._id, "approve")}
                    disabled={loadingId === u._id}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loadingId === u._id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleAction(u._id, "reject")}
                    disabled={loadingId === u._id}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {loadingId === u._id ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
