'use client';

import React from 'react';
import { Mail, Download, CreditCard, RefreshCw, Award, X } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export default function BulkActions({ selectedCount, onClearSelection }: BulkActionsProps) {
  return (
    <div className="bg-[#253A7B] text-white rounded-xl p-4 shadow-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="font-bold text-lg">{selectedCount}</span>
        <span className="text-sm">participant{selectedCount !== 1 ? 's' : ''} selected</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium text-sm flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Message
        </button>
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium text-sm flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium text-sm flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Mark Paid
        </button>
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refund
        </button>
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium text-sm flex items-center gap-2">
          <Award className="w-4 h-4" />
          Certificate
        </button>
        <button
          onClick={onClearSelection}
          className="p-2 hover:bg-white/20 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
