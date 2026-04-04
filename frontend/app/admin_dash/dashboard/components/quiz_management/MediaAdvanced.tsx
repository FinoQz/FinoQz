'use client';

import React, { useState } from 'react';
import { Upload, X, Award, CheckCircle2, Image as ImageIcon, Video, Layers, Trash2 } from 'lucide-react';
import { QuizData } from './CreateQuizForm';

interface MediaAdvancedProps {
  quizData: QuizData;
  updateQuizData: (newData: Partial<QuizData>) => void;
}

export default function MediaAdvanced({
  quizData,
  updateQuizData
}: MediaAdvancedProps) {
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateQuizData({ bannerImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Media Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm group">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-[12px] font-semibold text-gray-900">Quiz Banner</h4>
            <p className="text-[10px] text-gray-400 font-medium italic">Landscape branding</p>
          </div>
          {quizData.bannerImage && (
            <button 
              onClick={() => updateQuizData({ bannerImage: null })}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {quizData.bannerImage ? (
          <div className="relative h-32 sm:h-40 w-full rounded-lg overflow-hidden border border-gray-100 shadow-inner">
            <img src={quizData.bannerImage} className="w-full h-full object-cover" alt="Banner" />
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-32 sm:h-40 w-full rounded-lg border-2 border-dashed border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#253A7B]/20 transition-all cursor-pointer group/label">
            <div className="w-8 h-8 rounded border border-gray-200 bg-white flex items-center justify-center mb-2 group-hover/label:border-[#253A7B]/20 transition-all">
              <ImageIcon className="w-4 h-4 text-gray-400 group-hover/label:text-[#253A7B] transition-all" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover/label:text-gray-600 transition-all">Upload Banner</span>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} className="hidden" />
          </label>
        )}
      </div>

      {/* Results Control */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Results & Feedback</label>
        
        <div className="flex items-center justify-between p-5 bg-gray-50/30 border border-gray-100 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-md bg-white border border-gray-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Push Results Instantly</h4>
              <p className="text-[11px] text-gray-500 font-medium">Participants see full score analysis after submission</p>
            </div>
          </div>
          <button
            onClick={() => updateQuizData({ showResults: !quizData.showResults })}
            className={`w-10 h-5 rounded-full transition-all relative ${quizData.showResults ? 'bg-[#253A7B]' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${quizData.showResults ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
