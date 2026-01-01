'use client';

import React, { useState } from 'react';
import { Award, Percent, Users, Clock, Calendar } from 'lucide-react';
import KpiCard from '../components/reports/KpiCard';
import FiltersBar from '../components/reports/FiltersBar';
import ReportsTable from '../components/reports/ReportsTable';
import AttemptModal from '../components/reports/AttemptModal';
import QuestionStats from '../components/reports/QuestionStats';
import Leaderboard from '../components/reports/Leaderboard';
import ExportControls from '../components/reports/ExportControls';
import ScheduleReportModal, { ScheduleConfig } from '../components/reports/ScheduleReportModal';
import Toast from '../components/Toast';

export default function QuizReports() {
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttempts, setSelectedAttempts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAttemptModal, setShowAttemptModal] = useState(false);
  interface AttemptQuestion {
    id: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    marks: number;
    maxMarks: number;
  }

  interface AttemptData {
    userName: string;
    email: string;
    quizTitle: string;
    attemptDate: string;
    score: number;
    totalScore: number;
    percentage: number;
    timeTaken: string;
    questions: AttemptQuestion[];
    id?: string;
  }

  const [selectedAttemptData, setSelectedAttemptData] = useState<AttemptData | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Dummy data
  const attempts = [
    {
      id: 'ATT001',
      userName: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      quizTitle: 'Financial Management Basics',
      attemptDate: '2024-11-28 14:32',
      score: 42,
      totalScore: 50,
      percentage: 84,
      timeTaken: '18m 45s',
      status: 'Passed' as const,
      type: 'Paid' as const
    },
    {
      id: 'ATT002',
      userName: 'Priya Patel',
      email: 'priya.patel@example.com',
      quizTitle: 'Stock Market Analysis',
      attemptDate: '2024-11-28 13:15',
      score: 38,
      totalScore: 50,
      percentage: 76,
      timeTaken: '22m 10s',
      status: 'Passed' as const,
      type: 'Free' as const
    },
    {
      id: 'ATT003',
      userName: 'Amit Kumar',
      email: 'amit.k@example.com',
      quizTitle: 'Advanced Accounting',
      attemptDate: '2024-11-27 16:45',
      score: 28,
      totalScore: 50,
      percentage: 56,
      timeTaken: '25m 30s',
      status: 'Failed' as const,
      type: 'Paid' as const
    },
    {
      id: 'ATT004',
      userName: 'Sneha Reddy',
      email: 'sneha.reddy@example.com',
      quizTitle: 'Financial Management Basics',
      attemptDate: '2024-11-27 11:20',
      score: 45,
      totalScore: 50,
      percentage: 90,
      timeTaken: '15m 25s',
      status: 'Passed' as const,
      type: 'Paid' as const
    },
    {
      id: 'ATT005',
      userName: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      quizTitle: 'Stock Market Analysis',
      attemptDate: '2024-11-26 09:10',
      score: 31,
      totalScore: 50,
      percentage: 62,
      timeTaken: '28m 50s',
      status: 'Passed' as const,
      type: 'Free' as const
    }
  ];

  const kpiData = {
    averageScore: '72.4%',
    passRate: '80%',
    totalAttempts: 1243,
    avgTimeTaken: '21m 30s'
  };

  const scoreDistribution = [
    { range: '0-20%', count: 45 },
    { range: '21-40%', count: 89 },
    { range: '41-60%', count: 234 },
    { range: '61-80%', count: 567 },
    { range: '81-100%', count: 308 }
  ];

  const questionAccuracy = [
    { question: 'What is compound interest?', accuracy: 92 },
    { question: 'Calculate NPV for given cash flows', accuracy: 68 },
    { question: 'Define bear market', accuracy: 85 },
    { question: 'Balance sheet equation', accuracy: 45 },
    { question: 'Stock valuation methods', accuracy: 71 }
  ];

  const mostMissedQuestions = [
    { question: 'Balance sheet equation and its components', missRate: 55 },
    { question: 'Calculate NPV for given cash flows', missRate: 52 },
    { question: 'Differences between FIFO and LIFO', missRate: 48 },
    { question: 'Understanding depreciation methods', missRate: 45 },
    { question: 'Debt to equity ratio calculation', missRate: 42 }
  ];

  const topPerformers = [
    {
      id: '1',
      userName: 'Sneha Reddy',
      avatar: 'SR',
      score: 45,
      totalScore: 50,
      percentage: 90,
      timeTaken: '15m 25s'
    },
    {
      id: '2',
      userName: 'Rahul Sharma',
      avatar: 'RS',
      score: 42,
      totalScore: 50,
      percentage: 84,
      timeTaken: '18m 45s'
    },
    {
      id: '3',
      userName: 'Priya Patel',
      avatar: 'PP',
      score: 38,
      totalScore: 50,
      percentage: 76,
      timeTaken: '22m 10s'
    },
    {
      id: '4',
      userName: 'Vikram Singh',
      avatar: 'VS',
      score: 31,
      totalScore: 50,
      percentage: 62,
      timeTaken: '28m 50s'
    },
    {
      id: '5',
      userName: 'Amit Kumar',
      avatar: 'AK',
      score: 28,
      totalScore: 50,
      percentage: 56,
      timeTaken: '25m 30s'
    }
  ];

  const handleToggleSelectAttempt = (id: string) => {
    setSelectedAttempts(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    setSelectedAttempts(prev =>
      prev.length === attempts.length ? [] : attempts.map(a => a.id)
    );
  };

  const handleViewAttempt = (id: string) => {
    setSelectedAttemptData({
      userName: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      quizTitle: 'Financial Management Basics',
      attemptDate: '2024-11-28 14:32',
      score: 42,
      totalScore: 50,
      percentage: 84,
      timeTaken: '18m 45s',
      questions: [
        {
          id: 'q1',
          question: 'What is compound interest?',
          userAnswer: 'Interest calculated on principal and accumulated interest',
          correctAnswer: 'Interest calculated on principal and accumulated interest',
          isCorrect: true,
          marks: 5,
          maxMarks: 5
        },
        {
          id: 'q2',
          question: 'Calculate NPV for given cash flows',
          userAnswer: '$12,500',
          correctAnswer: '$15,200',
          isCorrect: false,
          marks: 0,
          maxMarks: 10
        },
        {
          id: 'q3',
          question: 'Define bear market',
          userAnswer: 'A market with declining prices over extended period',
          correctAnswer: 'A market with declining prices over extended period',
          isCorrect: true,
          marks: 5,
          maxMarks: 5
        }
      ]
    });
    setShowAttemptModal(true);
  };

  const handleDownloadScorecard = (id: string) => {
    setToast({ type: 'success', message: 'Scorecard downloaded successfully!' });
  };

  const handleRegrade = (id: string) => {
    setToast({ type: 'success', message: 'Regrading initiated. This may take a few moments.' });
  };

  const handleBulkExport = () => {
    setToast({ type: 'success', message: `Exporting ${selectedAttempts.length} attempts...` });
  };

  const handleBulkRegrade = () => {
    setToast({ type: 'success', message: `Regrading ${selectedAttempts.length} attempts...` });
  };

  const handleExportCSV = () => {
    setToast({ type: 'success', message: 'CSV export started. Download will begin shortly.' });
  };

  const handleExportXLSX = () => {
    setToast({ type: 'success', message: 'XLSX export started. Download will begin shortly.' });
  };

  const handleApplyFilters = () => {
    setToast({ type: 'success', message: 'Filters applied successfully' });
  };

  const handleClearFilters = () => {
    setSelectedQuiz('all');
    setDateRange('30');
    setStatus('all');
    setType('all');
    setSearchQuery('');
    setToast({ type: 'success', message: 'Filters cleared' });
  };

  const handleScheduleReport = (schedule: ScheduleConfig) => {
    console.log('Scheduling report:', schedule);
    setToast({ type: 'success', message: `Report scheduled ${schedule.frequency}!` });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-700">Quiz Reports</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            View detailed reports and export quiz performance data
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Schedule Report
          </button>
          <ExportControls onExportCSV={handleExportCSV} onExportXLSX={handleExportXLSX} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <KpiCard
          icon={Award}
          label="Average Score"
          value={kpiData.averageScore}
          trend={{ value: '5.2% from last month', isPositive: true }}
        />
        <KpiCard
          icon={Percent}
          label="Pass Rate"
          value={kpiData.passRate}
          trend={{ value: '2.1% from last month', isPositive: true }}
        />
        <KpiCard
          icon={Users}
          label="Total Attempts"
          value={kpiData.totalAttempts}
        />
        <KpiCard
          icon={Clock}
          label="Avg Time Taken"
          value={kpiData.avgTimeTaken}
        />
      </div>

      {/* Filters */}
      <FiltersBar
        selectedQuiz={selectedQuiz}
        onQuizChange={setSelectedQuiz}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        status={status}
        onStatusChange={setStatus}
        type={type}
        onTypeChange={setType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {/* Main Table - Full Width */}
      <div className="mb-6">
        <ReportsTable
          attempts={attempts}
          selectedAttempts={selectedAttempts}
          onToggleSelect={handleToggleSelectAttempt}
          onToggleSelectAll={handleToggleSelectAll}
          onViewAttempt={handleViewAttempt}
          onDownloadScorecard={handleDownloadScorecard}
          onRegrade={handleRegrade}
          onBulkExport={handleBulkExport}
          onBulkRegrade={handleBulkRegrade}
          currentPage={currentPage}
          totalPages={5}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Charts & Insights Below Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuestionStats
          scoreDistribution={scoreDistribution}
          questionAccuracy={questionAccuracy}
          mostMissedQuestions={mostMissedQuestions}
        />
        <Leaderboard topPerformers={topPerformers} />
      </div>

      {/* Modals */}
      <AttemptModal
        isOpen={showAttemptModal}
        onClose={() => setShowAttemptModal(false)}
        attemptData={selectedAttemptData}
        onRegrade={() => handleRegrade(selectedAttemptData?.id || '')}
      />

      <ScheduleReportModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleScheduleReport}
      />

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
