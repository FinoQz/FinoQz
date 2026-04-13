'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Eye, Check, Loader2, Globe, Shield, UserPlus, X, Plus } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import { QuizData } from './CreateQuizForm';

interface ScheduleVisibilityProps {
  quizData: QuizData;
  updateQuizData: (newData: Partial<QuizData>) => void;
}

type GroupOption = {
  _id: string;
  name: string;
};

type GroupApiItem = {
  _id?: string | number;
  name?: string;
};

const isGroupApiItem = (value: unknown): value is GroupApiItem =>
  typeof value === 'object' && value !== null;

export default function ScheduleVisibility({
  quizData,
  updateQuizData
}: ScheduleVisibilityProps) {
  const [availableGroups, setAvailableGroups] = useState<GroupOption[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadGroups = async () => {
      setGroupsLoading(true);
      try {
        const res = await apiAdmin.get('/api/admin/panel/groups');
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : res.data?.groups || [];
        if (mounted) {
          setAvailableGroups(
            list
              .map((g: unknown) => {
                if (!isGroupApiItem(g)) {
                  return { _id: '', name: '' };
                }
                return {
                  _id: String(g._id || ''),
                  name: String(g.name || '')
                };
              })
              .filter((g: GroupOption) => g._id && g.name)
          );
        }
      } catch (err) {
        console.error('Failed to load groups', err);
      } finally {
        if (mounted) setGroupsLoading(false);
      }
    };
    loadGroups();
    return () => { mounted = false; };
  }, []);

  const handleGroupToggle = (groupId: string) => {
    const current = quizData.assignedGroups || [];
    const next = current.includes(groupId)
      ? current.filter(id => id !== groupId)
      : [...current, groupId];
    updateQuizData({ assignedGroups: next });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Quiz Schedule */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
        <label className="block text-sm font-semibold text-gray-900 mb-6">Quiz Schedule</label>
        <div className="flex p-0.5 bg-gray-50 rounded-md border border-gray-100 inline-flex">
          <button
            onClick={() => updateQuizData({ postType: 'live' })}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-[11px] font-semibold transition-all ${
              quizData.postType === 'live' ? 'bg-white text-[#253A7B] shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Eye className="w-4 h-4" />
            Go Live Now
          </button>
          <button
            onClick={() => updateQuizData({ postType: 'scheduled' })}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-[11px] font-semibold transition-all ${
              quizData.postType === 'scheduled' ? 'bg-white text-[#253A7B] shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Schedule for Later
          </button>
        </div>

        {/* Unified Activity Period */}
        <div className="mt-8 space-y-8 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Starts At - Only shown for Scheduled, for Live it's 'Now' */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 ml-0.5">Quiz Starts At</label>
                {quizData.postType === 'live' && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Starting Now</span>
                )}
              </div>
              <div className={`flex gap-3 ${quizData.postType === 'live' ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex-1 relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="date"
                    value={quizData.postType === 'live' ? new Date().toISOString().split('T')[0] : quizData.startDate}
                    onChange={(e) => updateQuizData({ startDate: e.target.value, postingDate: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-4 py-2.5 text-sm font-medium focus:border-[#253A7B] outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="flex-1 relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="time"
                    value={quizData.postType === 'live' ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : quizData.startTime}
                    onChange={(e) => updateQuizData({ startTime: e.target.value, postingTime: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-4 py-2.5 text-sm font-medium focus:border-[#253A7B] outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Ends At */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 ml-0.5">Quiz Expires At</label>
                <button
                  type="button"
                  onClick={() => {
                    const hasEnd = !!(quizData.endDate && quizData.endTime);
                    if (hasEnd) {
                      updateQuizData({ endDate: '', endTime: '' });
                    } else {
                      // Default to 7 days from now if enabling
                      const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                      updateQuizData({ 
                        endDate: future.toISOString().split('T')[0], 
                        endTime: future.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) 
                      });
                    }
                  }}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-all ${
                    (quizData.endDate && quizData.endTime)
                      ? 'bg-[#253A7B] text-white'
                      : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {(quizData.endDate && quizData.endTime) ? 'Expires' : 'No Expiry (Until I Delete)'}
                </button>
              </div>

              {(quizData.endDate && quizData.endTime) ? (
                <div className="flex gap-3 animate-in slide-in-from-top-1">
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      type="date"
                      value={quizData.endDate}
                      onChange={(e) => updateQuizData({ endDate: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-4 py-2.5 text-sm font-medium focus:border-[#253A7B] outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      type="time"
                      value={quizData.endTime}
                      onChange={(e) => updateQuizData({ endTime: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-4 py-2.5 text-sm font-medium focus:border-[#253A7B] outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => {
                    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                    updateQuizData({ 
                      endDate: future.toISOString().split('T')[0], 
                      endTime: future.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) 
                    });
                  }}
                  className="h-[42px] border border-dashed border-gray-200 rounded-md flex items-center justify-center text-[10px] text-gray-400 font-medium cursor-pointer hover:bg-gray-50 transition-all"
                >
                  Click to set an expiration date if needed
                </div>
              )}
            </div>
          </div>

          {/* Advanced Posting Time Toggle (Only for Scheduled) */}
          {quizData.postType === 'scheduled' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const isCustom = quizData.postingDate !== quizData.startDate || quizData.postingTime !== quizData.startTime;
                  if (isCustom) {
                    // Reset to match start time
                    updateQuizData({ postingDate: quizData.startDate, postingTime: quizData.startTime });
                  } else {
                    // Just expand (it will already be matching)
                    // We need a local state but since we can't easily add one to this functional component without props, 
                    // we'll rely on checking if they differ. 
                    // Actually, let's just use a local state.
                  }
                }}
                className="text-[10px] font-bold text-[#253A7B] uppercase tracking-widest hover:underline flex items-center gap-1.5"
              >
                <Plus className={`w-3 h-3 transition-transform ${(quizData.postingDate !== quizData.startDate || quizData.postingTime !== quizData.startTime) ? 'rotate-45' : ''}`} />
                {(quizData.postingDate !== quizData.startDate || quizData.postingTime !== quizData.startTime) ? 'Remove Custom Posting Time' : 'Set Different Posting Time (Optional)'}
              </button>

              {(quizData.postingDate !== quizData.startDate || quizData.postingTime !== quizData.startTime) && (
                <div className="mt-4 p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <label className="text-xs font-bold text-amber-900 uppercase tracking-wider">Custom Posting Time</label>
                  </div>
                  <p className="text-[10px] text-amber-600 font-medium -mt-2 mb-2">The quiz will be visible in the system at this time, even if it has not started yet.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Posting Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="date"
                          value={quizData.postingDate}
                          onChange={(e) => updateQuizData({ postingDate: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-4 py-2 text-sm font-normal focus:border-[#253A7B] outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Posting Time</label>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="time"
                          value={quizData.postingTime}
                          onChange={(e) => updateQuizData({ postingTime: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-4 py-2 text-sm font-normal focus:border-[#253A7B] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Broadcast Toggle */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="flex items-center justify-between p-4 bg-[#253A7B]/5 rounded-xl border border-[#253A7B]/10 group hover:bg-[#253A7B]/10 transition-all cursor-pointer" onClick={() => updateQuizData({ broadcastEmail: !quizData.broadcastEmail })}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${quizData.broadcastEmail ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                <Plus className={`w-6 h-6 transition-transform ${quizData.broadcastEmail ? 'rotate-45' : ''}`} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-gray-900 mb-0.5">Broadcast Email Notification</h4>
                <p className="text-[10px] text-gray-500 font-medium">Send an automated announcement to eligible recipients when live.</p>
              </div>
            </div>
            
            <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${quizData.broadcastEmail ? 'bg-[#253A7B]' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${quizData.broadcastEmail ? 'left-7' : 'left-1'}`} />
            </div>
          </div>
          
          {(quizData.visibility === 'private' || quizData.visibility === 'individual') && (quizData.postType === 'scheduled' || new Date(`${quizData.startDate}T${quizData.startTime}:00`) > new Date()) && (
            <div className="mt-4 flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100 group hover:bg-blue-50 transition-all cursor-pointer animate-in slide-in-from-top-2" onClick={() => updateQuizData({ sendEarlyAlertEmail: !quizData.sendEarlyAlertEmail })}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${quizData.sendEarlyAlertEmail ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-400'}`}>
                   <Check className={`w-5 h-5 transition-transform ${quizData.sendEarlyAlertEmail ? 'rotate-0' : 'hidden'}`} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-blue-900 mb-0.5">Notify Assigned Early</h4>
                  <p className="text-[10px] text-blue-600/80 font-medium">Push an immediate alert email to assigned users warning them of this upcoming schedule.</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${quizData.sendEarlyAlertEmail ? 'bg-[#253A7B]' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${quizData.sendEarlyAlertEmail ? 'left-7' : 'left-1'}`} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visibility Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
        <label className="block text-sm font-semibold text-gray-900 mb-6">Visibility & Access Control</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => updateQuizData({ visibility: 'public' })}
            className={`group relative text-left p-6 rounded-lg border transition-all duration-300 ${
              quizData.visibility === 'public'
                ? 'border-[#253A7B] bg-blue-50/30 ring-1 ring-[#253A7B]/10'
                : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
            }`}
          >
            <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 transition-all ${
              quizData.visibility === 'public' ? 'bg-[#253A7B] text-white' : 'bg-white border border-gray-200 text-gray-400'
            }`}>
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-[13px] font-bold text-gray-900 mb-1">Public Access</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">Visible to all institution members.</p>
            {quizData.visibility === 'public' && <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#253A7B] flex items-center justify-center text-white"><Check className="w-2.5 h-2.5" /></div>}
          </button>

          <button
            onClick={() => updateQuizData({ visibility: 'private' })}
            className={`group relative text-left p-6 rounded-lg border transition-all duration-300 ${
              quizData.visibility === 'private'
                ? 'border-[#253A7B] bg-blue-50/30 ring-1 ring-[#253A7B]/10'
                : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
            }`}
          >
            <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 transition-all ${
              quizData.visibility === 'private' ? 'bg-[#253A7B] text-white' : 'bg-white border border-gray-200 text-gray-400'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-[13px] font-bold text-gray-900 mb-1">Cohort Restricted</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">Limited to selected student groups.</p>
            {quizData.visibility === 'private' && <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#253A7B] flex items-center justify-center text-white"><Check className="w-2.5 h-2.5" /></div>}
          </button>

          <button
            onClick={() => updateQuizData({ visibility: 'individual' })}
            className={`group relative text-left p-6 rounded-lg border transition-all duration-300 ${
              quizData.visibility === 'individual'
                ? 'border-[#253A7B] bg-blue-50/30 ring-1 ring-[#253A7B]/10'
                : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
            }`}
          >
            <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 transition-all ${
              quizData.visibility === 'individual' ? 'bg-[#253A7B] text-white' : 'bg-white border border-gray-200 text-gray-400'
            }`}>
              <UserPlus className="w-5 h-5" />
            </div>
            <h4 className="text-[13px] font-bold text-gray-900 mb-1">Direct Assignment</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">Specific individuals only.</p>
            {quizData.visibility === 'individual' && <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#253A7B] flex items-center justify-center text-white"><Check className="w-2.5 h-2.5" /></div>}
          </button>
        </div>

        {/* Cohort Selection */}
        {quizData.visibility === 'private' && (
          <div className="mt-8 pt-8 border-t border-gray-100 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-6">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Select Target Cohorts</label>
              {groupsLoading && <Loader2 className="w-4 h-4 animate-spin text-[#253A7B]" />}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {availableGroups.map((group) => {
                const isActive = quizData.assignedGroups?.includes(group._id);
                return (
                  <button
                    key={group._id}
                    onClick={() => handleGroupToggle(group._id)}
                    className={`flex items-center gap-3 p-3 rounded-md border transition-all ${
                      isActive
                        ? 'border-[#253A7B] bg-blue-50/30 text-[#253A7B]'
                        : 'border-gray-200 bg-gray-50/50 text-gray-400 hover:bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isActive ? 'bg-[#253A7B] border-[#253A7B] text-white' : 'bg-white border-gray-300'
                    }`}>
                      {isActive && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className="text-[11px] font-semibold truncate">{group.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Individual Assignment */}
        {(quizData.visibility === 'individual' || quizData.visibility === 'private') && (
          <div className="mt-8 pt-8 border-t border-gray-100 animate-in slide-in-from-top-2">
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Assign to Individuals</label>
              {quizData.visibility === 'private' && (
                <p className="text-[10px] text-gray-500 font-medium mt-1">Add specific individuals as exceptions who gain access alongside the selected cohorts.</p>
              )}
            </div>
            
            <div className="max-w-xl space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Enter email or User ID..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && !quizData.assignedIndividuals.includes(val)) {
                          updateQuizData({ assignedIndividuals: [...quizData.assignedIndividuals, val] });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-10 pr-4 py-2.5 text-sm font-semibold text-gray-900 focus:bg-white focus:border-[#253A7B] outline-none transition-all shadow-inner"
                  />
                </div>
                <button 
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter email or User ID..."]') as HTMLInputElement;
                    const val = input.value.trim();
                    if (val && !quizData.assignedIndividuals.includes(val)) {
                      updateQuizData({ assignedIndividuals: [...quizData.assignedIndividuals, val] });
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2.5 bg-[#253A7B] text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-[#1a2a5e] transition-all"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {quizData.assignedIndividuals.map((id) => (
                  <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-md text-[#253A7B]">
                    <span className="text-[11px] font-bold">{id}</span>
                    <button 
                      onClick={() => updateQuizData({ assignedIndividuals: quizData.assignedIndividuals.filter(i => i !== id) })}
                      className="p-0.5 hover:bg-blue-100 rounded transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {quizData.assignedIndividuals.length === 0 && (
                  <p className="text-[11px] text-gray-400 italic">No individuals assigned yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
