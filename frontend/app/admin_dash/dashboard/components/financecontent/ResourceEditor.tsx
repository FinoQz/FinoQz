'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, BookOpen, Video, FileText, Layout,
  Image as ImageIcon, Upload, Youtube, Trash2,
  Plus, Check, Loader2, Sparkles, BarChart3,
  FileSpreadsheet, ExternalLink, Globe
} from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

type ContentType = 'blog' | 'video' | 'pdf' | 'excel';

interface FinanceSubcategory {
  _id: string;
  name: string;
}

interface FinanceCategory {
  _id: string;
  name: string;
  subcategories: FinanceSubcategory[];
}

interface FinanceContent {
  _id?: string;
  type?: ContentType;
  title?: string;
  excerpt?: string;
  content?: string;
  categoryId?: string | { _id: string };
  subCategoryId?: string | { _id: string };
  thumbnail?: string;
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  blogData?: { images?: string[] };
  videoData?: { url?: string; thumbnail?: string; title?: string };
  fileData?: { url?: string; filename?: string };
}

interface ResourceEditorProps {
  content: FinanceContent | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ResourceEditor({ content, onClose, onSave }: ResourceEditorProps) {
  const [contentType, setContentType] = useState<ContentType>(content?.type || 'blog');
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState<{ thumbnail?: boolean, blog?: boolean }>({});

  const getRefId = (value?: string | { _id: string }) =>
    typeof value === 'string' ? value : value?._id || '';

  const [formData, setFormData] = useState({
    title: content?.title || '',
    excerpt: content?.excerpt || '',
    content: content?.content || '',
    categoryId: getRefId(content?.categoryId),
    subCategoryId: getRefId(content?.subCategoryId),
    thumbnail: content?.thumbnail || '',
    tags: content?.tags?.join(', ') || '',
    isPublished: content?.isPublished ?? false,
    isFeatured: content?.isFeatured ?? false,
    blogData: { images: content?.blogData?.images || [] },
    videoData: { url: content?.videoData?.url || '', thumbnail: '', title: '' },
    fileData: { url: content?.fileData?.url || '', filename: '' }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiAdmin.get('/api/finance-content/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories');
    }
  };

  const uploadFileToCloudinary = async (file: File, folder: string) => {
    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error('Cloudinary environment variables missing');
    }

    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);
    form.append('folder', folder);

