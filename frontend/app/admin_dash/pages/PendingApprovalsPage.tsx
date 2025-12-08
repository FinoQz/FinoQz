'use client';
import { useEffect, useState } from 'react';

interface PendingUser {
  _id: string;
  fullName: string;
  email: string;
}

export default function PendingApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);

  const fetchUsers = () => {
    fetch('/api/admin/panel/pending-users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    })
      .then(res => res.json())
      .then((data: PendingUser[]) => setUsers(data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const approve = async (id: string) => {
    await fetch(`/api/admin/panel/approve/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    fetchUsers();
  };

  const reject = async (id: string) => {
    await fetch(`/api/admin/panel/reject/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    fetchUsers();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pending User Approvals</h1>

      <div className="bg-white rounded-xl shadow p-4">
        {users.length === 0 ? (
          <p>No pending users</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b">
                  <td className="p-2">{u.fullName}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => approve(u._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => reject(u._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
