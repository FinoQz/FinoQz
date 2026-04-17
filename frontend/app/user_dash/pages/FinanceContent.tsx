'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookOpen, Video, FileText, FileSpreadsheet, 
  ChevronRight, Filter, TrendingUp, Globe, Clock, 
  ArrowUpRight, LayoutGrid, Sidebar as SidebarIcon,
  MessageSquare, Sparkles, Hash, Zap, Plus, Eye
} from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import ResourceViewer from '../components/ResourceViewer';

interface Subcategory {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

interface Resource {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  type: 'blog' | 'video' | 'pdf' | 'excel';
  thumbnail: string;
  categoryId: { _id: string; name: string; icon: string };
  subCategoryId?: { _id: string; name: string };
  analytics: { views: number };
  createdAt: string;
  publishedAt?: string;
}

export default function FinanceContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [selectedSub, setSelectedSub] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [selectedCat, selectedSub, search]);

  const fetchInitialData = async () => {
    try {
      const res = await apiAdmin.get('/api/finance-content/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Initial Fetch Error');
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await apiAdmin.get('/api/finance-content', {
        params: {
          categoryId: selectedCat || undefined,
          subCategoryId: selectedSub || undefined,
          search: search || undefined,
          limit: 20
        }
      });
      setResources(res.data.content || []);
    } catch (err) {
      console.error('Resources Fetch Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (resource: Resource) => {
    setViewerLoading(true);
    try {
      const res = await apiAdmin.get(`/api/finance-content/${resource.slug}`);
      setSelectedResource(res.data);
    } catch (err) {
      // Fallback to list data if slug fetch fails
      setSelectedResource(resource as any);
      console.error('Full resource fetch failed, using list data');
    } finally {
      setViewerLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFDFD] overflow-hidden">
      {/* SaaS Minimalist Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-r border-gray-50 bg-white flex flex-col z-20"
          >
            <div className="p-8 border-b border-gray-50">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#253A7B] flex items-center justify-center text-white">
                     <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-[14px] font-bold text-gray-800 tracking-tight">Finance Intelligence</span>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
               <div className="space-y-4">
                  <h4 className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Resource Browser</h4>
                  
                  <button 
                    onClick={() => { setSelectedCat(''); setSelectedSub(''); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12px] font-bold transition-all ${
                      !selectedCat ? 'bg-[#253A7B] text-white shadow-lg shadow-blue-900/10' : 'text-gray-500 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Global Repository
                  </button>

                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <div key={cat._id} className="space-y-1">
                        <button 
                          onClick={() => { setSelectedCat(cat._id); setSelectedSub(''); }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[12px] font-bold transition-all ${
                            selectedCat === cat._id ? 'bg-slate-100 text-[#253A7B]' : 'text-gray-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                             <div className={`w-1.5 h-1.5 rounded-full ${selectedCat === cat._id ? 'bg-[#253A7B]' : 'bg-gray-200'}`} />
                             {cat.name}
                          </div>
                          <ChevronRight className={`w-3 h-3 transition-transform ${selectedCat === cat._id ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {selectedCat === cat._id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pl-6 space-y-1">
                            {cat.subcategories.map(sub => (
                              <button
                                key={sub._id}
                                onClick={() => setSelectedSub(sub._id)}
                                className={`w-full text-left px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${
                                  selectedSub === sub._id ? 'text-[#253A7B] bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                {sub.name.toUpperCase()}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
               </div>

               <div className="pt-6 border-t border-gray-50 space-y-4">
                  <h4 className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Intelligence Hub</h4>
                  <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100">
                     <p className="text-[11px] font-medium text-gray-500 leading-relaxed mb-3">Your personalized feed is calculated based on market analysis.</p>
                     <div className="flex items-center gap-2 text-[#253A7B]">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[12px] font-bold tracking-tight">+14 new assets</span>
                     </div>
                  </div>
               </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Experience Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-8 py-6 flex justify-between items-center bg-white border-b border-gray-50/50">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-gray-400">
               <SidebarIcon className="w-5 h-5" />
            </button>
            <div className="h-4 w-px bg-gray-100 mx-2" />
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#253A7B] transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search Intelligence Hub..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="pl-10 pr-6 py-2.5 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-medium outline-none focus:bg-white focus:border-blue-100 transition-all w-80 lg:w-[450px]"
               />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 bg-green-50 rounded-full border border-green-100/50">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-green-700 tracking-wider">LIVE INTEL</span>
             </div>
             <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-bold text-gray-700 hover:shadow-sm transition-all focus:ring-4 focus:ring-slate-100">
                <Filter className="w-4 h-4" />
                ADVANCED
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* SaaS Banner */}
            <div className="relative p-10 bg-[#253A7B] rounded-[40px] overflow-hidden shadow-2xl shadow-blue-900/10">
               <div className="relative z-10 max-w-xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                     <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                     <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Premium Resource Center</span>
                  </div>
                  <h2 className="text-[28px] font-bold text-white tracking-tight leading-tight">Expert Financial Guidance, Granularly Categorized.</h2>
                  <p className="text-[13px] font-medium text-blue-200/60 leading-relaxed">Access high-fidelity analysis, technical documents, and expert video content curated for professional growth.</p>
               </div>
               <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-blue-400/20 to-transparent flex items-center justify-center">
                  <div className="w-48 h-48 bg-blue-500/20 rounded-full blur-[80px]" />
               </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {loading ? (
                 Array.from({ length: 8 }).map((_, i) => (
                   <div key={i} className="animate-pulse space-y-4">
                     <div className="aspect-[4/3] bg-gray-100 rounded-[28px]" />
                     <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                     <div className="h-3 bg-gray-50 rounded-full w-1/2" />
                   </div>
                 ))
               ) : resources.length === 0 ? (
                 <div className="col-span-full py-20 text-center space-y-4">
                    <Hash className="w-12 h-12 text-gray-100 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-[14px] font-bold text-gray-800 tracking-tight">End of the Trail</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No matching resources found in this folder</p>
                    </div>
                 </div>
               ) : resources.map((res) => (
                 <motion.div
                   key={res._id}
                   whileHover={{ y: -6 }}
                   onClick={() => handleCardClick(res)}
                   className="group cursor-pointer bg-white border border-gray-100/60 p-5 rounded-[32px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all"
                 >
                   <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-slate-50 mb-6">
                      {res.thumbnail ? (
                        <img src={res.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20">
                           {res.type === 'blog' && <BookOpen className="w-10 h-10" />}
                           {res.type === 'video' && <Video className="w-10 h-10" />}
                           {res.type === 'pdf' && <FileText className="w-10 h-10" />}
                           {res.type === 'excel' && <FileSpreadsheet className="w-10 h-10" />}
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[9px] font-bold text-[#253A7B] border border-white/20 shadow-sm flex items-center gap-1.5">
                           {res.type === 'blog' && <BookOpen className="w-2.5 h-2.5" />}
                           {res.type === 'video' && <Video className="w-2.5 h-2.5" />}
                           {res.type === 'pdf' && <FileText className="w-2.5 h-2.5" />}
                           {res.type === 'excel' && <FileSpreadsheet className="w-2.5 h-2.5" />}
                           {res.type.toUpperCase()}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-4 px-1">
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{res.categoryId?.name}</span>
                         <ChevronRight className="w-2 h-2 text-gray-300" />
                         <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{res.subCategoryId?.name || 'General'}</span>
                      </div>
                      <h3 className="text-[15px] font-bold text-gray-800 leading-snug group-hover:text-[#253A7B] transition-colors line-clamp-2">{res.title}</h3>
                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                         <div className="flex items-center gap-4 text-gray-400">
                            <div className="flex items-center gap-1.5">
                               <Eye className="w-3 h-3" />
                               <span className="text-[10px] font-bold">{res.analytics?.views || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-500">
                               <ArrowUpRight className="w-3 h-3" />
                               <span className="text-[10px] font-bold">Trending</span>
                            </div>
                         </div>
                         <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-gray-300 group-hover:bg-[#253A7B] group-hover:text-white transition-all">
                            <Plus className="w-3.5 h-3.5" />
                         </button>
                      </div>
                   </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      </main>

      {/* Resource Experience viewer */}
      {/* Loading overlay while fetching full resource */}
      <AnimatePresence>
        {viewerLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
          >
            <div className="bg-white rounded-[32px] p-8 flex flex-col items-center gap-4 shadow-2xl">
              <div className="w-10 h-10 border-4 border-[#253A7B]/20 border-t-[#253A7B] rounded-full animate-spin" />
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Loading Content...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedResource && (
          <ResourceViewer 
            resource={selectedResource} 
            onClose={() => setSelectedResource(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