    const response = await fetch(CLOUDINARY_URL, { method: 'POST', body: form });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Upload failed');
    return data.secure_url;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'thumbnail' | 'blog') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(prev => ({ ...prev, [target]: true }));
    try {
      const url = await uploadFileToCloudinary(file, 'finance-content');
      if (target === 'thumbnail') {
        setFormData({ ...formData, thumbnail: url });
      } else {
        setFormData({ 
          ...formData, 
          blogData: { ...formData.blogData, images: [...formData.blogData.images, url] } 
        });
      }
    } catch (err) {
      alert('Upload failed. Check Cloudinary config.');
    } finally {
      setUploadLoading(prev => ({ ...prev, [target]: false }));
    }
  };

  const handleYtFetch = async () => {
    if (!formData.videoData.url.includes('youtube.com') && !formData.videoData.url.includes('youtu.be')) return;
    setYtLoading(true);
    try {
      const res = await apiAdmin.get(`/api/finance-content/admin/youtube-meta?url=${formData.videoData.url}`);
      setFormData({
        ...formData,
        title: formData.title || res.data.title,
        thumbnail: formData.thumbnail || res.data.thumbnail,
        videoData: { ...formData.videoData, thumbnail: res.data.thumbnail, title: res.data.title }
      });
    } catch (err) {
      console.error('YT Fetch Error');
    } finally {
      setYtLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) { alert('Title is required'); return; }
    if (!formData.categoryId) { alert('Please select a Category'); return; }
    if (contentType === 'blog' && !formData.content) { alert('Blog body cannot be empty'); return; }
    if (contentType === 'video' && !formData.videoData.url) { alert('YouTube URL is required for video posts'); return; }
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        type: contentType,
        // Optional fields handled by backend
      };

      if (content?._id) {
        await apiAdmin.put(`/api/finance-content/admin/${content._id}`, payload);
      } else {
        await apiAdmin.post('/api/finance-content/admin/create', payload);
      }
      onSave();
    } catch (err) {
      alert('Failed to save resource');
    } finally {
      setIsSaving(false);
    }
  };

  const subcategories: FinanceSubcategory[] = categories.find(c => c._id === formData.categoryId)?.subcategories || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative w-full max-w-3xl h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/20"
      >
        {/* Header */}
        <div className="px-10 py-6 border-b border-gray-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-[#253A7B]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-gray-800 tracking-tight">Post Intelligence</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">Streamlined Publishing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        {/* Minimal Content Area */}
        <div className="flex-1 overflow-y-auto px-10 py-10 custom-scrollbar space-y-10">
          
          {/* Action Row - Content Type & Status */}
          <div className="flex items-center justify-between">
             <div className="flex bg-slate-50 p-1 rounded-2xl border border-gray-100">
                {(['blog', 'video', 'pdf', 'excel'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setContentType(t)}
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 ${contentType === t ? 'bg-white text-[#253A7B] shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {t === 'blog' && <BookOpen className="w-3.5 h-3.5" />}
                    {t === 'video' && <Video className="w-3.5 h-3.5" />}
                    {t === 'pdf' && <FileText className="w-3.5 h-3.5" />}
                    {t === 'excel' && <FileSpreadsheet className="w-3.5 h-3.5" />}
                    {t.toUpperCase()}
                  </button>
                ))}
             </div>

             <div className="flex items-center gap-6">
                <div 
                  onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Go Live</span>
                   <div className={`w-9 h-5 rounded-full relative transition-colors ${formData.isPublished ? 'bg-green-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isPublished ? 'left-5' : 'left-1'}`} />
                   </div>
                </div>
                <div className="h-4 w-px bg-gray-100" />
                <button 
                  onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                  className={`p-2.5 rounded-xl transition-all ${formData.isFeatured ? 'bg-yellow-50 text-yellow-600' : 'bg-slate-50 text-gray-300'}`}
                >
                   <Sparkles className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="space-y-8">
            {/* Title Section */}
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a compelling title..."
              className="w-full text-[28px] font-bold text-gray-800 placeholder:text-gray-100 border-none outline-none focus:ring-0 px-0"
            />

            {/* Folder Selection */}
            <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-[32px] border border-gray-50">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Parent Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' })}
                  className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-[13px] font-bold text-gray-700 outline-none"
                >
                  <option value="">Select Category...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sub-Classification</label>
                <select
                  disabled={!formData.categoryId}
                  value={formData.subCategoryId}
                  onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                  className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-[13px] font-bold text-gray-700 outline-none disabled:opacity-50"
                >
                  <option value="">Select Subcategory...</option>
                  {subcategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Thumbnail Upload Section */}
            <div className="space-y-3">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Platform Thumbnail</label>
               <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <input
                      type="text"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="Paste image URL or click upload →"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[13px] font-medium outline-none focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all"
                    />
                    <button 
                      onClick={() => document.getElementById('thumb-upload')?.click()}
                      disabled={uploadLoading.thumbnail}
                      className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-white shadow-sm border border-gray-50 rounded-xl text-[#253A7B] hover:bg-slate-50 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      {uploadLoading.thumbnail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    </button>
                    <input type="file" id="thumb-upload" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail')} />
                  </div>
                  {formData.thumbnail && (
                    <div className="w-16 h-13 rounded-2xl overflow-hidden border border-gray-100 bg-white p-1">
                      <img src={formData.thumbnail} className="w-full h-full object-cover rounded-xl" />
                    </div>
                  )}
               </div>
            </div>

            {/* Dynamic Content Canvas */}
            <div className="pt-6 border-t border-gray-50">
               {contentType === 'blog' && (
                 <div className="space-y-8">
                   <textarea
                     rows={10}
                     value={formData.content}
                     onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                     placeholder="Unfold your financial insights here..."
                     className="w-full bg-transparent border-none text-[16px] leading-relaxed font-medium text-gray-700 outline-none placeholder:text-gray-100 resize-none min-h-[300px]"
                   />
                   <div className="grid grid-cols-4 gap-4">
                      {formData.blogData.images.map((img: string, i: number) => (
                        <div key={i} className="relative group aspect-video rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-slate-50">
                           <img src={img} className="w-full h-full object-cover" />
                           <button onClick={() => {
                             const newImgs = [...formData.blogData.images];
                             newImgs.splice(i, 1);
                             setFormData({ ...formData, blogData: { images: newImgs } });
                           }} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-red-500 shadow-md">
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => document.getElementById('blog-img-upload')?.click()}
                        disabled={uploadLoading.blog}
                        className="aspect-video rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2 text-slate-300 hover:bg-slate-50 hover:border-slate-200 transition-all"
                      >
                         {uploadLoading.blog ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                         <span className="text-[10px] font-bold tracking-widest uppercase">Add Media</span>
                      </button>
                      <input type="file" id="blog-img-upload" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'blog')} />
                   </div>
                 </div>
               )}

               {contentType === 'video' && (
                 <div className="space-y-6">
                    <div className="flex gap-3">
                       <input 
                         type="text" 
                         value={formData.videoData.url}
                         onChange={(e) => setFormData({ ...formData, videoData: { ...formData.videoData, url: e.target.value } })}
                         placeholder="Paste YouTube Link..." 
                         className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl text-[13px] font-medium outline-none" 
                       />
                       <button onClick={handleYtFetch} disabled={ytLoading} className="px-6 bg-[#253A7B] text-white rounded-2xl text-[11px] font-bold flex items-center gap-2">
                          {ytLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                          SYNC
                       </button>
                    </div>
                    {formData.videoData.thumbnail && (
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-gray-50 flex gap-6 items-center">
                          <img src={formData.videoData.thumbnail} className="w-44 aspect-video rounded-2xl object-cover shadow-xl contrast-[1.05]" />
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Metadata Sync Successful</p>
                             <h4 className="text-[15px] font-bold text-gray-800 leading-tight">{formData.videoData.title}</h4>
                          </div>
                       </div>
                    )}
                 </div>
               )}

               {(contentType === 'pdf' || contentType === 'excel') && (
                 <div className="flex gap-4 items-center p-8 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100 justify-center flex-col text-center">
                    <div className="w-16 h-16 bg-white shadow-xl rounded-3xl flex items-center justify-center text-[#253A7B] mb-2">
                       {contentType === 'pdf' ? <FileText className="w-8 h-8" /> : <FileSpreadsheet className="w-8 h-8" />}
                    </div>
                    <div>
                       <p className="text-[14px] font-bold text-gray-800">Asset URL Required</p>
                       <p className="text-[11px] font-medium text-gray-400 mt-1 max-w-[240px]">Paste the secure document URL below to link this technical resource.</p>
                       <input 
                         type="text" 
                         value={formData.fileData.url}
                         onChange={(e) => setFormData({ ...formData, fileData: { ...formData.fileData, url: e.target.value } })}
                         placeholder="https://cdn..." 
                         className="mt-6 w-80 px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-[12px] font-medium outline-none text-center" 
                       />
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="px-10 py-8 border-t border-gray-50 bg-white">
           <button
             onClick={handleSubmit}
             disabled={isSaving}
             className="w-full py-4 bg-[#253A7B] text-white rounded-[24px] shadow-2xl shadow-blue-900/20 text-[14px] font-bold hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
           >
             {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
             {content?._id ? 'UPDATE INTEL' : 'POST CONTENT'}
           </button>
        </div>
      </motion.div>
    </div>
  );
}
