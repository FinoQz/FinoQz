"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Send, Search, Sparkles, Eye,
  Image as ImageIcon, Paperclip, X, Layout, Plus
} from "lucide-react";
import apiAdmin from "@/lib/apiAdmin";
import EmailPreviewModal from "./EmailPreviewModal";
import ScheduledEmails from "@/app/admin_dash/dashboard/components/user_management/ScheduledEmails";

// Dynamic import for React Quill (No SSR)
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-40 bg-gray-50/50 animate-pulse rounded-xl" />
});


interface User {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  status: "Active" | "Inactive" | "Blocked";
  type: "User";
}

interface NewsletterSubscriber {
  _id: string;
  name?: string;
  email: string;
  active: boolean;
  type: "Subscriber";
}

interface RawUser {
  _id: string;
  fullName?: string;
  email: string;
  mobile?: string;
  status?: User["status"];
}

interface RawSubscriber {
  _id: string;
  name?: string;
  email: string;
  active?: boolean;
}

type Recipient = User | NewsletterSubscriber;

interface EmailManagementProps {
  onStatusChange?: (status: string) => void;
}

export default function EmailManagement({ onStatusChange }: EmailManagementProps) {
  const toLocalInputValue = (date: Date) => {
    const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  };

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [newsSubscribers, setNewsSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [targetAudience, setTargetAudience] = useState<"all" | "users" | "newsletter">("all");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Promotional Fields
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string>("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const [isSending, setIsSending] = useState(false);
  const [showAiDraft, setShowAiDraft] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [scheduledEmailsRefreshKey, setScheduledEmailsRefreshKey] = useState(0);

  const heroInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }), []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, newsRes] = await Promise.all([
          apiAdmin.get("api/admin/panel/all-users"),
          apiAdmin.get("api/newsletter/admin/all")
        ]);

        const usersArray: RawUser[] = Array.isArray(usersRes.data)
          ? usersRes.data
          : (usersRes.data?.users ?? []);

        const subsArray: RawSubscriber[] = Array.isArray(newsRes.data)
          ? newsRes.data
          : (newsRes.data?.subscribers ?? []);

        const usersWithType: User[] = usersArray.map((u) => ({
          _id: u._id,
          fullName: u.fullName ?? "",
          email: u.email,
          mobile: u.mobile,
          status: u.status ?? "Active",
          type: "User",
        }));

        const subsWithType: NewsletterSubscriber[] = subsArray
          .filter((s) => Boolean(s.active))
          .map((s) => ({
            _id: s._id,
            name: s.name,
            email: s.email,
            active: true,
            type: "Subscriber",
          }));

        setAllUsers(usersWithType);
        setNewsSubscribers(subsWithType);
      } catch (err) {
        console.error("Failed to fetch recipients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRecipientsPool = (): Recipient[] => {
    if (targetAudience === "users") return allUsers;
    if (targetAudience === "newsletter") return newsSubscribers;
    const merged = [...allUsers, ...newsSubscribers];
    const seen = new Set();
    return merged.filter(item => {
      if (seen.has(item.email)) return false;
      seen.add(item.email);
      return true;
    });
  };

  const filteredRecipients = getRecipientsPool().filter(
    (item) =>
      (item.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((item.type === "User" ? item.fullName : item.name) || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedRecipients.length === filteredRecipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(filteredRecipients.map((item) => item._id));
    }
  };

  const handleSelectRecipient = (id: string) => {
    if (selectedRecipients.includes(id)) {
      setSelectedRecipients(selectedRecipients.filter((rid) => rid !== id));
    } else {
      setSelectedRecipients([...selectedRecipients, id]);
    }
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImageFile(file);
      setHeroPreview(URL.createObjectURL(file));
    }
  };

  const handleSendEmail = async () => {
    if (selectedRecipients.length === 0 || !emailSubject.trim()) return;
    setIsSending(true);
    onStatusChange?.(`Uploading & Sending...`);
    try {
      const pool = getRecipientsPool();
      const selectedPool = pool.filter(r => selectedRecipients.includes(r._id));
      const emails = selectedPool.map(r => r.email);

      const formData = new FormData();
      formData.append("subject", emailSubject);
      formData.append("body", emailBody);
      if (heroImageFile) formData.append("heroImage", heroImageFile);
      formData.append("ctaText", ctaText);
      formData.append("ctaUrl", ctaUrl);
      emails.forEach(email => formData.append("recipients[]", email));
      attachments.forEach(file => formData.append("attachments", file));

      await apiAdmin.post("api/admin/panel/send-email", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      onStatusChange?.(`Broadcast successful`);
      resetForm();
    } catch (err) {
      onStatusChange?.("Delivery failed");
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduleEmail = async () => {
    if (selectedRecipients.length === 0 || !emailSubject.trim() || !scheduledFor) return;
    setIsSending(true);
    onStatusChange?.(`Queuing...`);
    try {
      const pool = getRecipientsPool();
      const selectedPool = pool.filter(r => selectedRecipients.includes(r._id));
      const recipientIds = selectedPool.filter(r => r.type === "User").map(r => r._id);
      const recipientEmails = selectedPool.filter(r => r.type === "Subscriber").map(r => r.email);

      const formData = new FormData();
      formData.append("subject", emailSubject);
      formData.append("body", emailBody);
      if (heroImageFile) formData.append("heroImage", heroImageFile);
      formData.append("ctaText", ctaText);
      formData.append("ctaUrl", ctaUrl);
      formData.append("scheduledFor", new Date(scheduledFor).toISOString());
      recipientIds.forEach(id => formData.append("recipients[]", id));
      recipientEmails.forEach(email => formData.append("recipientEmails[]", email));
      attachments.forEach(file => formData.append("attachments", file));

      await apiAdmin.post("api/admin/panel/schedule-email", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      onStatusChange?.("Scheduled successfully");
      resetForm();
      setShowSchedule(false);
      setScheduledEmailsRefreshKey(prev => prev + 1);
    } catch (err) {
      onStatusChange?.("Schedule failed");
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setEmailSubject("");
    setEmailBody("");
    setHeroImageFile(null);
    setHeroPreview("");
    setCtaText("");
    setCtaUrl("");
    setAttachments([]);
    setSelectedRecipients([]);
    setTimeout(() => onStatusChange?.(""), 2000);
  };

  const handleGenerateAiDraft = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAiDraft(true);
    try {
      const res = await apiAdmin.post("api/admin/panel/generate-email-draft", { prompt: aiPrompt });
      setEmailSubject(res.data?.subject || "");
      setEmailBody(res.data?.body || "");
      setShowAiDraft(false);
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 selection:bg-indigo-50">
      {/* Balanced Header */}
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-800">Email Command Center</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold flex items-center gap-2">
            Professional Outreach <span className="w-1 h-1 bg-gray-200 rounded-full" /> {allUsers.length + newsSubscribers.length} total reach
          </p>
        </div>

        <div className="flex bg-gray-50/80 p-1 rounded-xl border border-gray-100 backdrop-blur-sm">
          {(["all", "users", "newsletter"] as const).map(type => (
            <button
              key={type}
              onClick={() => { setTargetAudience(type); setSelectedRecipients([]); }}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${targetAudience === type ? "bg-white text-indigo-600 shadow-sm border border-indigo-50" : "text-gray-400 hover:text-gray-600"}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Balanced Recipients List */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl flex flex-col h-[700px] shadow-sm">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recipients</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-bold">{selectedRecipients.length} Selected</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-100 outline-none text-sm font-medium transition-all transition-shadow focus:shadow-md placeholder:text-gray-300"
              />
            </div>
            <button onClick={handleSelectAll} className="w-full py-2 text-xs font-bold text-gray-500 border border-gray-100 rounded-xl hover:bg-gray-50 tracking-wide transition-all uppercase">
              {selectedRecipients.length === filteredRecipients.length ? "Deselect All" : "Select All Available"}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-4 scrollbar-hide">
            {loading ? (
              Array(10).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-50/50 rounded-xl animate-pulse mb-2" />)
            ) : filteredRecipients.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs font-bold text-gray-300 uppercase italic">No matches found</p>
              </div>
            ) : filteredRecipients.map((item) => (
              <div
                key={item._id}
                onClick={() => handleSelectRecipient(item._id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group ${selectedRecipients.includes(item._id) ? "border-indigo-100 bg-indigo-50/30" : "border-transparent hover:bg-gray-50"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${item.type === 'User' ? 'bg-white text-indigo-500 border border-indigo-100 shadow-sm' : 'bg-white text-emerald-500 border border-emerald-100 shadow-sm'}`}>
                    {(item.type === 'User' ? item.fullName : item.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${selectedRecipients.includes(item._id) ? "text-indigo-900" : "text-gray-700"}`}>
                      {item.type === 'User' ? item.fullName : (item.name || 'Subscriber')}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">{item.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Balanced Editor Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50 shadow-sm">
            <div className="p-6 space-y-6">
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Subject</p>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="What's the highlight of this campaign?"
                  className="w-full px-5 py-3 bg-gray-50/50 rounded-xl text-base font-bold text-gray-800 border-2 border-transparent focus:bg-white focus:border-indigo-100 outline-none transition-all placeholder:text-gray-300 shadow-sm focus:shadow-indigo-100/20"
                />
              </div>

              <div className="quill-balanced">
                <div className="flex items-center justify-between px-1 mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Body</p>
                  {showAiDraft ? (
                    <button onClick={() => setShowAiDraft(false)} className="text-xs font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors">Close AI</button>
                  ) : (
                    <button onClick={() => setShowAiDraft(true)} className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                      <Sparkles className="w-3.5 h-3.5" /> AI Draft
                    </button>
                  )}
                </div>

                {showAiDraft && (
                  <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl mb-4 animate-in slide-in-from-top-2 duration-300">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Tell AI what to include: 'Invite users to the new quiz', 'Monthly newsletter about stocks'..."
                      className="w-full h-24 bg-transparent border-none outline-none text-sm font-medium resize-none placeholder:text-indigo-200"
                    />
                    <button onClick={handleGenerateAiDraft} disabled={isGeneratingAiDraft} className="w-full mt-3 py-2.5 bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                      {isGeneratingAiDraft ? <span className="animate-pulse">Writing Draft...</span> : <><Sparkles className="w-3.5 h-3.5" /> Apply AI Structure</>}
                    </button>
                  </div>
                )}

                <div className="border border-gray-100 rounded-2xl overflow-hidden focus-within:border-indigo-100 transition-all">
                  <ReactQuill
                    theme="snow"
                    value={emailBody}
                    onChange={setEmailBody}
                    modules={modules}
                    placeholder="Craft your narrative here..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Smart Hero Upload */}
                <div className="p-5 border border-gray-50 bg-gray-50/10 rounded-2xl space-y-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hero Banner</p>
                  <div
                    onClick={() => heroInputRef.current?.click()}
                    className={`relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden gap-2 ${heroPreview ? 'border-indigo-200 shadow-inner' : 'border-gray-100 hover:border-indigo-100 hover:bg-white'}`}
                  >
                    <input type="file" accept="image/*" className="hidden" ref={heroInputRef} onChange={handleHeroChange} />
                    {heroPreview ? (
                      <>
                        <img src={heroPreview} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                          <Plus className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-200" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Visual</p>
                      </>
                    )}
                  </div>
                  {heroImageFile && <p className="text-[10px] font-bold text-indigo-400 text-center uppercase tracking-tighter">Ready for Smart Cloudinary Upload</p>}

                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">CTA Text</p>
                      <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Read More" className="w-full px-4 py-2 bg-white rounded-xl text-xs font-bold text-gray-700 outline-none border border-gray-100 focus:border-indigo-100" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">CTA Link</p>
                      <input type="url" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 bg-white rounded-xl text-xs font-bold text-gray-700 outline-none border border-gray-100 focus:border-indigo-100" />
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="p-5 border border-gray-50 bg-gray-50/10 rounded-2xl flex flex-col">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Attachments</p>
                  <div
                    onClick={() => attachmentInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-indigo-100 transition-all gap-2"
                  >
                    <input type="file" multiple className="hidden" ref={attachmentInputRef} onChange={(e) => {
                      if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                    }} />
                    <Paperclip className="w-6 h-6 text-gray-200" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add Documents</p>
                  </div>
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 max-h-20 overflow-y-auto pt-1">
                      {attachments.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm group">
                          <span className="truncate max-w-[100px]">{file.name}</span>
                          <X onClick={(e) => { e.stopPropagation(); setAttachments(prev => prev.filter((_, idx) => idx !== i)); }} className="w-3 h-3 cursor-pointer text-gray-300 hover:text-rose-500 transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 flex items-center justify-between gap-4 bg-gray-50/20">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{selectedRecipients.length} Campaigns Ready</p>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => setShowPreview(true)} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-500 hover:border-indigo-100 transition-all shadow-sm group">
                  <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={() => setShowSchedule(!showSchedule)} className={`px-6 py-3 rounded-xl text-xs font-bold transition-all border shadow-sm ${showSchedule ? 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                  Schedule
                </button>
                <button
                  disabled={isSending || selectedRecipients.length === 0 || !emailSubject.trim()}
                  onClick={handleSendEmail}
                  className="px-10 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-gray-200"
                >
                  {isSending ? "Launching..." : "Broadcast"}
                </button>
              </div>
            </div>

            {showSchedule && (
              <div className="p-6 bg-amber-50/30 border-t border-amber-50 animate-in slide-in-from-bottom duration-300 flex items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5 ml-1">Launch Date & Time</p>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    min={toLocalInputValue(new Date())}
                    className="w-full px-5 py-2.5 bg-white border border-amber-100 rounded-xl text-sm font-bold text-gray-700 focus:border-amber-400 outline-none shadow-sm"
                  />
                </div>
                <div className="pt-5">
                  <button onClick={handleScheduleEmail} disabled={isSending || !scheduledFor} className="px-10 py-3 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all disabled:opacity-50">
                    Confirm Queue
                  </button>
                </div>
              </div>
            )}
          </div>

          <ScheduledEmails onStatusChange={onStatusChange} refreshKey={scheduledEmailsRefreshKey} />
        </div>
      </div>

      <EmailPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        subject={emailSubject}
        body={emailBody}
        heroImage={heroPreview} // Use local preview for preview modal
        ctaText={ctaText}
        ctaUrl={ctaUrl}
      />

      <style jsx global>{`
        .quill-balanced .ql-toolbar.ql-snow {
          border: none;
          background: #fdfdfd;
          border-bottom: 1px solid #f9fafb;
          padding: 12px 16px;
          border-radius: 16px 16px 0 0;
        }
        .quill-balanced .ql-container.ql-snow {
          border: none;
          min-height: 250px;
          background: #fdfdfd;
          font-family: inherit;
          font-size: 15px;
          border-radius: 0 0 16px 16px;
          color: #374151;
        }
        .quill-balanced .ql-editor { padding: 24px; }
        .quill-balanced .ql-editor.ql-blank::before {
          font-size: 14px;
          color: #e5e7eb;
          font-style: normal;
          left: 24px;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}