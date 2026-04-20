"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  Target
} from "lucide-react";
import apiAdmin from "@/lib/apiAdmin";

// Dynamic import for React Quill (No SSR) for editing
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-20 bg-gray-50 animate-pulse rounded-xl" />
});

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
  const toLocalInputValue = (dateLike: string | Date) => {
    const date = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
    const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  };

  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ScheduledEmail> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['link'],
      ['clean']
    ],
  }), []);

  const fetchScheduledEmails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiAdmin.get("api/admin/panel/scheduled-emails", {
        withCredentials: true,
      });
      setScheduledEmails(res.data || []);
    } catch (err) {
      console.error("Failed to fetch scheduled emails:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduledEmails();
  }, [fetchScheduledEmails, refreshKey]);

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: "text-amber-500", label: "Scheduled" },
      sent: { color: "text-emerald-500", label: "Delivered" },
      failed: { color: "text-rose-500", label: "Failed" },
      cancelled: { color: "text-gray-400", label: "Halted" },
    };

    const config = statusConfig[status];
    if (!config) return null;

    return (
      <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleEdit = (email: ScheduledEmail) => {
    if (email.status !== "pending") return;
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
      setEditingId(null);
      setEditData(null);
      fetchScheduledEmails();
    } catch (err) {
      console.error("Error saving edit:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (emailId: string) => {
    if (!confirm("Remove this schedule?")) return;
    try {
      await apiAdmin.delete(`api/admin/panel/scheduled-emails/${emailId}`, {
        withCredentials: true,
      });
      fetchScheduledEmails();
    } catch (err) {
      console.error("Error deleting email:", err);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mt-10 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Pipeline Timeline</h3>
        <span className="text-xs bg-white border border-gray-100 px-3 py-1 rounded-lg font-bold text-gray-400 shadow-sm">
          {scheduledEmails.length} Campaigns
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          <div className="p-16 text-center text-xs text-gray-300 font-bold uppercase tracking-widest animate-pulse">Syncing Database...</div>
        ) : (
          scheduledEmails.length === 0 ? (
            <div className="p-16 text-center">
              <Calendar className="w-8 h-8 text-gray-100 mx-auto mb-3" />
              <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">No Active Schedules</p>
            </div>
          ) : (
            scheduledEmails.map((email) => (
              <div key={email._id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                {editingId === email._id ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <input
                      type="text"
                      value={editData?.subject || ""}
                      onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 rounded-xl text-sm font-bold text-gray-800 outline-none border border-gray-100 focus:bg-white focus:border-indigo-100 transition-all"
                    />
                    <div className="quill-minimal-small">
                      <ReactQuill
                        theme="snow"
                        value={editData?.body || ""}
                        onChange={(val) => setEditData({ ...editData, body: val })}
                        modules={modules}
                        className="text-sm bg-gray-50 rounded-xl overflow-hidden border-gray-100"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 pt-2">
                       <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Update Execution Time</p>
                          <input
                            type="datetime-local"
                            value={editData?.scheduledFor ? toLocalInputValue(editData.scheduledFor) : ""}
                            onChange={(e) => setEditData({ ...editData, scheduledFor: new Date(e.target.value).toISOString() })}
                            className="w-full px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border border-gray-100 focus:bg-white focus:border-indigo-100"
                          />
                       </div>
                      <div className="flex gap-2 pt-5">
                        <button onClick={() => setEditingId(null)} className="px-5 py-2 text-xs font-bold text-gray-400 uppercase hover:text-gray-600 transition-colors">Cancel</button>
                        <button onClick={handleSaveEdit} disabled={isSaving} className="px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200">
                          {isSaving ? "Saving..." : "Update"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(email.status)}
                        <span className="text-[10px] text-gray-200 font-bold tracking-tighter">—</span>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-[11px] font-bold uppercase tracking-tighter">{formatDateTime(email.scheduledFor)}</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 mb-1 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{email.subject}</h4>
                      <div
                        className="text-xs text-gray-400 line-clamp-1 pointer-events-none opacity-80"
                        dangerouslySetInnerHTML={{ __html: email.body }}
                      />
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {email.status === "pending" && (
                        <button onClick={() => handleEdit(email)} className="p-2.5 bg-white hover:bg-indigo-50 rounded-xl text-gray-400 hover:text-indigo-600 border border-gray-100 hover:border-indigo-100 shadow-sm transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(email._id)} className="p-2.5 bg-white hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-600 border border-gray-100 hover:border-rose-100 shadow-sm transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )
        )}
      </div>

      <style jsx global>{`
        .quill-minimal-small .ql-toolbar.ql-snow {
           border: none;
           background: #fdfdfd;
           border-bottom: 1px solid #f9fafb;
           padding: 8px 12px;
        }
        .quill-minimal-small .ql-container.ql-snow {
           border: none;
           min-height: 100px;
           background: #fdfdfd;
           font-size: 13px;
        }
        .quill-minimal-small .ql-editor { padding: 12px 16px; }
      `}</style>
    </div>
  );
}
