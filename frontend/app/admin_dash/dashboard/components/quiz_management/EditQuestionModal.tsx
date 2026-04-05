import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiAdmin from '@/lib/apiAdmin';

interface Question {
  _id: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  onSuccess: () => void;
}

export default function EditQuestionModal({ isOpen, onClose, question, onSuccess }: EditQuestionModalProps) {
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  if (!isOpen) return null;

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(editedQuestion.options || [])];
    newOptions[index] = value;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiAdmin.put(`/api/questions/questions/${editedQuestion._id}`, {
        text: editedQuestion.text,
        options: editedQuestion.options,
        correct: editedQuestion.correct,
        explanation: editedQuestion.explanation
      });
      
      if (response.status >= 200 && response.status < 300) {
        onSuccess();
        onClose();
      } else {
        setError(response.data?.message || 'Failed to update question');
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-gray-900">Edit Question</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Update question core context</p>
            </div>
            <button 
              onClick={onClose}
              disabled={loading}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 max-h-[85vh] overflow-y-auto no-scrollbar space-y-3">
            {error && (
              <div className="p-2 bg-red-50 border border-red-100 rounded-md text-red-600 text-[11px] font-medium">
                {error}
              </div>
            )}

            {/* Question Text */}
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest min-w-[70px]">Question:</label>
              <input
                type="text"
                value={editedQuestion?.text || ''}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, text: e.target.value })}
                className="flex-1 w-full bg-gray-50 border border-gray-100 rounded-md px-3 py-2 text-[12px] text-gray-900 focus:border-[#253A7B] focus:bg-white outline-none transition-all"
                placeholder="Enter the question text..."
              />
            </div>

            {/* Options Grid */}
            <div className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(editedQuestion?.options || ['', '', '', '']).map((option: string, index: number) => {
                  const isCorrect = editedQuestion?.correct === index;
                  return (
                    <div 
                      key={index} 
                      className={`relative flex items-center gap-2 p-1.5 rounded-md border transition-colors ${
                        isCorrect 
                          ? 'border-[#253A7B] bg-blue-50/30' 
                          : 'border-gray-100 bg-gray-50/50 hover:bg-white'
                      }`}
                    >
                      <button
                        onClick={() => setEditedQuestion({ ...editedQuestion, correct: index })}
                        className={`w-6 h-6 shrink-0 rounded flex items-center justify-center text-[10px] font-black transition-colors ${
                          isCorrect 
                            ? 'bg-[#253A7B] text-white shadow-sm' 
                            : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </button>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 w-full min-w-0 bg-transparent border-none py-1.5 pr-2 text-[11px] text-gray-900 outline-none placeholder:text-gray-400"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation Field */}
            <div className="flex items-center gap-3 pt-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest min-w-[70px]">Explain:</label>
              <input
                type="text"
                value={editedQuestion?.explanation || ''}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, explanation: e.target.value })}
                className="flex-1 w-full bg-gray-50 border border-gray-100 rounded-md px-3 py-2 text-[11px] text-gray-900 focus:border-[#253A7B] focus:bg-white outline-none transition-all"
                placeholder="Why is it correct?"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-500 rounded-lg text-[11px] font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-1.5 bg-[#253A7B] text-white rounded-lg text-[11px] font-bold shadow-sm hover:bg-[#1a2a5e] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
