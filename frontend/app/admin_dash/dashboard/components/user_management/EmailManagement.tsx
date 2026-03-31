"use client";

import React, { useEffect, useState } from "react";
import { Mail, Send, CheckSquare, Square, Search, Sparkles, Eye, Calendar } from "lucide-react";
import apiAdmin from "@/lib/apiAdmin"; // ✅ cookie-based axios instance
import EmailPreviewModal from "./EmailPreviewModal";
import ScheduledEmails from "@/app/admin_dash/dashboard/components/user_management/ScheduledEmails";

interface User {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  status: "Active" | "Inactive" | "Blocked";
}

interface EmailManagementProps {
  onStatusChange?: (status: string) => void;
}

export default function EmailManagement({ onStatusChange }: EmailManagementProps) {
  const toLocalInputValue = (date: Date) => {
    const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  };

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showAiDraft, setShowAiDraft] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [scheduledEmailsRefreshKey, setScheduledEmailsRefreshKey] = useState(0);

  // ✅ Fetch users from backend using cookies
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiAdmin.get("api/admin/panel/all-users", {
          withCredentials: true, // ✅ ensure cookies are sent
        });
        setAllUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = allUsers.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user._id));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSendEmail = async () => {
    if (selectedUsers.length === 0) {
      onStatusChange?.("Please select at least one user");
      return;
    }
    if (!emailSubject.trim()) {
      onStatusChange?.("Please enter email subject");
      return;
    }
    if (!emailBody.trim()) {
      onStatusChange?.("Please enter email message");
      return;
    }

    setIsSending(true);
    onStatusChange?.(`Sending email to ${selectedUsers.length} users...`);

    try {
      const selectedEmails = allUsers
        .filter((u) => selectedUsers.includes(u._id))
        .map((u) => u.email);

      await apiAdmin.post(
        "api/admin/panel/send-email",
        {
          recipients: selectedEmails,
          subject: emailSubject,
          body: emailBody,
        },
        {
          withCredentials: true, // ✅ cookie-based auth
        }
      );

      onStatusChange?.(`Email sent successfully to ${selectedUsers.length} users!`);
      setEmailSubject("");
      setEmailBody("");
      setSelectedUsers([]);

      setTimeout(() => {
        onStatusChange?.("");
      }, 3000);
    } catch (err) {
      console.error("Error sending email:", err);
      onStatusChange?.("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduleEmail = async () => {
    if (selectedUsers.length === 0) {
      onStatusChange?.("Please select at least one user");
      return;
    }
    if (!emailSubject.trim()) {
      onStatusChange?.("Please enter email subject");
      return;
    }
    if (!emailBody.trim()) {
      onStatusChange?.("Please enter email message");
      return;
    }
    if (!scheduledFor) {
      onStatusChange?.("Please select date and time");
      return;
    }

    setIsSending(true);
    onStatusChange?.("Scheduling email...");

    try {
      const scheduledForIso = new Date(scheduledFor).toISOString();

      await apiAdmin.post(
        "api/admin/panel/schedule-email",
        {
          recipients: selectedUsers,
          subject: emailSubject,
          body: emailBody,
          scheduledFor: scheduledForIso,
        },
        { withCredentials: true }
      );

      onStatusChange?.("Email scheduled successfully!");
      setEmailSubject("");
      setEmailBody("");
      setSelectedUsers([]);
      setScheduledFor("");
      setShowSchedule(false);
      setScheduledEmailsRefreshKey((prev) => prev + 1);

      setTimeout(() => {
        onStatusChange?.("");
      }, 3000);
    } catch (err) {
      console.error("Error scheduling email:", err);
      onStatusChange?.("Failed to schedule email");
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateAiDraft = async () => {
    if (!aiPrompt.trim()) {
      onStatusChange?.("Please enter AI prompt");
      return;
    }

    setIsGeneratingAiDraft(true);
    onStatusChange?.("Generating AI draft...");

    try {
      const res = await apiAdmin.post(
        "api/admin/panel/generate-email-draft",
        { prompt: aiPrompt },
        { withCredentials: true }
      );

      setEmailSubject(res.data?.subject || "");
      setEmailBody(res.data?.body || "");
      setShowAiDraft(false);
      onStatusChange?.("AI draft generated. You can edit it before sending.");
    } catch (err) {
      console.error("AI draft generation failed:", err);
      onStatusChange?.("Failed to generate AI draft");
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#253A7B] rounded-xl">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#253A7B]">
              Email Management
            </h2>
            <p className="text-sm text-gray-600">Select users and compose email</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Users</h3>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition text-sm"
            />
          </div>

          {/* Select All */}
          <button
            onClick={handleSelectAll}
            className="w-full mb-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            {selectedUsers.length === filteredUsers.length ? (
              <CheckSquare className="w-5 h-5 text-[#253A7B]" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            Select All ({filteredUsers.length})
          </button>

          {/* Users List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-center text-gray-500 py-6">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleSelectUser(user._id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedUsers.includes(user._id)
                      ? "border-[#253A7B]"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {selectedUsers.includes(user._id) ? (
                        <CheckSquare className="w-5 h-5 text-[#253A7B]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {user.fullName}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${user.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : user.status === "Blocked"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-200 text-gray-700"
                            }`}
                        >
                          {user.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{user.email}</p>
                      {user.mobile && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {user.mobile}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Email Compose */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Compose Email</h3>
            <button
              onClick={() => setShowAiDraft((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#253A7B] hover:bg-blue-50 transition flex items-center gap-1"
              type="button"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Draft
            </button>
          </div>

          <div className="space-y-4">
            {showAiDraft && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-2">
                <label className="block text-xs font-semibold text-blue-900">Tell AI what email you want</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Example: Write a short email to approved users about new finance quizzes this week with a friendly tone."
                  rows={3}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-[#253A7B] focus:border-transparent resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateAiDraft}
                    disabled={isGeneratingAiDraft}
                    type="button"
                    className="px-3 py-1.5 bg-[#253A7B] text-white rounded-lg text-xs font-semibold hover:bg-[#1a2a5e] disabled:opacity-60"
                  >
                    {isGeneratingAiDraft ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>
            )}

            {/* Recipients Info */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">To:</span>{" "}
                {selectedUsers.length > 0
                  ? `${selectedUsers.length} recipient${selectedUsers.length > 1 ? "s" : ""
                  }`
                  : "No recipients selected"}
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your email message here..."
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition resize-none"
              />
            </div>

            {/* Send Button */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(true)}
                disabled={!emailSubject.trim() || !emailBody.trim()}
                className={`flex-1 px-6 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 ${!emailSubject.trim() || !emailBody.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
              >
                <Eye className="w-5 h-5" />
                Preview
              </button>

              <button
                onClick={() => setShowSchedule((prev) => !prev)}
                disabled={!emailSubject.trim() || !emailBody.trim()}
                className={`flex-1 px-6 py-3 bg-orange-100 text-orange-800 rounded-xl hover:bg-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 ${!emailSubject.trim() || !emailBody.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
              >
                <Calendar className="w-5 h-5" />
                Schedule
              </button>

              <button
                onClick={handleSendEmail}
                disabled={isSending || selectedUsers.length === 0}
                className={`flex-1 px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] shadow-lg hover:shadow-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 ${isSending || selectedUsers.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
              >
                <Send className="w-5 h-5" />
                {isSending
                  ? "Sending..."
                  : `Send Email${selectedUsers.length > 0
                    ? ` to ${selectedUsers.length} User${selectedUsers.length > 1 ? "s" : ""
                    }`
                    : ""
                  }`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        subject={emailSubject}
        body={emailBody}
      />

      {showSchedule && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-orange-900">Schedule for later</p>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              min={toLocalInputValue(new Date())}
              className="flex-1 px-3 py-2 border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-[#253A7B]"
            />
            <button
              onClick={handleScheduleEmail}
              disabled={isSending}
              className="px-4 py-2 bg-[#253A7B] text-white rounded-lg text-sm font-semibold hover:bg-[#1a2a5e] disabled:opacity-60"
            >
              {isSending ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </div>
      )}
      
      {/* Scheduled Emails Card */}
      <ScheduledEmails
        onStatusChange={onStatusChange}
        refreshKey={scheduledEmailsRefreshKey}
      />
    </div>
  );
}
