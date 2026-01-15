'use client';

import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import DrawerHeader from './DrawerHeader';
import KPICards from './KPICards';
import SecondaryMetrics from './SecondaryMetrics';
import RevenueChart from './RevenueChart';
import AttemptsBarChart from './AttemptsBarChart';
import PaidVsFreeDonutChart from './PaidVsFreeDonutChart';
import QuestionAccuracyChart from './QuestionAccuracyChart';
import QuestionInsightsCard from './QuestionInsightsCard';
import ParticipantsTable from './ParticipantsTable';
import TableFilters from './TableFilters';
import BulkActions from './BulkActions';
import TransactionsTab from './TransactionsTab';
import LeaderboardCard from './LeaderboardCard';
import ActivityTimeline from './ActivityTimeline';
import ExportReports from './ExportReports';
import ViewAttemptModal from './ViewAttemptModal';
import ExportModal from './ExportModal';

interface ParticipantsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quizData: {
    _id: string;
    quizTitle: string;   // ✅ backend field
    createdAt: string;
    duration: number;
    price: number;
    status: 'published' | 'draft';
  };
}

export default function ParticipantsDrawer({ isOpen, onClose, quizData }: ParticipantsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'participants' | 'transactions'>('participants');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showViewAttemptModal, setShowViewAttemptModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  interface AttemptAnswer { questionId: string; answer: string; isCorrect: boolean; }
  interface AttemptSource {
    userId?: string;
    _id?: string;
    id?: string;
    userName?: string;
    name?: string;
    score?: number | null;
    attemptScore?: number;
    timeTaken?: number | string | null;
    answers?: AttemptAnswer[];
  }
  interface NormalizedAttempt {
    userId: string;
    name: string;
    score: number;
    timeTaken: string;
    answers: AttemptAnswer[];
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
      userId: attemptData.userId || attemptData._id || attemptData.id || '',
      name: attemptData.userName || attemptData.name || 'Unknown',
      score: attemptData.score ?? attemptData.attemptScore ?? 0,
      timeTaken: String(timeTakenNumber),
      answers: attemptData.answers || []
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
      <div className="fixed top-0 right-0 h-full w-full lg:w-[85%] xl:w-[80%] bg-gray-50 z-50 shadow-2xl overflow-y-auto animate-slide-in-right">
        <div className="min-h-full">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
            <div className="flex items-start justify-between p-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Participants — {quizData.quizTitle}
                  </h2>
                  <div className="group relative">
                    <HelpCircle className="w-5 h-5 text-gray-400 hover:text-[#253A7B] cursor-help transition" />
                    <div className="absolute left-0 top-8 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl">
                      Use filters to find users, click view attempt to inspect answers, and use Export to download results.
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Quiz ID: {quizData._id} • Created: {quizData.createdAt} • Duration: {quizData.duration} min
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Quick Actions */}
            <DrawerHeader
              quizData={{ _id: quizData._id, title: quizData.quizTitle }}
              onExport={handleExport}
            />

            {/* Tabs */}
            <div className="flex gap-1 px-6 pb-0">
              <button
                onClick={() => setActiveTab('participants')}
                className={`px-6 py-3 font-medium text-sm transition border-b-2 ${
                  activeTab === 'participants'
                    ? 'border-[#253A7B] text-[#253A7B]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Participants & Insights
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-3 font-medium text-sm transition border-b-2 ${
                  activeTab === 'transactions'
                    ? 'border-[#253A7B] text-[#253A7B]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
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
                <KPICards />
                <SecondaryMetrics />

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <RevenueChart />
                    <AttemptsBarChart />
                  </div>
                  <div className="space-y-6">
                    <PaidVsFreeDonutChart />
                    <QuestionAccuracyChart />
                  </div>
                </div>

                <QuestionInsightsCard />
                <LeaderboardCard />
                <ActivityTimeline />
                <ExportReports onExport={handleExport} />
                <TableFilters />

                {selectedParticipants.length > 0 && (
                  <BulkActions
                    selectedCount={selectedParticipants.length}
                    onClearSelection={() => setSelectedParticipants([])}
                  />
                )}

                <ParticipantsTable
                  selectedParticipants={selectedParticipants}
                  onSelectionChange={setSelectedParticipants}
                  onViewAttempt={handleViewAttempt}
                />
              </>
            ) : (
              <TransactionsTab quizId={quizData._id} />
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
