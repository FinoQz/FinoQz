"use client";

import React, { useEffect, useState } from "react";
import { X, Award, Mail } from "lucide-react";
import apiAdmin from "@/lib/apiAdmin";

interface User {
  _id: string;
  fullName: string;
  email: string;
  hasCompleted: boolean;
  certificateIssued: boolean;
}

interface QuizAttempt {
  userId?: { _id: string; fullName?: string; email?: string } | string;
  userName?: string;
  name?: string;
  email?: string;
  status?: string;
  certificateIssued?: boolean;
}

interface GenerateCertificatePopupProps {
  quizId: string;
  onClose: () => void;
}

export default function GenerateCertificatePopup({ quizId, onClose }: GenerateCertificatePopupProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mailing, setMailing] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        setError("");
        // Fetch all participants for this quiz
        const res = await apiAdmin.get(`/api/quiz-attempts/quiz/${quizId}`);
        // Map to unique users, mark if completed and if certificate already issued
        const attempts = Array.isArray(res.data.attempts) ? res.data.attempts : [];
        const userMap: Record<string, User> = {};
        attempts.forEach((a: QuizAttempt) => {
          const id = typeof a.userId === 'string' ? a.userId : a.userId?._id;
          if (!id) return;
          if (!userMap[id]) {
            const userIdObj = typeof a.userId === 'string' ? null : a.userId;
            userMap[id] = {
              _id: id,
              fullName: userIdObj?.fullName || a.userName || a.name || "Unknown",
              email: userIdObj?.email || a.email || "",
              hasCompleted: false,
              certificateIssued: false,
            };
          }
          if (a.status === "submitted") {
            userMap[id].hasCompleted = true;
            userMap[id].certificateIssued = !!a.certificateIssued;
          }
        });
        setUsers(Object.values(userMap));
      } catch (err) {
        setError("Failed to load participants");
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [quizId]);

  const handleGenerate = async (user: User) => {
    setMailing(user._id);
    setSuccess(null);
    try {
      // Call backend to generate and mail certificate
      await apiAdmin.post(`/api/certificates/generate`, {
        quizId,
        userId: user._id,
      });
      setSuccess(`Certificate mailed to ${user.email}`);
      // Update UI
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, certificateIssued: true } : u));
    } catch (err) {
      setError("Failed to generate certificate");
    } finally {
      setMailing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-[90%] sm:w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" /> Issue Certificates
        </h2>
        {loading ? (
          <div className="text-gray-500 text-center py-8">Loading participants...</div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {users.length === 0 ? (
              <div className="text-gray-500 text-center">No participants found.</div>
            ) : (
              users.map((user) => (
                <div key={user._id} className="flex items-center justify-between gap-2 border-b py-2">
                  <div>
                    <div className="font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <button
                    disabled={!user.hasCompleted || user.certificateIssued || mailing === user._id}
                    onClick={() => handleGenerate(user)}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition
                      ${user.certificateIssued ? 'bg-green-100 text-green-700 cursor-not-allowed' : user.hasCompleted ? 'bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-secondary)]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    {user.certificateIssued ? (
                      <>
                        <Award className="w-4 h-4 text-green-600" /> Issued
                      </>
                    ) : mailing === user._id ? (
                      <span>Mailing...</span>
                    ) : user.hasCompleted ? (
                      <>
                        <Mail className="w-4 h-4" /> Generate & Mail
                      </>
                    ) : (
                      <>Not Completed</>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        {success && <div className="text-green-600 text-center mt-4">{success}</div>}
      </div>
    </div>
  );
}
