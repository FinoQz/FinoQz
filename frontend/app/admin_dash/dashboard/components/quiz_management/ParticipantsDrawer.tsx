'use client';

import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import DrawerHeader  from './DrawerHeader';
import KPICards from './KPICards';
import QuestionInsightsCard from './QuestionInsightsCard';
import ParticipantsTable from './ParticipantsTable';
import TableFilters from './TableFilters';
import TransactionsTab from './TransactionsTab';
import LeaderboardCard from './LeaderboardCard';
import ViewAttemptModal from './ViewAttemptModal';
import ExportModal from './ExportModal';
import AdminQuizPreviewModal from './AdminQuizPreviewModal';

interface ParticipantsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quizData: {
    _id: string;
    quizTitle: string;   // ✅ backend field
    createdAt: string;
    duration: number;
    price: number;
    status: 'published' | 'draft' | 'scheduled';
  };
}

export default function ParticipantsDrawer({ isOpen, onClose, quizData }: ParticipantsDrawerProps) {
  const quizId = quizData._id;
  const [activeTab, setActiveTab] = useState<'participants' | 'transactions'>('participants');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showViewAttemptModal, setShowViewAttemptModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  interface AttemptSource {
    userId?: string;
    _id?: string;
    id?: string;
    userName?: string;
    name?: string;
    score?: number | null;
    attemptScore?: number;
    timeTaken?: number | string | null;
  }
  interface NormalizedAttempt {
    attemptId: string;
    name: string;
    score: number;
    timeTaken: string;
  }

  const [selectedAttempt, setSelectedAttempt] = useState<NormalizedAttempt | null>(null);

  // Normalize attempt data for modal
  const handleViewAttempt = (attemptData: AttemptSource) => {
    const timeTakenRaw = attemptData.timeTaken;
    const timeTakenNumber =
      typeof timeTakenRaw === 'string'
        ? (parseInt(timeTakenRaw, 10) || 0)
        : (timeTakenRaw ?? 0);
    const normalizedAttempt: NormalizedAttempt = {
      attemptId: attemptData._id || attemptData.id || '',
      name: attemptData.userName || attemptData.name || 'Unknown',
      score: attemptData.score ?? attemptData.attemptScore ?? 0,
      timeTaken: String(timeTakenNumber)
    };
    setSelectedAttempt(normalizedAttempt);
    setShowViewAttemptModal(true);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full lg:w-[85%] xl:w-[80%] bg-gray-50/50 backdrop-blur-sm z-50 border-l border-gray-100 overflow-y-auto animate-slide-in-right">
        <div className="min-h-full">
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-start justify-between px-6 py-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Participants — {quizData.quizTitle}
                  </h2>
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                    <div className="absolute left-0 top-6 w-64 p-2.5 bg-white border border-gray-100 text-gray-600 text-[11px] rounded shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                      Use filters to find users, click view attempt to inspect answers, and use Export to download results.
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  Quiz: {quizData.quizTitle} • Created: {quizData.createdAt} • Duration: {quizData.duration} min
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <DrawerHeader
              quizData={{ _id: quizData._id, title: quizData.quizTitle }}
              onPreview={() => setShowPreviewModal(true)}
              onExport={handleExport}
            />

            {/* Tabs */}
            <div className="flex gap-4 px-6 pb-0">
              <button
                onClick={() => setActiveTab('participants')}
                className={`py-2.5 font-medium text-xs transition-colors border-b-2 ${
                  activeTab === 'participants'
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Participants & Insights
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-2.5 font-medium text-xs transition-colors border-b-2 ${
                  activeTab === 'transactions'
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Transactions & Payments
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {activeTab === 'participants' ? (
              <>
                <KPICards quizId={quizId} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <QuestionInsightsCard quizId={quizId} />
                  <LeaderboardCard quizId={quizId} />
                </div>
                
                <TableFilters />

                <ParticipantsTable
                  selectedParticipants={selectedParticipants}
                  onSelectionChange={setSelectedParticipants}
                  onViewAttempt={handleViewAttempt}
                  quizId={quizId}
                />
              </>
            ) : (
              <TransactionsTab quizId={quizId} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showViewAttemptModal && selectedAttempt && (
        <ViewAttemptModal
          attemptData={selectedAttempt}
          onClose={() => setShowViewAttemptModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal
          quizId={quizData._id}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showPreviewModal && (
        <AdminQuizPreviewModal
          quizId={quizId}
          quizTitle={quizData.quizTitle}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
