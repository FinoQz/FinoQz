'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface Quiz {
  _id: string;
  quizTitle: string;
  description: string;
  participantCount?: number;
  status: 'published' | 'draft';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delete Quiz</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-gray-700">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>

            {/* Quiz Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Quiz Title:</span>
                <p className="text-base font-semibold text-gray-900 mt-1">{quiz.quizTitle}</p>
              </div>
              
              {quiz.description && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Description:</span>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{quiz.description}</p>
                </div>
              )}

              <div className="flex items-center gap-4 pt-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    quiz.status === 'published' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {quiz.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                {quiz.participantCount !== undefined && quiz.participantCount > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Participants:</span>
                    <span className="ml-2 text-sm font-semibold text-gray-900">
                      {quiz.participantCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Warning for published quizzes with participants */}
            {quiz.status === 'published' && quiz.participantCount && quiz.participantCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Warning: This quiz has {quiz.participantCount} participant(s)</p>
                    <p>Deleting this quiz will affect all users who have enrolled or attempted it. Their progress and attempts will be lost.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Input */}
            <div>
              <label htmlFor="confirmDelete" className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                id="confirmDelete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Type DELETE"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || confirmText !== 'DELETE'}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Delete Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
