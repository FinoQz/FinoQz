'use client';

import React, { useState } from 'react';
import { Clock, Target, RotateCw, Brain, Loader2, FileText } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import { QuizData } from './CreateQuizForm';

interface BasicSettingsProps {
  quizData: QuizData;
  updateQuizData: (newData: Partial<QuizData>) => void;
  onNext?: () => void;
}

const durationPresets = [15, 30, 45, 60, 90];

export default function BasicSettings({
  quizData,
  updateQuizData,
  onNext,
}: BasicSettingsProps) {
  const [loadingDesc, setLoadingDesc] = useState(false);

  const handleSuggestDescription = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!quizData.quizTitle.trim()) return;
    setLoadingDesc(true);
    try {
      const res = await apiAdmin.post('/api/quizzes/admin/generate-description', { quizTitle: quizData.quizTitle });
      if (res.data?.description) {
        updateQuizData({ description: res.data.description });
      }
    } catch (err) {
      console.error('AI Desc error', err);
    } finally {
      setLoadingDesc(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Identity Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-[#253A7B]">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Quiz Identity</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 ml-0.5">Quiz Title</label>
            <input
              type="text"
              value={quizData.quizTitle}
              onChange={(e) => updateQuizData({ quizTitle: e.target.value })}
              placeholder="e.g. Advanced Financial Modeling"
              className="w-full bg-white border border-gray-200 rounded-md px-4 py-2.5 text-sm font-normal focus:border-[#253A7B] focus:ring-1 focus:ring-[#253A7B]/10 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-xs font-medium text-gray-500 ml-0.5">Description</label>
            <textarea
              value={quizData.description}
              onChange={(e) => updateQuizData({ description: e.target.value })}
              rows={4}
              placeholder="Describe the learning objectives and outcomes..."
              className="w-full bg-white border border-gray-200 rounded-md px-4 py-2.5 text-sm font-normal focus:border-[#253A7B] focus:ring-1 focus:ring-[#253A7B]/10 outline-none transition-all resize-none"
            />
            <button
              onClick={handleSuggestDescription}
              disabled={loadingDesc || !quizData.quizTitle.trim()}
              className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded text-[#253A7B] text-[11px] font-medium hover:bg-gray-100 transition-all disabled:opacity-30"
            >
              {loadingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
              AI Suggest
            </button>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-gray-50">
            <label className="text-xs font-medium text-gray-500 ml-0.5">Difficulty Level</label>
            <div className="flex bg-gray-50 p-1 rounded-md border border-gray-100 gap-1">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => updateQuizData({ difficultyLevel: level })}
                  className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-all capitalize ${
                    quizData.difficultyLevel === level 
                      ? 'bg-white text-[#253A7B] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-gray-100' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rules & Parameters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-md bg-green-50 flex items-center justify-center text-green-700">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Rules & Parameters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Time & Marks */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-medium text-gray-500 ml-0.5">Duration (Minutes)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {durationPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => updateQuizData({ duration: preset })}
                    className={`px-3 py-1 rounded text-[11px] font-medium border transition-all ${
                      Number(quizData.duration) === preset
                        ? 'border-[#253A7B] bg-blue-50 text-[#253A7B]'
                        : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {preset}m
                  </button>
                ))}
              </div>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="number"
                  value={quizData.duration}
                  onChange={(e) => updateQuizData({ duration: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-4 py-2 text-sm font-normal focus:border-[#253A7B] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Logic & Limits */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-medium text-gray-500 ml-0.5">Attempt Limit</label>
              <div className="flex p-0.5 bg-gray-50 rounded-md border border-gray-100">
                <button
                  onClick={() => updateQuizData({ attemptLimit: '1' })}
                  className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-all ${
                    quizData.attemptLimit === '1' ? 'bg-white text-[#253A7B] shadow-sm font-semibold' : 'text-gray-400'
                  }`}
                >
                  Single Attempt
                </button>
                <button
                  onClick={() => updateQuizData({ attemptLimit: 'unlimited' })}
                  className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-all ${
                    quizData.attemptLimit === 'unlimited' ? 'bg-white text-[#253A7B] shadow-sm font-semibold' : 'text-gray-400'
                  }`}
                >
                  Unlimited
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-gray-500 ml-0.5">Question Logic</label>
              <button
                onClick={() => updateQuizData({ shuffleQuestions: !quizData.shuffleQuestions })}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-md border transition-all ${
                  quizData.shuffleQuestions
                    ? 'border-blue-100 bg-blue-50/20 text-[#253A7B]'
                    : 'border-gray-100 bg-gray-50 text-gray-400'
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs font-medium">
                  <RotateCw className={`w-3.5 h-3.5 ${quizData.shuffleQuestions ? 'animate-spin-slow' : ''}`} />
                  Shuffle Questions
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${quizData.shuffleQuestions ? 'bg-[#253A7B]' : 'bg-gray-200'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full transition-all ${quizData.shuffleQuestions ? 'translate-x-4' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
