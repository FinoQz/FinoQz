'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Rocket, Lightbulb, CheckCircle2, Send, Clock, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface Update {
  id: string;
  date: string;
  title: string;
  description: string;
}

interface ComingSoon {
  id: string;
  name: string;
  timeline?: string;
}

export default function Roadmap() {
  const [activeTab, setActiveTab] = useState<'updates' | 'comingSoon' | 'suggest'>('updates');
  const [updates, setUpdates] = useState<Update[]>([]);
  const [comingSoon, setComingSoon] = useState<ComingSoon[]>([]);
  const [suggestion, setSuggestion] = useState({ 
    name: '', 
    email: '', 
    text: '', 
    category: 'Quiz Improvement', 
    priority: 'Nice to have' 
  });
  const [categories, setCategories] = useState<string[]>(['Quiz Improvement', 'UI/UX', 'Performance', 'New Feature']);
  const [priorities, setPriorities] = useState<string[]>(['Nice to have', 'Important', 'Critical']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  const fetchRoadmapData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/landing`);
      setUpdates(response.data.updates || []);
      setComingSoon(response.data.comingSoon || []);
      if (response.data.suggestionCategories) setCategories(response.data.suggestionCategories);
      if (response.data.suggestionPriorities) setPriorities(response.data.suggestionPriorities);
      
      setSuggestion(prev => ({
        ...prev,
        category: response.data.suggestionCategories?.[0] || 'Quiz Improvement',
        priority: response.data.suggestionPriorities?.[0] || 'Nice to have'
      }));
    } catch (error) {
      console.error('Error fetching roadmap data:', error);
    }
  };

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.text.trim()) return;
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.post(`${API_URL}/api/suggestions`, {
        name: suggestion.name,
        email: suggestion.email,
        suggestion: suggestion.text,
        category: suggestion.category,
        priority: suggestion.priority
      });
      setMessage({ type: 'success', text: 'Thank you for your suggestion!' });
      setSuggestion({ 
        name: '', 
        email: '', 
        text: '', 
        category: categories[0] || 'Quiz Improvement', 
        priority: priorities[0] || 'Nice to have' 
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedUpdates = updates.reduce((acc: Record<string, Update[]>, update) => {
    const date = new Date(update.date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(update);
    return acc;
  }, {});

  const sortedMonths = Object.keys(groupedUpdates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <section id="roadmap" className="py-16 md:py-24 bg-[#FAFAFA] relative overflow-hidden border-y border-gray-100">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Sober Header */}
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase"
          >
            Evolution & Feedback
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-gray-900 leading-tight">
            Product <span className="text-[#253A7B] font-bold">Roadmap</span> & Innovations
          </h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto leading-relaxed italic">
            Participate in our journey by suggesting improvements and tracking our latest releases.
          </p>
        </div>

        {/* Minimal Tabs */}
        <div className="flex justify-center mb-10 md:mb-16">
          <div className="bg-white border border-gray-100 p-1 rounded-[1.25rem] flex flex-nowrap justify-center gap-0.5 sm:gap-1 shadow-sm max-w-full overflow-hidden">
            {[
              { id: 'updates', label: 'UPDATES', icon: Calendar },
              { id: 'comingSoon', label: 'COMING SOON', icon: Rocket },
              { id: 'suggest', label: 'IMPROVE', icon: Lightbulb },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'updates' | 'comingSoon' | 'suggest')}
                className={`flex items-center gap-1.5 md:gap-2 px-2.5 sm:px-4 md:px-5 py-2 rounded-[1rem] transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gray-50 text-[#253A7B] shadow-inner'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                }`}
              >
                <tab.icon className={`w-3 h-3 md:w-3.5 md:h-3.5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-300'}`} />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-tight sm:tracking-wider uppercase whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="max-w-3xl mx-auto min-h-[450px]">
          <AnimatePresence mode="wait">
            {activeTab === 'updates' && (
              <motion.div
                key="updates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                {sortedMonths.length > 0 ? (
                  sortedMonths.map((month) => (
                    <div key={month} className="relative pl-10">
                      <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-100" />
                      <div className="absolute left-[-3px] top-1.5 w-[7px] h-[7px] rounded-full bg-blue-500 border border-white shadow-sm" />
                      <h3 className="text-xs font-bold text-[#253A7B] tracking-widest uppercase mb-6 bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100">{month}</h3>
                      <div className="grid gap-3">
                        {groupedUpdates[month].map((update: Update) => (
                          <div key={update.id} className="bg-white border border-gray-100 p-5 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-[13px] font-bold text-gray-800 group-hover:text-[#253A7B] transition-colors">{update.title}</h4>
                              <span className="text-[9px] font-bold text-gray-400 border border-gray-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                                {new Date(update.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed font-medium line-clamp-2 italic">{update.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3 opacity-50" />
                    <p className="text-[11px] text-gray-400 font-bold tracking-widest uppercase">Chronicle Empty</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'comingSoon' && (
              <motion.div
                key="comingSoon"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid gap-3"
              >
                {comingSoon.length > 0 ? (
                  comingSoon.map((item) => (
                    <div key={item.id} className="group flex items-center justify-between bg-white border border-gray-50 p-6 rounded-[2rem] shadow-sm hover:border-blue-100 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#253A7B] group-hover:text-white transition-all shadow-sm">
                          <Rocket className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold text-gray-800 tracking-tight">{item.name}</h4>
                          {item.timeline && <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mt-0.5">EST: {item.timeline}</p>}
                        </div>
                      </div>
                      <span className="text-[9px] px-3 py-1 bg-gray-50 text-gray-400 rounded-full font-bold tracking-widest uppercase border border-gray-100">STAGING</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                    <Rocket className="w-8 h-8 text-gray-300 mx-auto mb-3 opacity-50" />
                    <p className="text-[11px] text-gray-400 font-bold tracking-widest uppercase">Horizon Clear</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'suggest' && (
              <motion.div
                key="suggest"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-gray-100 p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 blur-3xl -mr-12 -mt-12" />
                
                <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-50">
                   <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#253A7B] shadow-sm">
                      <Lightbulb className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="text-[16px] font-bold text-gray-800">Collaborative Improvement</h3>
                      <p className="text-[11px] text-gray-400 font-medium italic mt-0.5">Help us curate the perfect learning experience.</p>
                   </div>
                </div>

                <form onSubmit={handleSuggest} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Identity</label>
                      <input
                        type="text"
                        placeholder="Name"
                        className="w-full bg-gray-50/30 border border-gray-50 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all font-medium"
                        value={suggestion.name}
                        onChange={e => setSuggestion({...suggestion, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Contact</label>
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full bg-gray-50/30 border border-gray-50 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all font-medium"
                        value={suggestion.email}
                        onChange={e => setSuggestion({...suggestion, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Category</label>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSuggestion({...suggestion, category: cat})}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-300 border ${
                            suggestion.category === cat
                              ? 'bg-blue-50 text-[#253A7B] border-blue-100 shadow-sm'
                              : 'bg-white text-gray-400 border-gray-100 hover:text-gray-600 hover:bg-gray-50/50'
                          }`}
                        >
                          {cat.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Priority</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {priorities.map((pri) => {
                        const isSelected = suggestion.priority === pri;
                        let themeClass = '';
                        if (pri.toLowerCase().includes('nice')) themeClass = isSelected ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-gray-400 border-gray-100 hover:text-emerald-600 hover:bg-emerald-50/30';
                        else if (pri.toLowerCase().includes('important')) themeClass = isSelected ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-white text-gray-400 border-gray-100 hover:text-amber-600 hover:bg-amber-50/30';
                        else if (pri.toLowerCase().includes('critical')) themeClass = isSelected ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-white text-gray-400 border-gray-100 hover:text-rose-600 hover:bg-rose-50/30';
                        else themeClass = isSelected ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-white text-gray-400 border-gray-100 hover:text-blue-600 hover:bg-blue-50/30';

                        return (
                          <button
                            key={pri}
                            type="button"
                            onClick={() => setSuggestion({...suggestion, priority: pri})}
                            className={`py-2 rounded-xl text-[9px] font-bold tracking-wider transition-all duration-300 border uppercase ${themeClass} ${pri.toLowerCase().includes('critical') ? 'col-span-2 sm:col-span-1' : ''}`}
                          >
                            {pri}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-[0.1em]">Narrative</label>
                    <textarea
                      rows={4}
                      placeholder="Describe the improvement..."
                      className="w-full bg-gray-50/30 border border-gray-50 rounded-2xl px-5 py-4 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all resize-none shadow-inner font-medium italic"
                      required
                      value={suggestion.text}
                      onChange={e => setSuggestion({...suggestion, text: e.target.value})}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#253A7B] text-white text-[11px] font-bold tracking-[0.2em] py-4 rounded-2xl shadow-lg shadow-blue-900/10 hover:shadow-xl hover:bg-[#1a2a5e] transition-all flex items-center justify-center gap-3 group uppercase"
                  >
                    <span>{isSubmitting ? 'TRANSMITTING...' : 'SUBMIT IMPROVEMENT'}</span>
                    {!isSubmitting && <Send className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform opacity-70" />}
                  </button>

                  <AnimatePresence>
                    {message.text && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-center py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase ${
                          message.type === 'success' ? 'text-emerald-600 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50'
                        }`}
                      >
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
