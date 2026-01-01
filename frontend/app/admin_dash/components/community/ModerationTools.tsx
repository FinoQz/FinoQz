'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, StickyNote, MessageSquareX, UserX, AlertTriangle } from 'lucide-react';

interface ModerationToolsProps {
  postId: string;
  postStatus: 'published' | 'draft' | 'flagged';
}

export default function ModerationTools({ postId, postStatus }: ModerationToolsProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [moderatorNote, setModeratorNote] = useState('');

  const handleApprove = () => {
    console.log('Approve post:', postId);
    // API call here
  };

  const handleReject = () => {
    console.log('Reject post:', postId);
    // API call here
  };

  const handleAddNote = () => {
    console.log('Add moderator note:', { postId, note: moderatorNote });
    setModeratorNote('');
    setShowNoteInput(false);
    // API call here
  };

  const handleRemoveComments = () => {
    if (confirm('Remove all comments from this post?')) {
      console.log('Remove comments from post:', postId);
      // API call here
    }
  };

  const handleBlockUser = () => {
    if (confirm('Block this user? This action cannot be undone.')) {
      console.log('Block user for post:', postId);
      // API call here
    }
  };

  return (
    <div className="p-4 space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Moderation Tools</h3>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {postStatus === 'flagged' && (
          <>
            <button
              onClick={handleApprove}
              className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={handleReject}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </>
        )}
        <button
          onClick={() => setShowNoteInput(!showNoteInput)}
          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium text-sm flex items-center justify-center gap-2"
        >
          <StickyNote className="w-4 h-4" />
          Add Note
        </button>
        <button
          onClick={handleRemoveComments}
          className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition font-medium text-sm flex items-center justify-center gap-2"
        >
          <MessageSquareX className="w-4 h-4" />
          Remove Comments
        </button>
        <button
          onClick={handleBlockUser}
          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm flex items-center justify-center gap-2 col-span-2"
        >
          <UserX className="w-4 h-4" />
          Block Author
        </button>
      </div>

      {/* Moderator Note Input */}
      {showNoteInput && (
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700">
            Moderator Note
          </label>
          <textarea
            value={moderatorNote}
            onChange={(e) => setModeratorNote(e.target.value)}
            placeholder="Add internal note about this post..."
            rows={3}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent text-sm resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddNote}
              className="flex-1 px-3 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium text-sm"
            >
              Save Note
            </button>
            <button
              onClick={() => {
                setShowNoteInput(false);
                setModeratorNote('');
              }}
              className="flex-1 px-3 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Warning */}
      {postStatus === 'flagged' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-800">
            This post has been flagged by users. Review carefully before approving.
          </p>
        </div>
      )}
    </div>
  );
}
