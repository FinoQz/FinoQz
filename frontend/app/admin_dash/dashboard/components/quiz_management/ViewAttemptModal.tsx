'use client';

import React, { useState } from 'react';
import { X, Check, XCircle, Edit3, Save } from 'lucide-react';

interface AttemptData {
  name: string;
  score: number;
  timeTaken: string;
}
interface ViewAttemptModalProps {
  attemptData: AttemptData;
  onClose: () => void;
}

export default function ViewAttemptModal({ attemptData, onClose }: ViewAttemptModalProps) {
  const [editingMarks, setEditingMarks] = useState<{ [key: number]: number }>({});
  const [isEditing, setIsEditing] = useState(false);

  const questions = [
    {
      id: 1,
      text: 'What is compound interest?',
      userAnswer: 'Interest calculated on initial principal and accumulated interest',
      correctAnswer: 'Interest calculated on initial principal and accumulated interest',
      isCorrect: true,
      marksAwarded: 5,
      totalMarks: 5
    },
    {
      id: 2,
      text: 'Define EBITDA',
      userAnswer: 'Earnings Before Interest and Tax',
      correctAnswer: 'Earnings Before Interest, Taxes, Depreciation, and Amortization',
      isCorrect: false,
      marksAwarded: 0,
      totalMarks: 5
    },
    {
      id: 3,
      text: 'Current capital gains tax rate in India?',
      userAnswer: '15%',
      correctAnswer: '15% for short-term, 10% for long-term',
      isCorrect: false,
      marksAwarded: 2,
      totalMarks: 5
    }
  ];

  const handleSaveMarks = () => {
    console.log('Saving edited marks:', editingMarks);
    alert('Marks updated successfully!');
    setIsEditing(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{attemptData.name}&apos;s Attempt</h2>
              <p className="text-sm text-gray-600 mt-1">
                Score: <span className="font-bold text-[#253A7B]">{attemptData.score}%</span> • 
                Time: {attemptData.timeTaken}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <button
                  onClick={handleSaveMarks}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium text-sm flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Marks
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Question {question.id}
                  </h3>
                  {question.isCorrect ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>

                <p className="text-gray-700 mb-4">{question.text}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User Answer */}
                  <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-2">User&apos;s Answer</p>
                    <p className="text-gray-900">{question.userAnswer}</p>
                  </div>

                  {/* Correct Answer */}
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <p className="text-xs font-semibold text-green-600 uppercase mb-2">Correct Answer</p>
                    <p className="text-gray-900">{question.correctAnswer}</p>
                  </div>
                </div>

                {/* Marks */}
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm text-gray-600">Marks:</span>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max={question.totalMarks}
                      defaultValue={question.marksAwarded}
                      onChange={(e) => setEditingMarks({ ...editingMarks, [question.id]: parseInt(e.target.value) })}
                      className="w-20 px-3 py-1 border-2 border-gray-300 rounded-lg focus:border-[#253A7B] focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold text-lg text-gray-900">{question.marksAwarded}</span>
                  )}
                  <span className="text-sm text-gray-600">/ {question.totalMarks}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Score</p>
                <p className="text-2xl font-bold text-gray-900">{attemptData.score}%</p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
