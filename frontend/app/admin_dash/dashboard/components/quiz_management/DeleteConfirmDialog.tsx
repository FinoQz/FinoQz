'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface Quiz {
  _id: string;
  quizTitle: string;
  description: string;
  participantCount?: number;
  status: 'published' | 'draft' | 'scheduled';
}

interface DeleteConfirmDialogProps {
  quiz: Quiz;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmDialog({ quiz, onClose, onSuccess }: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiAdmin.delete(`/api/quizzes/admin/quizzes/${quiz._id}`);
      if (response.status >= 200 && response.status < 300) {
        onSuccess();
        onClose();
      } else {
        setError(response.data?.message || 'Failed to delete quiz');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'An error occurred while deleting the quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (loading) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center z-[110] p-3 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl overflow-hidden max-w-md w-full border border-gray-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Delete Quiz</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 max-h-[62vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-xs sm:text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-gray-700 text-sm sm:text-[15px] leading-relaxed">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>

            {/* Quiz Details */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2 border border-gray-100">
              <div>
                <span className="text-xs font-medium text-gray-500">Quiz Title:</span>
                <p className="text-sm sm:text-base font-semibold text-gray-900 mt-1 break-words">{quiz.quizTitle}</p>
              </div>
              
              {quiz.description && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Description:</span>
                  <p className="text-xs sm:text-sm text-gray-700 mt-1 line-clamp-2">{quiz.description}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
                <div>
                  <span className="text-xs font-medium text-gray-500">Status:</span>
                  <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium ${
                    quiz.status === 'published' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {quiz.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                {quiz.participantCount !== undefined && quiz.participantCount > 0 && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Participants:</span>
                    <span className="ml-2 text-xs sm:text-sm font-semibold text-gray-900">
                      {quiz.participantCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Warning for published quizzes with participants */}
            {quiz.status === 'published' && quiz.participantCount && quiz.participantCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-yellow-800">
                    <p className="font-medium mb-1">Warning: This quiz has {quiz.participantCount} participant(s)</p>
                    <p>Deleting this quiz will affect all users who have enrolled or attempted it. Their progress and attempts will be lost.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Input */}
            <div>
              <label htmlFor="confirmDelete" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                id="confirmDelete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Type DELETE"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 px-4 sm:px-5 py-3 sm:py-3.5 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:flex-1 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-xs sm:text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || confirmText !== 'DELETE'}
            className="w-full sm:flex-1 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-xs sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
