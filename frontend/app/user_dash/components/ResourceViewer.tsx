'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, ExternalLink, Download, ArrowLeft, Clock, 
  Eye, BookOpen, Video, FileText, FileSpreadsheet,
  Share2, Bookmark, BarChart3, Globe, Youtube,
  Calendar, User
} from 'lucide-react';
import DiscussionBoard from './DiscussionBoard';

interface ResourceViewerProps {
  resource: any;
  onClose: () => void;
}

// Robustly extracts the video ID from any YouTube URL format
function getYouTubeEmbedUrl(url: string): string {
  try {
    // Handle youtu.be/ID short links
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

    // Handle /shorts/ID format
    const shortsMatch = url.match(/\/shorts\/([^?&]+)/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

    // Handle all watch?v= variants (including extra params)
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

    // Already an embed URL — return as-is
    if (url.includes('/embed/')) return url;

    return url;
  } catch {
    return url;
  }
}

export default function ResourceViewer({ resource, onClose }: ResourceViewerProps) {
  if (!resource) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-4 lg:p-10"
    >
      <motion.div
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 50, scale: 0.95 }}
        className="w-full max-w-6xl h-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/20"
      >
        {/* Sleek Navigation Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-slate-100 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-gray-100" />
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">{resource.categoryId?.name}</span>
               <div className="w-1 h-1 bg-gray-200 rounded-full" />
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{resource.subCategoryId?.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-gray-400"><Share2 className="w-4 h-4" /></button>
             <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-gray-400"><Bookmark className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto px-6 py-12 lg:px-0">
            {/* Header Content */}
            <header className="mb-12 space-y-6">
              <h1 className="text-[32px] lg:text-[42px] font-bold text-gray-900 leading-[1.1] tracking-tight">{resource.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-gray-100 flex items-center justify-center text-gray-400 font-bold text-[10px]">
                       <User className="w-4 h-4" />
                    </div>
                    <span className="text-[12px] font-bold text-gray-600 tracking-tight">{resource.authorName}</span>
                 </div>
                 <div className="flex items-center gap-4 text-gray-400">
                    <div className="flex items-center gap-1.5">
                       <Calendar className="w-3.5 h-3.5 opacity-50" />
                       <span className="text-[11px] font-bold uppercase tracking-widest">{new Date(resource.publishedAt || resource.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600">
                       <Eye className="w-3.5 h-3.5" />
                       <span className="text-[11px] font-bold uppercase tracking-widest">{resource.analytics?.views || 0} Expert Views</span>
                    </div>
                 </div>
              </div>

              <p className="text-[16px] text-gray-500 leading-relaxed font-medium bg-slate-50/50 p-6 rounded-[24px] border border-slate-50 italic">
                {resource.excerpt}
              </p>
            </header>

            {/* Media Rendering Stage */}
            <div className="mb-16">
              {resource.type === 'blog' && (
                <div className="space-y-10">
                   {/* Contextual Images Grid */}
                   {resource.blogData?.images?.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resource.blogData.images.map((img: string, i: number) => (
                           <motion.div 
                             key={i} 
                             whileHover={{ scale: 1.02 }}
                             className={`rounded-[32px] overflow-hidden border border-gray-100 shadow-sm ${i === 0 && resource.blogData.images.length % 2 !== 0 ? 'md:col-span-2' : ''}`}
                           >
                              <img src={img} className="w-full h-full object-cover max-h-[400px]" alt={`Expert visual ${i + 1}`} />
                           </motion.div>
                        ))}
                     </div>
                   )}
                   
                   <article className="prose prose-slate max-w-none">
                      <div className="text-[15px] text-gray-700 leading-[1.8] font-medium whitespace-pre-line">
                        {resource.content}
                      </div>
                   </article>
                </div>
              )}

              {resource.type === 'video' && resource.videoData?.url && (
                <div className="space-y-8">
                   <div className="aspect-video w-full rounded-[40px] overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
                      <iframe 
                        className="w-full h-full"
                        src={getYouTubeEmbedUrl(resource.videoData.url)}
                        title="Finance Expert Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                   </div>
                   <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600">
                           <Youtube className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[13px] font-bold text-gray-800">Source Intelligence</p>
                           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">YOUTUBE PLATFORM</p>
                        </div>
                      </div>
                      <a href={resource.videoData.url} target="_blank" className="px-6 py-2.5 bg-white text-gray-800 rounded-xl text-[11px] font-bold border border-gray-100 hover:shadow-md transition-all flex items-center gap-2">
                         <ExternalLink className="w-3.5 h-3.5" />
                         OPEN ON YOUTUBE
                      </a>
                   </div>
                </div>
              )}

              {(resource.type === 'pdf' || resource.type === 'excel') && resource.fileData?.url && (
                <div className="space-y-8">
                  <div className="p-12 border-2 border-dashed border-slate-100 rounded-[48px] bg-slate-50 flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-20 h-20 bg-white shadow-2xl rounded-3xl flex items-center justify-center text-[#253A7B]">
                       {resource.type === 'pdf' ? <FileText className="w-10 h-10" /> : <FileSpreadsheet className="w-10 h-10" />}
                    </div>
                    <div>
                      <h3 className="text-[20px] font-bold text-gray-800 mb-2">Expert {resource.type.toUpperCase()} Asset</h3>
                      <p className="text-[13px] font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">This technical document provides granular data and detailed insights on the chosen topic.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                       <a href={resource.fileData.url} download className="px-10 py-4 bg-[#253A7B] text-white rounded-2xl text-[13px] font-bold shadow-xl shadow-blue-900/20 hover:scale-105 transition-all flex items-center gap-3">
                          <Download className="w-5 h-5" />
                          DOWNLOAD RESOURCE
                       </a>
                       {resource.type === 'pdf' && (
                         <a href={resource.fileData.url} target="_blank" className="px-10 py-4 bg-white text-gray-800 rounded-2xl text-[13px] font-bold border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
                            <Eye className="w-5 h-5" />
                            VIEW IN BROWSER
                         </a>
                       )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Engagement Board Section */}
            <DiscussionBoard resourceId={resource._id} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
