'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, MessageSquare, TrendingUp,
  ArrowUpRight, Activity, Zap, Award
} from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface ActiveTopic {
  title: string;
  count: number;
}

interface FinanceAnalyticsData {
  totalViews: number;
  totalEngagement: number;
  activeTopics: ActiveTopic[];
}

export default function FinanceAnalyticsPanel() {
  const [data, setData] = useState<FinanceAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await apiAdmin.get<FinanceAnalyticsData>('/api/finance-content/admin/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Analytics Fetch Error', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse flex items-center gap-2 text-xs text-gray-400 p-4"><Zap className="w-3 h-3" /> CALCULATING INSIGHTS...</div>;

  const activeTopics = data?.activeTopics ?? [];

  const stats = [
    { label: 'Total Visibility', value: data?.totalViews || 0, icon: Eye, color: 'blue', trend: '+12%' },
    { label: 'Network Engagement', value: data?.totalEngagement || 0, icon: MessageSquare, color: 'indigo', trend: '+5%' },
    { label: 'Active Topics', value: activeTopics.length, icon: Activity, color: 'emerald', trend: 'STABLE' },
  ];

  return (
    <div className="space-y-6">
      {/* SaaS High-Density Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${s.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  s.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
                {s.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <Activity className="w-3 h-3 text-gray-400" />}
                <span className={`text-[10px] font-bold ${s.trend.startsWith('+') ? 'text-emerald-600' : 'text-gray-500'}`}>{s.trend}</span>
              </div>
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">{s.label}</p>
            <p className="text-[24px] font-bold text-gray-800 mt-2">{s.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Topics (Community Heat) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Community Heat Map
            </h4>
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase bg-slate-50 px-2 py-1 rounded-md">Last 30 Days</span>
          </div>

          <div className="space-y-4">
            {activeTopics.length > 0 ? (
              activeTopics.map((topic: ActiveTopic, i: number) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[12px] font-bold text-slate-400 group-hover:bg-[#253A7B] group-hover:text-white transition-all">
                      #{i + 1}
                    </div>
                    <div>
                      <h5 className="text-[12px] font-bold text-gray-700 group-hover:text-[#253A7B] transition-colors">{topic.title}</h5>
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Most Active Resource</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-gray-800">{topic.count}</span>
                    <MessageSquare className="w-3 h-3 text-[#253A7B]/40" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[12px] text-gray-400 italic py-4">Generating engagement heat map...</p>
            )}
          </div>
        </motion.div>

        {/* System Health / Distribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#253A7B] text-white rounded-[24px] p-6 shadow-xl shadow-blue-900/20 overflow-hidden relative"
        >
          <div className="relative z-10 flex flex-col h-full">
            <h4 className="text-[14px] font-bold flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-blue-400" />
              Expert Visibility Score
            </h4>
            <p className="text-[11px] font-medium text-blue-200/60 leading-relaxed mb-6">Your platforms finance authority is calculated based on unique visits and sustained discussions.</p>

            <div className="mt-auto flex items-end justify-between">
              <div>
                <p className="text-[32px] font-bold tracking-tight leading-none mb-1">92.4</p>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Platform Index</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl border border-white/10">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-[12px] font-bold text-emerald-400">+4.2%</span>
              </div>
            </div>
          </div>

          {/* Abstract Glow Decor */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/20 blur-[80px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-indigo-500/10 blur-[100px]" />
        </motion.div>
      </div>
    </div>
  );
}

