"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import apiAdmin from "@/lib/apiAdmin";

interface ScheduledEmail {
  _id: string;
  subject: string;
  body: string;
  recipients: Array<{ _id: string; fullName: string; email: string }>;
  recipientEmails: string[];
  scheduledFor: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  createdAt: string;
  sentAt?: string;
}

interface ScheduledEmailsProps {
  onStatusChange?: (status: string) => void;
  refreshKey?: number;
}

export default function ScheduledEmails({
  onStatusChange,
  refreshKey,
}: ScheduledEmailsProps) {
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ScheduledEmail> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchScheduledEmails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiAdmin.get("api/admin/panel/scheduled-emails", {
        withCredentials: true,
      });
      setScheduledEmails(res.data || []);
    } catch (err) {
      console.error("Failed to fetch scheduled emails:", err);
      onStatusChange?.("Failed to load scheduled emails");
    } finally {
      setLoading(false);
    }
  }, [onStatusChange]);

  useEffect(() => {
    fetchScheduledEmails();
  }, [fetchScheduledEmails, refreshKey]);

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
      pending: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: Clock,
        label: "Pending",
      },
      sent: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Sent",
      },
      failed: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: AlertCircle,
        label: "Failed",
      },
      cancelled: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: XCircle,
        label: "Cancelled",
      },
    };

    const config = statusConfig[status];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const handleEdit = (email: ScheduledEmail) => {
    if (email.status !== "pending") {
      onStatusChange?.("Can only edit pending scheduled emails");
      return;
    }
    setEditingId(email._id);
    setEditData({ ...email });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editData) return;

    setIsSaving(true);
    try {
      await apiAdmin.put(
        `api/admin/panel/scheduled-emails/${editingId}`,
        {
          subject: editData.subject,
          body: editData.body,
          scheduledFor: editData.scheduledFor,
        },
        { withCredentials: true }
      );

      onStatusChange?.("Scheduled email updated successfully");
      setEditingId(null);
      setEditData(null);
      fetchScheduledEmails();
    } catch (err) {
      console.error("Error saving edit:", err);
      onStatusChange?.("Failed to update scheduled email");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (emailId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled email?"))
      return;

    try {
      await apiAdmin.delete(`api/admin/panel/scheduled-emails/${emailId}`, {
        withCredentials: true,
      });

      onStatusChange?.("Scheduled email deleted");
      fetchScheduledEmails();
    } catch (err) {
      console.error("Error deleting email:", err);
      onStatusChange?.("Failed to delete scheduled email");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#253A7B] rounded-xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Scheduled Emails</h3>
            <p className="text-sm text-gray-600">Manage your queued communications</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-[#253A7B]">
          {scheduledEmails.length}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading scheduled emails...</p>
        </div>
      ) : scheduledEmails.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No scheduled emails yet</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {scheduledEmails.map((email) => (
            <div
              key={email._id}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4"
            >
              {editingId === email._id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={editData?.subject || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, subject: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#253A7B]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled For
                    </label>
                    <input
                      type="datetime-local"
                      value={
                        editData?.scheduledFor
                          ? new Date(editData.scheduledFor)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          scheduledFor: new Date(e.target.value).toISOString(),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#253A7B]"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditData(null);
                      }}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="px-3 py-1.5 bg-[#253A7B] text-white rounded-lg text-sm hover:bg-[#1a2a5e] disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {email.subject}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {email.body}
                      </p>
                    </div>
                    {getStatusBadge(email.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatDateTime(email.scheduledFor)}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      {email.recipientEmails.length} recipient
                      {email.recipientEmails.length > 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    {email.status === "pending" && (
                      <button
                        onClick={() => handleEdit(email)}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(email._id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
