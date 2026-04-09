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
  const [suggestion, setSuggestion] = useState({ name: '', email: '', text: '' });
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
        suggestion: suggestion.text
      });
      setMessage({ type: 'success', text: 'Thank you for your suggestion!' });
      setSuggestion({ name: '', email: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group updates by month
  const groupedUpdates = updates.reduce((acc: any, update) => {
    const date = new Date(update.date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(update);
    return acc;
  }, {});

  const sortedMonths = Object.keys(groupedUpdates).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <section id="roadmap" className="py-20 bg-transparent relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-3 block"
          >
            Product Journey
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What's <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#253A7B] to-blue-600">New & Next</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Stay updated with our latest releases and see what we're building for the future of finance learning.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[
            { id: 'updates', label: 'New Updates', icon: Calendar },
            { id: 'comingSoon', label: 'Coming Soon', icon: Rocket },
            { id: 'suggest', label: 'Suggest Feature', icon: Lightbulb },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border ${
                activeTab === tab.id
                  ? 'bg-[#253A7B] text-white border-[#253A7B] shadow-lg shadow-blue-200 scale-105'
                  : 'bg-white/50 text-gray-600 border-white/80 hover:bg-white/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-3xl mx-auto min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'updates' && (
              <motion.div
                key="updates"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                {sortedMonths.length > 0 ? (
                  sortedMonths.map((month) => (
                    <div key={month} className="relative pl-8 border-l-2 border-blue-100">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
                      <h3 className="text-xl font-bold text-[#253A7B] mb-6">{month}</h3>
                      <div className="grid gap-4">
                        {groupedUpdates[month].map((update: Update) => (
                          <div key={update.id} className="bg-white/60 backdrop-blur-md border border-white/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold text-gray-800">{update.title}</h4>
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold uppercase">
                                {new Date(update.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{update.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-gray-300">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No updates logged yet.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'comingSoon' && (
              <motion.div
                key="comingSoon"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="grid gap-4"
              >
                {comingSoon.length > 0 ? (
                  comingSoon.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-white/70 backdrop-blur-xl border border-white p-6 rounded-[2rem] shadow-sm group hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                          {item.timeline && <p className="text-sm text-blue-500 font-medium">Expected: {item.timeline}</p>}
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <span className="text-[10px] px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold tracking-wider uppercase">In Progress</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-gray-300">
                    <Rocket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Great things are coming soon!</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'suggest' && (
              <motion.div
                key="suggest"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/80 backdrop-blur-2xl border border-white p-8 md:p-10 rounded-[2.5rem] shadow-xl"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
                    <Lightbulb className="w-6 h-6 border-none" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">What should we build next?</h3>
                    <p className="text-sm text-gray-500">Your ideas help us shape the future of FinoQz.</p>
                  </div>
                </div>

                <form onSubmit={handleSuggest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 ml-1">Your Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                        value={suggestion.name}
                        onChange={e => setSuggestion({...suggestion, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 ml-1">Email (Optional)</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                        value={suggestion.email}
                        onChange={e => setSuggestion({...suggestion, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Your Suggestion</label>
                    <textarea
                      rows={4}
                      placeholder="Describe the feature or improvement..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                      required
                      value={suggestion.text}
                      onChange={e => setSuggestion({...suggestion, text: e.target.value})}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#253A7B] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-[#1a2a5e] transition-all flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Idea'}
                    {!isSubmitting && <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  </button>

                  <AnimatePresence>
                    {message.text && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`text-center py-3 rounded-xl text-xs font-bold ${
                          message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
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
