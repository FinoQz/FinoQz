'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Save, Loader2, Search, Shuffle, Calendar, Clock } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
interface Quiz {
  _id: string;
  quizTitle: string;
  description: string;
  duration: number;
  totalMarks: number;
  price: number;
  pricingType: 'free' | 'paid';
  attemptLimit: string;
  difficultyLevel: string;
  category: string;
  shuffleQuestions?: boolean;
  visibility: string;
  status: 'published' | 'draft' | 'scheduled';
  scheduledAt?: string;
  startAt?: string;
  endAt?: string;
  assignedGroups?: string[];
  assignedIndividuals?: string[];
  broadcastEmail?: boolean;
  sendEarlyAlertEmail?: boolean;
}

interface EditQuizModalProps {
  quiz: Quiz;
  onClose: () => void;
  onSuccess: () => void;
}

interface CategoryOption {
  _id: string;
  name: string;
}

interface GroupOption {
  _id: string;
  name: string;
}

interface UserOption {
  _id: string;
  fullName: string;
  email: string;
}

export default function EditQuizModal({ quiz, onClose, onSuccess }: EditQuizModalProps) {
  const normalizeDifficulty = (level?: string) => {
    if (level === 'hard' || level === 'high') return 'hard';
    if (level === 'easy' || level === 'low') return 'easy';
    return 'medium';
  };

  const normalizeVisibility = (value?: string) => {
    if (value === 'private' || value === 'individual' || value === 'public') return value;
    return 'public';
  };

  const [formData, setFormData] = useState({
    quizTitle: quiz.quizTitle || '',
    description: quiz.description || '',
    duration: quiz.duration || 30,
    totalMarks: quiz.totalMarks || 100,
    price: quiz.price || 0,
    pricingType: quiz.pricingType || 'free',
    attemptLimit: quiz.attemptLimit === '1' ? '1' : 'unlimited',
    difficultyLevel: normalizeDifficulty(quiz.difficultyLevel),
    category: quiz.category || '',
    shuffleQuestions: Boolean(quiz.shuffleQuestions),
    visibility: normalizeVisibility(quiz.visibility),
    assignedGroups: Array.isArray(quiz.assignedGroups) ? quiz.assignedGroups : [],
    assignedIndividuals: Array.isArray(quiz.assignedIndividuals) ? quiz.assignedIndividuals : [],
    status: quiz.status || 'draft',
    broadcastEmail: Boolean(quiz.broadcastEmail),
    scheduledAt: quiz.scheduledAt || '',
    startAt: quiz.startAt || '',
    endAt: quiz.endAt || '',
    startDate: quiz.startAt ? new Date(quiz.startAt).toISOString().split('T')[0] : '',
    startTime: quiz.startAt ? new Date(quiz.startAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
    endDate: quiz.endAt ? new Date(quiz.endAt).toISOString().split('T')[0] : '',
    endTime: quiz.endAt ? new Date(quiz.endAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
    postingDate: quiz.scheduledAt ? new Date(quiz.scheduledAt).toISOString().split('T')[0] : '',
    postingTime: quiz.scheduledAt ? new Date(quiz.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
    sendEarlyAlertEmail: Boolean(quiz.sendEarlyAlertEmail),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [individualInput, setIndividualInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['duration', 'totalMarks', 'price'].includes(name) ? Number(value) : value
    }));
  };

  useEffect(() => {
    if (formData.visibility === 'public' && formData.status === 'scheduled') {
      setFormData(prev => ({ ...prev, status: 'published' })); // or draft, published is better since they usually want to publish it live
    }
  }, [formData.visibility, formData.status]);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        const [categoriesRes, groupsRes, usersRes] = await Promise.all([
          apiAdmin.get('/api/categories').catch(() => ({ data: [] })),
          apiAdmin.get('/api/admin/panel/groups').catch(() => ({ data: [] })),
          apiAdmin.get('/api/admin/panel/all-users').catch(() => ({ data: [] })),
        ]);

        const rawCategories: unknown[] = Array.isArray(categoriesRes.data?.data)
          ? categoriesRes.data.data
          : Array.isArray(categoriesRes.data)
            ? categoriesRes.data
            : [];

        const parsedCategories = rawCategories
          .map((item): CategoryOption | null => {
            if (!item || typeof item !== 'object') return null;
            const cat = item as { _id?: unknown; name?: unknown };
            if (typeof cat._id !== 'string' || typeof cat.name !== 'string') return null;
            return { _id: cat._id, name: cat.name };
          })
          .filter((item): item is CategoryOption => item !== null);

        const rawGroups: unknown[] = Array.isArray(groupsRes.data?.data)
          ? groupsRes.data.data
          : Array.isArray(groupsRes.data)
            ? groupsRes.data
            : Array.isArray(groupsRes.data?.groups)
              ? groupsRes.data.groups
              : [];

        const parsedGroups = rawGroups
          .map((item): GroupOption | null => {
            if (!item || typeof item !== 'object') return null;
            const group = item as { _id?: unknown; name?: unknown };
            if (typeof group._id !== 'string' || typeof group.name !== 'string') return null;
            return { _id: group._id, name: group.name };
          })
          .filter((item): item is GroupOption => item !== null);

        const rawUsers: unknown[] = Array.isArray(usersRes.data)
          ? usersRes.data
          : Array.isArray(usersRes.data?.approved)
            ? usersRes.data.approved
            : [];

        const parsedUsers = rawUsers
          .map((item): UserOption | null => {
            if (!item || typeof item !== 'object') return null;
            const user = item as { _id?: unknown; fullName?: unknown; email?: unknown };
            if (typeof user._id !== 'string' || typeof user.email !== 'string') return null;
            return {
              _id: user._id,
              fullName: typeof user.fullName === 'string' ? user.fullName : user.email,
              email: user.email,
            };
          })
          .filter((item): item is UserOption => item !== null);

        if (mounted) {
          setCategories(parsedCategories);
          setGroups(parsedGroups);
          setUsers(parsedUsers);
        }
      } catch {
        if (mounted) {
          setCategories([]);
          setGroups([]);
          setUsers([]);
        }
      }
    };

    loadOptions();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedIndividuals = useMemo(
    () => Array.from(new Set(formData.assignedIndividuals.map((item) => item.trim()).filter(Boolean))),
    [formData.assignedIndividuals]
  );

  const toggleGroup = (groupId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedGroups.includes(groupId);
      return {
        ...prev,
        assignedGroups: exists
          ? prev.assignedGroups.filter((id) => id !== groupId)
          : [...prev.assignedGroups, groupId],
      };
    });
  };

  const addIndividual = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      if (prev.assignedIndividuals.includes(trimmed)) return prev;
      return { ...prev, assignedIndividuals: [...prev.assignedIndividuals, trimmed] };
    });
  };

  const removeIndividual = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedIndividuals: prev.assignedIndividuals.filter((item) => item !== value),
    }));
  };

  const toggleIndividual = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const exists = prev.assignedIndividuals.includes(trimmed);
      return {
        ...prev,
        assignedIndividuals: exists
          ? prev.assignedIndividuals.filter((item) => item !== trimmed)
          : [...prev.assignedIndividuals, trimmed],
      };
    });
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) =>
      user.fullName.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
    );
  }, [userSearch, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const toISO = (d: string, t: string) => {
        if (!d || !t) return null;
        try {
          const localDate = new Date(`${d}T${t}:00`);
          return isNaN(localDate.getTime()) ? null : localDate.toISOString();
        } catch {
          return null;
        }
      };

      const payload = {
        ...formData,
        startAt: toISO(formData.startDate, formData.startTime),
        endAt: toISO(formData.endDate, formData.endTime),
        scheduledAt: toISO(formData.postingDate, formData.postingTime) || toISO(formData.startDate, formData.startTime),
        difficultyLevel: normalizeDifficulty(formData.difficultyLevel),
        attemptLimit: formData.attemptLimit === '1' ? '1' : 'unlimited',
        price: formData.pricingType === 'paid' ? Number(formData.price || 0) : 0,
        shuffleQuestions: Boolean(formData.shuffleQuestions),
        assignedGroups: formData.visibility === 'private' ? formData.assignedGroups : [],
        assignedIndividuals: (formData.visibility === 'individual' || formData.visibility === 'private') ? selectedIndividuals : [],
        broadcastEmail: formData.broadcastEmail,
        sendEarlyAlertEmail: formData.sendEarlyAlertEmail,
      };

      await apiAdmin.put(`/api/quizzes/admin/quizzes/${quiz._id}`, payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
          ? String((err as { response?: { data?: { message?: unknown } } }).response?.data?.message)
          : 'Failed to update quiz. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-white to-slate-50 rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm">
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">Edit Quiz</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Refine settings for: {quiz.quizTitle || 'Untitled Quiz'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="edit-quiz-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-7 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            
            {/* General Information */}
            <div className="space-y-4 sm:space-y-5 bg-white border border-slate-200/80 rounded-xl p-3 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-[#253A7B] rounded-full" />
                <h3 className="text-xs font-semibold tracking-wide text-slate-900 uppercase">General Information</h3>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500">Quiz Title</label>
                <input
                  type="text"
                  name="quizTitle"
                  value={formData.quizTitle}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-medium focus:border-[#253A7B] focus:ring-1 focus:ring-[#253A7B]/10 transition-all outline-none"
                  placeholder="Enter quiz title"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-medium focus:border-[#253A7B] focus:ring-1 focus:ring-[#253A7B]/10 transition-all outline-none resize-none"
                  placeholder="Provide a brief overview..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-500">Difficulty Level</label>
                  <select
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold focus:border-[#253A7B] outline-none appearance-none"
                  >
                    <option value="easy">Low</option>
                    <option value="medium">Medium</option>
                    <option value="hard">High</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-500">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold focus:border-[#253A7B] outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                    {formData.category && !categories.some((item) => item._id === formData.category) && (
                      <option value={formData.category}>{formData.category}</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Performance & Access */}
            <div className="space-y-4 sm:space-y-5 bg-white border border-slate-200/80 rounded-xl p-3 sm:p-5 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-1 h-4 bg-green-500 rounded-full" />
                 <h3 className="text-xs font-semibold tracking-wide text-slate-900 uppercase">Performance & Access</h3>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                 <div className="space-y-1.5">
                   <label className="text-[11px] font-medium text-slate-500">Duration (Mins)</label>
                   <input
                     type="number"
                     name="duration"
                     value={formData.duration}
                     onChange={handleInputChange}
                     className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold focus:border-[#253A7B] outline-none transition-all"
                   />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-500">Attempt Limit</label>
                    <div className="flex p-1 bg-slate-50 rounded-md border border-slate-100 gap-1">
                      {['unlimited', '1'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, attemptLimit: opt }))}
                          className={`flex-1 py-1.5 rounded text-[11px] font-semibold transition-all ${formData.attemptLimit === opt ? 'bg-white text-[#253A7B] shadow-sm border border-slate-200' : 'text-slate-400 hover:bg-slate-100'}`}
                        >
                          {opt === 'unlimited' ? 'Unlimited' : '1 Time'}
                        </button>
                      ))}
                    </div>
                 </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-[11px] font-medium text-slate-500">Question Order</label>
                 <button
                   type="button"
                   onClick={() => setFormData((prev) => ({ ...prev, shuffleQuestions: !prev.shuffleQuestions }))}
                   className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-xs font-semibold transition-all ${formData.shuffleQuestions ? 'border-[#253A7B] bg-blue-50 text-[#253A7B]' : 'border-slate-200 bg-white text-slate-500'}`}
                 >
                   <span className="inline-flex items-center gap-2">
                     <Shuffle className="w-3.5 h-3.5" />
                     Shuffle Questions for Each Attempt
                   </span>
                   <span>{formData.shuffleQuestions ? 'On' : 'Off'}</span>
                 </button>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-500">Pricing</label>
                    <select
                      name="pricingType"
                      value={formData.pricingType}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold focus:border-[#253A7B] outline-none"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  {formData.pricingType === 'paid' && (
                     <div className="space-y-1.5 animate-in slide-in-from-left-2 transition-all">
                       <label className="text-[11px] font-medium text-slate-500">Price (INR)</label>
                       <input
                         type="number"
                         name="price"
                         value={formData.price}
                         onChange={handleInputChange}
                         className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold focus:border-[#253A7B] outline-none"
                       />
                     </div>
                  )}
               </div>

               <div className="space-y-1.5">
                 <label className="text-[11px] font-medium text-slate-500">Visibility</label>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {['public', 'private', 'individual'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, visibility: v }))}
                        className={`py-2 rounded border text-[11px] font-semibold transition-all ${formData.visibility === v ? 'border-[#253A7B] bg-blue-50 text-[#253A7B]' : 'border-slate-200 bg-white text-slate-400'}`}
                      >
                        {v === 'individual' ? 'Direct Assign' : v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                 </div>
               </div>

                <div className="pt-2 border-t border-slate-100">
                  <div 
                    className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 cursor-pointer hover:bg-blue-50 transition-all"
                    onClick={() => setFormData(p => ({ ...p, broadcastEmail: !p.broadcastEmail }))}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${formData.broadcastEmail ? 'bg-[#253A7B] text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Shuffle className={`w-4 h-4 transition-transform ${formData.broadcastEmail ? 'rotate-45' : ''}`} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-900">Broadcast Email</p>
                        <p className="text-[9px] text-slate-500">Notify users when published/scheduled</p>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${formData.broadcastEmail ? 'bg-[#253A7B]' : 'bg-slate-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${formData.broadcastEmail ? 'left-5.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                </div>

               {formData.visibility === 'private' && (
                 <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                   <label className="text-[11px] font-medium text-slate-500">Select Groups</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto border border-slate-100 rounded-md p-2 bg-slate-50/40">
                     {groups.length === 0 && (
                       <p className="col-span-2 text-xs text-slate-400">No groups found.</p>
                     )}
                     {groups.map((group) => {
                       const selected = formData.assignedGroups.includes(group._id);
                       return (
                         <button
                           key={group._id}
                           type="button"
                           onClick={() => toggleGroup(group._id)}
                           className={`px-2.5 py-2 rounded text-[11px] text-left font-semibold border transition-all ${selected ? 'border-[#253A7B] bg-blue-50 text-[#253A7B]' : 'border-slate-200 bg-white text-slate-600'}`}
                         >
                           {group.name}
                         </button>
                       );
                     })}
                   </div>
                 </div>
               )}

                {(formData.visibility === 'individual' || formData.visibility === 'private') && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[11px] font-medium text-slate-500">
                      Direct Assign (Email or User)
                      {formData.visibility === 'private' && (
                        <span className="block text-[9px] text-slate-400 mt-0.5">Add specific individuals as exceptions explicitly.</span>
                      )}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-2 w-full items-stretch">
                      <input
                        type="text"
                        value={individualInput}
                        onChange={(e) => setIndividualInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addIndividual(individualInput);
                            setIndividualInput('');
                          }
                        }}
                        placeholder="Enter email"
                        className="w-full min-w-0 max-w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold focus:border-[#253A7B] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addIndividual(individualInput);
                          setIndividualInput('');
                        }}
                        className="w-full sm:w-auto min-w-[84px] sm:min-w-[90px] px-3 py-2 bg-[#253A7B] text-white rounded-md text-[11px] font-semibold whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search users by name or email"
                          className="w-full bg-transparent text-xs font-medium text-slate-700 placeholder:text-slate-400 outline-none"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto p-2 space-y-1">
                        {filteredUsers.length === 0 && (
                          <p className="text-xs text-slate-400 px-1 py-2">No users matched.</p>
                        )}
                        {filteredUsers.map((user) => {
                          const checked = selectedIndividuals.includes(user.email);
                          return (
                            <button
                              key={user._id}
                              type="button"
                              onClick={() => toggleIndividual(user.email)}
                             className={`w-full min-w-0 flex items-center gap-2 px-2 py-2 rounded-md border text-left transition-all ${checked ? 'border-[#253A7B] bg-blue-50 text-[#253A7B]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                readOnly
                                className="w-3.5 h-3.5 accent-[#253A7B]"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold truncate">{user.fullName}</p>
                                <p className="text-[10px] opacity-80 truncate">{user.email}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedIndividuals.length === 0 && (
                        <p className="text-xs text-slate-400">No users assigned yet.</p>
                      )}
                      {selectedIndividuals.map((item) => (
                        <span key={item} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-blue-200 bg-blue-50 text-[11px] font-semibold text-[#253A7B] max-w-full break-all">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeIndividual(item)}
                            className="text-[#253A7B] hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

               {/* Timeline & Schedule Section */}
               {formData.visibility !== 'public' && (
                 <div className="space-y-4 sm:space-y-5 bg-slate-50/50 border border-slate-200/60 rounded-xl p-3 sm:p-5 shadow-sm mt-4 col-span-1 md:col-span-2">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-1 h-4 bg-amber-500 rounded-full" />
                     <h3 className="text-xs font-semibold tracking-wide text-slate-900 uppercase">Timeline & Schedule</h3>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {/* Starts At container */}
                     <div className="flex flex-col bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Available From</label>
                       <div className="grid grid-cols-2 gap-2">
                         <input 
                           type="date" 
                           name="startDate" 
                           value={formData.startDate} 
                           onChange={handleInputChange} 
                           className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[10px] font-medium focus:border-[#253A7B] outline-none transition-all" 
                         />
                         <input 
                           type="time" 
                           name="startTime" 
                           value={formData.startTime} 
                           onChange={handleInputChange} 
                           className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[10px] font-medium focus:border-[#253A7B] outline-none transition-all" 
                         />
                       </div>
                     </div>

                     {/* Ends At container */}
                     <div className="flex flex-col bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
                       <div className="flex items-center justify-between mb-2">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Until</label>
                         {(formData.endDate && formData.endTime) && (
                           <button
                             type="button"
                             onClick={() => setFormData(p => ({ ...p, endDate: '', endTime: '' }))}
                             className="text-[9px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wide bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded transition-all"
                           >
                             Remove
                           </button>
                         )}
                       </div>
                       
                       {(formData.endDate && formData.endTime) ? (
                         <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 h-full">
                           <input 
                             type="date" 
                             name="endDate" 
                             value={formData.endDate} 
                             onChange={handleInputChange} 
                             className="w-full bg-red-50/50 border border-red-200 rounded px-2 py-1.5 text-[10px] font-medium focus:border-red-500 outline-none transition-all" 
                           />
                           <input 
                             type="time" 
                             name="endTime" 
                             value={formData.endTime} 
                             onChange={handleInputChange} 
                             className="w-full bg-red-50/50 border border-red-200 rounded px-2 py-1.5 text-[10px] font-medium focus:border-red-500 outline-none transition-all" 
                           />
                         </div>
                       ) : (
                          <button 
                            type="button"
                            onClick={() => {
                              const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                              setFormData(p => ({ 
                                ...p, 
                                endDate: future.toISOString().split('T')[0], 
                                endTime: future.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) 
                              }));
                            }}
                            className="w-full h-full min-h-[28px] bg-slate-50 border border-dashed border-slate-300 hover:border-[#253A7B] rounded px-3 py-1.5 text-[10px] font-semibold text-slate-400 hover:text-[#253A7B] hover:bg-[#253A7B]/5 transition-all outline-none"
                          >
                            + Set Expiry Date
                          </button>
                       )}
                     </div>
                   </div>

                   {(formData.status === 'scheduled' || formData.postingDate) && (
                     <div className="mt-3 pt-3 border-t border-slate-200/60 animate-in slide-in-from-top-2">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-amber-200 bg-amber-50/50 p-2 rounded-md shadow-sm">
                         <div className="flex items-center gap-1.5 shrink-0">
                           <Clock className="w-3.5 h-3.5 text-amber-600" />
                           <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Schedule</span>
                         </div>
                         <div className="flex items-center gap-1.5 w-full sm:w-auto">
                           <input 
                             type="date" 
                             name="postingDate" 
                             value={formData.postingDate || formData.startDate} 
                             onChange={handleInputChange} 
                             className="flex-1 sm:flex-none min-w-0 sm:w-[105px] bg-white border border-amber-200 rounded px-1.5 py-1 text-[10px] font-medium focus:border-amber-500 outline-none transition-all shadow-sm" 
                           />
                           <input 
                             type="time" 
                             name="postingTime" 
                             value={formData.postingTime || formData.startTime} 
                             onChange={handleInputChange} 
                             className="flex-1 sm:flex-none min-w-0 sm:w-[75px] bg-white border border-amber-200 rounded px-1.5 py-1 text-[10px] font-medium focus:border-amber-500 outline-none transition-all shadow-sm" 
                           />
                           {(formData.postingDate || formData.postingTime) && (
                             <button
                               type="button"
                               onClick={() => setFormData(p => ({ ...p, postingDate: '', postingTime: '' }))}
                               className="p-1 text-amber-500 hover:text-amber-700 bg-white rounded border border-amber-100 hover:border-amber-300 shadow-sm shrink-0"
                               title="Clear Schedule"
                             >
                               <X className="w-3 h-3" />
                             </button>
                           )}
                         </div>
                       </div>
                     </div>
                   )}
                   {(formData.visibility === 'private' || formData.visibility === 'individual') && (formData.status === 'scheduled' || formData.postingDate || new Date(`${formData.startDate}T${formData.startTime}:00`) > new Date()) && (
                     <div className="mt-3 pt-3 border-t border-slate-200/60 animate-in slide-in-from-top-2">
                       <label className="flex items-center gap-3 p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-50 transition-all shadow-sm">
                         <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.sendEarlyAlertEmail ? 'bg-[#253A7B] border-[#253A7B]' : 'bg-white border-slate-300'}`}>
                           {formData.sendEarlyAlertEmail && <Shuffle className="w-2.5 h-2.5 text-white" />}
                         </div>
                         <div>
                           <p className="text-[11px] font-bold text-blue-900 tracking-wide uppercase">Notify Assigned Early</p>
                           <p className="text-[9px] text-blue-600/80 leading-tight mt-0.5">Push an immediate alert email to assigned users warning them of this upcoming schedule.</p>
                         </div>
                         <input
                           type="checkbox"
                           className="hidden"
                           checked={formData.sendEarlyAlertEmail}
                           onChange={(e) => setFormData(p => ({ ...p, sendEarlyAlertEmail: e.target.checked }))}
                         />
                       </label>
                     </div>
                   )}
                 </div>
               )}
            </div>
          </div>
        </form>

        {/* Footer */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-[11px] font-medium text-slate-500">Current Status:</span>
               <div className="flex p-0.5 bg-slate-50 border border-slate-200 rounded-md">
                 <button
                   type="button"
                   onClick={() => setFormData(p => ({ ...p, status: 'published' }))}
                   className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${formData.status === 'published' ? 'bg-[#253A7B] text-white' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   Published
                 </button>
                 {formData.visibility !== 'public' && (
                   <button
                     type="button"
                     onClick={() => setFormData(p => ({ ...p, status: 'scheduled' }))}
                     className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${formData.status === 'scheduled' ? 'bg-[#253A7B] text-white' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     Scheduled
                   </button>
                 )}
                 <button
                   type="button"
                   onClick={() => setFormData(p => ({ ...p, status: 'draft' }))}
                   className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${formData.status === 'draft' ? 'bg-[#253A7B] text-white' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   Draft
                 </button>
              </div>
           </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2 bg-white border border-slate-200 rounded-md text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-quiz-form"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-[#253A7B] text-white rounded-md font-semibold text-xs shadow-sm hover:bg-[#1a2a5e] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-red-600 text-white rounded-md text-xs font-medium shadow-lg animate-in slide-in-from-top-4 z-[110]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
