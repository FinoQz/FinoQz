import React, { useState } from 'react';
import { X } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface Question {
  _id: string;
  text: string;
  options: string[];
  correct: number | null;
  marks: number;
  type: string;
  explanation?: string;
}

interface EditQuestionModalProps {
  question: Question;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditQuestionModal({ question, onClose, onSuccess }: EditQuestionModalProps) {
  const [formData, setFormData] = useState({
    text: question.text || '',
    options: question.options || ['', '', '', ''],
    correct: question.correct ?? 0,
    marks: question.marks || 1,
    type: question.type || 'mcq',
    explanation: question.explanation || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (idx: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === idx ? value : opt)),
    }));
  };

  const handleCorrectChange = (idx: number) => {
    setFormData(prev => ({ ...prev, correct: idx }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiAdmin.put(`/api/questions/questions/${question._id}`, formData);
      if (response.status >= 200 && response.status < 300) {
        onSuccess();
        onClose();
      } else {
        setError(response.data?.message || 'Failed to update question');
      }
    } catch (err) {
      setError('An error occurred while updating the question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">Edit Question</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition" disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
          )}

          <div className="space-y-1">
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
            <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              required
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253A7B] focus:border-transparent text-gray-900 text-sm"
              placeholder="Enter question text"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Options *</label>
              <span className="text-xs text-gray-400">Select correct</span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {formData.options.map((opt, idx) => (
                <div key={idx} className={`flex items-center gap-2 p-1 rounded-lg border ${formData.correct === idx ? 'border-[#253A7B] bg-[#f5f8ff]' : 'border-gray-200 bg-white'} transition-all`}>
                  <span className="inline-block w-6 h-6 rounded-full text-center font-bold text-white text-xs flex items-center justify-center bg-[#253A7B]">{String.fromCharCode(65+idx)}</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#253A7B] focus:border-transparent text-gray-900 text-sm"
                    placeholder={`Option ${idx + 1}`}
                    required
                  />
                  <input
                    type="radio"
                    name="correct"
                    checked={formData.correct === idx}
                    onChange={() => handleCorrectChange(idx)}
                    className="accent-[#253A7B] w-4 h-4"
                    title="Mark as correct"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-1">Marks *</label>
              <input
                type="number"
                id="marks"
                name="marks"
                value={formData.marks}
                onChange={handleInputChange}
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#253A7B] focus:border-transparent text-gray-900 text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
              <textarea
                id="explanation"
                name="explanation"
                value={formData.explanation}
                onChange={handleInputChange}
                rows={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#253A7B] focus:border-transparent text-gray-900 text-sm"
                placeholder="Enter explanation (optional)"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
