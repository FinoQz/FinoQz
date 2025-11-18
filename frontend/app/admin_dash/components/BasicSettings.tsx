'use client';

import React from 'react';
import { Clock, Target, RotateCw, AlertCircle, CheckSquare, Square } from 'lucide-react';

interface BasicSettingsProps {
  quizTitle: string;
  description: string;
  duration: string;
  totalMarks: string;
  attemptLimit: 'unlimited' | '1';
  shuffleQuestions: boolean;
  negativeMarking: boolean;
  negativePerWrong: string;
  onQuizTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onTotalMarksChange: (value: string) => void;
  onAttemptLimitChange: (value: 'unlimited' | '1') => void;
  onShuffleQuestionsChange: (value: boolean) => void;
  onNegativeMarkingChange: (value: boolean) => void;
  onNegativePerWrongChange: (value: string) => void;
}

const durationPresets = [15, 30, 45, 60];

export default function BasicSettings({
  quizTitle,
  description,
  duration,
  totalMarks,
  attemptLimit,
  shuffleQuestions,
  negativeMarking,
  negativePerWrong,
  onQuizTitleChange,
  onDescriptionChange,
  onDurationChange,
  onTotalMarksChange,
  onAttemptLimitChange,
  onShuffleQuestionsChange,
  onNegativeMarkingChange,
  onNegativePerWrongChange
}: BasicSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Settings</h2>
        <p className="text-sm text-gray-600">Configure the core settings for your quiz</p>
      </div>

      {/* Quiz Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quiz Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={quizTitle}
          onChange={(e) => onQuizTitleChange(e.target.value)}
          placeholder="e.g., Personal Finance Fundamentals"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Brief description of what this quiz covers..."
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{description.length}/200 characters</p>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duration (minutes) <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {durationPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onDurationChange(preset.toString())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                duration === preset.toString()
                  ? 'bg-[#253A7B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset} min
            </button>
          ))}
        </div>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="number"
            value={duration}
            onChange={(e) => onDurationChange(e.target.value)}
            placeholder="Custom duration"
            min="1"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Total Marks and Attempt Limit - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Marks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Marks <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => onTotalMarksChange(e.target.value)}
              placeholder="e.g., 100"
              min="1"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Attempt Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attempt Limit <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAttemptLimitChange('1')}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                attemptLimit === '1'
                  ? 'bg-[#253A7B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              1 Attempt
            </button>
            <button
              type="button"
              onClick={() => onAttemptLimitChange('unlimited')}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                attemptLimit === 'unlimited'
                  ? 'bg-[#253A7B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              Unlimited
            </button>
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        {/* Shuffle Questions */}
        <div
          onClick={() => onShuffleQuestionsChange(!shuffleQuestions)}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition"
        >
          <div className="flex items-center gap-3">
            <RotateCw className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Shuffle Questions</h4>
              <p className="text-xs text-gray-600">Randomize question order for each attempt</p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full transition ${
            shuffleQuestions ? 'bg-[#253A7B]' : 'bg-gray-300'
          }`}>
            <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
              shuffleQuestions ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </div>
        </div>

        {/* Negative Marking */}
        <div
          onClick={() => onNegativeMarkingChange(!negativeMarking)}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Negative Marking</h4>
              <p className="text-xs text-gray-600">Deduct marks for incorrect answers</p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full transition ${
            negativeMarking ? 'bg-[#253A7B]' : 'bg-gray-300'
          }`}>
            <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
              negativeMarking ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </div>
        </div>

        {/* Negative Per Wrong - Show when negative marking is ON */}
        {negativeMarking && (
          <div className="ml-8 p-4 bg-white rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Negative Marks per Wrong Answer
            </label>
            <input
              type="number"
              value={negativePerWrong}
              onChange={(e) => onNegativePerWrongChange(e.target.value)}
              placeholder="e.g., 0.25"
              step="0.25"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1">Common values: 0.25, 0.33, 0.5</p>
          </div>
        )}
      </div>
    </div>
  );
}
