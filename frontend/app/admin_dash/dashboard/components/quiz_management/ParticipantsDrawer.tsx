'use client';

import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import DrawerHeader from './DrawerHeader';
import KPICards from './KPICards';
import QuestionInsightsCard from './QuestionInsightsCard';
import ParticipantsTable, { ParticipantFilters } from './ParticipantsTable';
import TableFilters from './TableFilters';
import TransactionsTab from './TransactionsTab';
import LeaderboardCard from './LeaderboardCard';
import ViewAttemptModal from './ViewAttemptModal';
import ExportModal from './ExportModal';
import AdminQuizPreviewModal from './AdminQuizPreviewModal';

interface QuizData {
  _id: string;
  quizTitle: string;
  createdAt: string;
  duration: number;
  price: number;
  pricingType?: 'free' | 'paid';
  visibility?: string;
  status: 'published' | 'draft' | 'scheduled';
}

interface ParticipantsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quizData: QuizData;
}

interface AttemptViewData {
  attemptId: string;
  name: string;
  email: string;
  score: number;
  timeTaken: string | number;
  city?: string;
  country?: string;
  gender?: string;
  joinDate?: string | null;
}

const DEFAULT_FILTERS: ParticipantFilters = {
  search: '',
  paymentStatus: 'all',
  attemptStatus: 'all',
  dateFrom: '',
  dateTo: '',
  scoreMin: '',
  scoreMax: '',
};

export default function ParticipantsDrawer({ isOpen, onClose, quizData }: ParticipantsDrawerProps) {
  const quizId = quizData._id;
  const pricingType = quizData.pricingType ?? 'free';
  const visibility = quizData.visibility ?? 'public';

  const [activeTab, setActiveTab] = useState<'participants' | 'transactions'>('participants');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showViewAttemptModal, setShowViewAttemptModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptViewData | null>(null);
  const [filters, setFilters] = useState<ParticipantFilters>(DEFAULT_FILTERS);

  const handleViewAttempt = (attempt: AttemptViewData) => {
    setSelectedAttempt({
      attemptId: attempt.attemptId,
      name: attempt.name,
      email: attempt.email,
      score: attempt.score,
      timeTaken: attempt.timeTaken,
      city: attempt.city,
      country: attempt.country,
      gender: attempt.gender,
      joinDate: attempt.joinDate,
    });
    setShowViewAttemptModal(true);
  };

  const handleFilterChange = (newFilters: ParticipantFilters) => {
    setFilters(newFilters);
  };

  if (!isOpen) return null;

  const fmtDate = (d: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full lg:w-[88%] xl:w-[82%] bg-gray-50 z-50 border-l border-gray-100 overflow-y-auto animate-slide-in-right">
        <div className="min-h-full">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between px-6 py-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-bold text-gray-900 truncate max-w-lg">
                    {quizData.quizTitle}
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    pricingType === 'paid'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {pricingType === 'paid' ? `₹${quizData.price}` : 'Free'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    visibility === 'public' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {visibility}
                  </span>
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                    <div className="absolute left-0 top-6 w-64 p-2.5 bg-white border border-gray-100 text-gray-600 text-[11px] rounded-lg shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                      Click on KPI cards to see user lists. Use filters to find participants, click &quot;View&quot; to inspect per-question answers, and Export to download results.
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  ID: <span className="font-mono font-semibold">{quizId.slice(-10)}</span>
                  &nbsp;·&nbsp;Created: {fmtDate(quizData.createdAt)}
                  &nbsp;·&nbsp;Duration: {quizData.duration} min
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-lg transition-colors ml-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <DrawerHeader
              quizData={{ _id: quizData._id, title: quizData.quizTitle }}
              onPreview={() => setShowPreviewModal(true)}
              onExport={() => setShowExportModal(true)}
            />

            {/* Tabs */}
            <div className="flex gap-4 px-6 pb-0 border-t border-gray-50">
              {[
                { key: 'participants', label: 'Participants & Insights' },
                ...(pricingType === 'paid' ? [{ key: 'transactions', label: 'Transactions & Payments' }] : []),
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'participants' | 'transactions')}
                  className={`py-3 font-semibold text-xs transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-[#253A7B] text-[#253A7B]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {activeTab === 'participants' ? (
              <>
                {/* KPI Cards — pass pricingType + visibility */}
                <KPICards
                  quizId={quizId}
                  quizTitle={quizData.quizTitle}
                  pricingType={pricingType}
                  visibility={visibility}
                />

                {/* Insights Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <QuestionInsightsCard quizId={quizId} />
                  <LeaderboardCard quizId={quizId} quizTitle={quizData.quizTitle} />
                </div>

                {/* Filters */}
                <TableFilters
                  onFilterChange={handleFilterChange}
                  pricingType={pricingType}
                />

                {/* Participants Table */}
                <ParticipantsTable
                  quizId={quizId}
                  quizTitle={quizData.quizTitle}
                  pricingType={pricingType}
                  filters={filters}
                  selectedParticipants={selectedParticipants}
                  onSelectionChange={setSelectedParticipants}
                  onViewAttempt={handleViewAttempt}
                />
              </>
            ) : (
              <TransactionsTab quizId={quizId} />
            )}
          </div>
        </div>
      </div>

      {/* View Attempt Modal */}
      {showViewAttemptModal && selectedAttempt && (
        <ViewAttemptModal
          attemptData={selectedAttempt}
          onClose={() => { setShowViewAttemptModal(false); setSelectedAttempt(null); }}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          quizId={quizData._id}
          quizTitle={quizData.quizTitle}
          pricingType={pricingType}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Quiz Preview Modal */}
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
