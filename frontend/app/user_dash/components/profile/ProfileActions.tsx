'use client';

import React from 'react';
import { Save, X, Trash2 } from 'lucide-react';

interface ProfileActionsProps {
  onSave: () => void;
  onCancel: () => void;
  onDeleteAccount: () => void;
  isSaving?: boolean;
}

export default function ProfileActions({ 
  onSave, 
  onCancel, 
  onDeleteAccount, 
  isSaving = false 
}: ProfileActionsProps) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      onDeleteAccount();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Delete Account Link */}
      <button
        onClick={handleDelete}
        aria-label="Delete Account"
        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition group"
      >
        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="underline">Delete Account</span>
      </button>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full sm:w-auto">
        <button
          onClick={onCancel}
          disabled={isSaving}
          aria-label="Cancel changes"
          className="flex-1 sm:flex-initial px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        
        <button
          onClick={onSave}
          disabled={isSaving}
          aria-label="Save changes"
          className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
