'use client';

import React, { useState, useEffect } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { Award, Percent, Users, Clock, Calendar } from 'lucide-react';
import KpiCard from '../components/reports/KpiCard';
import FiltersBar from '../components/reports/FiltersBar';
import ReportsTable from '../components/reports/ReportsTable';
import AttemptModal from '../components/reports/AttemptModal';
import QuizPerformanceCharts from '../components/reports/QuizPerformanceCharts';
import ExportControls from '../components/reports/ExportControls';
import ScheduleReportModal, { ScheduleConfig } from '../components/reports/ScheduleReportModal';
import Toast from '../components/reports/Toast';

// TypeScript interfaces for backend data
interface QuizAttempt {
  _id: string;
  userId: {
    _id: string;
    fullName?: string;
    name: string;
    email: string;
  };
  quizId: {
    _id: string;
    title: string;
    type?: string;
    totalMarks?: number;
  };
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  totalScore: number;
  percentage: number;
  timeTaken: number;
  status: 'submitted' | 'in_progress' | 'abandoned';
  answers?: Array<{
    questionId: string;
    answer: string | string[];
    isCorrect?: boolean;
  }>;
}

interface AttemptStats {
  avgScore: number;
  avgPercentage: number;
  maxScore: number;
  minScore: number;
  totalAttempts: number;
  passedAttempts?: number;
  avgTimeTaken?: number;
}

interface QuizStat {
  quizId: string;
  quizTitle: string;
  category?: string;
  totalAttempts: number;
  avgPercentage: number;
  totalRevenue?: number;
}

interface Category {
  _id: string;
  name: string;
}

interface CategoriesResponse {
  data: Category[];
}

interface AttemptAnalysisQuestion {
  questionId: string;
  text: string;
  selectedAnswer?: string | string[];
  correctAnswer?: string | string[];
  isCorrect: boolean;
  marksAwarded: number;
  maxMarks: number;
}

interface AttemptAnalysisResponse {
  attemptId: string;
  user: {
    name: string;
    email: string;
  };
  quiz: {
    title: string;
    totalMarks: number;
  };
  summary: {
    submittedAt?: string;
    score: number;
    percentage: number;
    timeTaken: number;
  };
  questions: AttemptAnalysisQuestion[];
}

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

  // API state
  const [attempts, setAttempts] = useState<Array<{
    id: string;
    userName: string;
    email: string;
    quizTitle: string;
    attemptDate: string;
    score: number;
    totalScore: number;
    percentage: number;
    timeTaken: string;
    status: 'Passed' | 'Failed';
    type: 'Free' | 'Paid';
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AttemptStats | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [quizStats, setQuizStats] = useState<QuizStat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch quiz statistics and categories for overview
  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const [statsRes, catRes] = await Promise.all([
          apiAdmin.get<QuizStat[]>('/api/analytics/quiz-stats'),
          apiAdmin.get<CategoriesResponse>('/api/categories')
        ]);
        setQuizStats(statsRes.data || []);
        setCategories(catRes.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch quiz stats for overview', err);
      }
    };
    fetchDashboards();
  }, []);

  // Fetch quiz attempts from backend
  useEffect(() => {
    const fetchAttempts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number | undefined> = {};
        if (currentPage) params.page = currentPage;
        if (status !== 'all') params.status = status;
        if (dateRange !== 'all') {
          const days = parseInt(dateRange);
          if (!isNaN(days)) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            params.startDate = startDate.toISOString();
          }
        }
        if (searchQuery) params.search = searchQuery;

        // Determine API endpoint
        let url = '/api/quiz-attempts/all';
        if (selectedQuiz && selectedQuiz !== 'all') {
          url = `/api/quiz-attempts/quiz/${selectedQuiz}`;
        }

        const { data } = await apiAdmin.get(url, { params });

        // Transform backend data to match UI format
        const transformedAttempts = data.attempts.map((attempt: QuizAttempt) => {
          const statusLabel = getStatusLabel(attempt.status, attempt.percentage);
          return {
            id: attempt._id,
            userName: attempt.userId?.fullName || attempt.userId?.name || 'Unknown User',
            email: attempt.userId?.email || '',
            quizTitle: attempt.quizId?.title || 'Unknown Quiz',
            attemptDate: formatDateTime(attempt.submittedAt || attempt.startedAt),
            score: attempt.totalScore,
            totalScore: attempt.quizId?.totalMarks || 50,
            percentage: Math.round(attempt.percentage),
            timeTaken: formatTimeTaken(attempt.timeTaken),
            status: (statusLabel === 'Passed' || statusLabel === 'Failed') ? statusLabel : 'Failed' as 'Passed' | 'Failed',
            type: (attempt.quizId?.type || 'Free') as 'Free' | 'Paid'
          };
        });

        setAttempts(transformedAttempts);
        setStats(data.stats);
        setTotalPages(data.totalPages);
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        console.error('Error fetching attempts:', err);
        setError(error?.response?.data?.message || error?.message || 'Failed to load attempts');
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [selectedQuiz, dateRange, status, currentPage, searchQuery]);

  // Helper functions
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
  };

  const formatTimeTaken = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getStatusLabel = (status: string, percentage: number) => {
    if (status === 'submitted') {
      return percentage >= 60 ? 'Passed' : 'Failed';
    }
    return status === 'in_progress' ? 'In Progress' : 'Abandoned';
  };

  const kpiData = {
    averageScore: stats ? `${stats.avgPercentage.toFixed(1)}%` : '0%',
    passRate: stats && stats.totalAttempts > 0 && stats.passedAttempts !== undefined
      ? `${((stats.passedAttempts / stats.totalAttempts) * 100).toFixed(0)}%` 
      : '0%',
    totalAttempts: stats?.totalAttempts || 0,
    avgTimeTaken: stats?.avgTimeTaken ? formatTimeTaken(Math.round(stats.avgTimeTaken)) : 'N/A'
  };

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

  const handleViewAttempt = async (id: string) => {
    try {
      const res = await apiAdmin.get<AttemptAnalysisResponse>(`/api/analytics/attempt-analysis/${id}`);
      const data = res.data;
      
      setSelectedAttemptData({
        id: data.attemptId,
        userName: data.user.name,
        email: data.user.email,
        quizTitle: data.quiz.title,
        attemptDate: formatDateTime(data.summary.submittedAt || new Date().toISOString()),
        score: data.summary.score,
        totalScore: data.quiz.totalMarks,
        percentage: data.summary.percentage,
        timeTaken: formatTimeTaken(data.summary.timeTaken),
        questions: data.questions.map((q) => ({
          id: q.questionId,
          question: q.text,
          userAnswer: Array.isArray(q.selectedAnswer) ? q.selectedAnswer.join(', ') : (q.selectedAnswer || 'Not Answered'),
          correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : (q.correctAnswer || 'N/A'),
          isCorrect: q.isCorrect,
          marks: q.marksAwarded,
          maxMarks: q.maxMarks
        }))
      });
      setShowAttemptModal(true);
    } catch (err) {
      console.error('Failed to fetch attempt details', err);
      setToast({ type: 'error', message: 'Failed to load attempt details' });
    }
  };

  const generateCSV = (dataToExport: typeof attempts, filename: string) => {
    const headers = ['Attempt ID', 'Name', 'Email', 'Quiz Title', 'Date', 'Score', 'Total Score', 'Percentage', 'Time Taken', 'Status'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => [
        `"${row.id}"`,
        `"${row.userName}"`,
        `"${row.email}"`,
        `"${row.quizTitle}"`,
        `"${row.attemptDate}"`,
        row.score,
        row.totalScore,
        `"${row.percentage}%"`,
        `"${row.timeTaken}"`,
        `"${row.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setToast({ type: 'success', message: 'Export completed successfully!' });
  };

  const handleDownloadScorecard = (id: string) => {
    const attempt = attempts.find(a => a.id === id);
    if (attempt) {
      generateCSV([attempt], `scorecard_${attempt.userName.replace(/\s+/g, '_')}_${attempt.quizTitle.replace(/\s+/g, '_')}.csv`);
    }
  };

  const handleBulkExport = () => {
    const dataToExport = selectedAttempts.length > 0 
      ? attempts.filter(a => selectedAttempts.includes(a.id))
      : attempts;
    generateCSV(dataToExport, `bulk_attempts_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportCSV = () => {
    generateCSV(attempts, `quiz_reports_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportXLSX = () => {
    // For simplicity, we trigger CSV here too, just with a different identifier if needed. Real XLSX requires external libs.
    generateCSV(attempts, `quiz_reports_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    setToast({ type: 'success', message: 'Filters applied successfully' });
  };

  const handleClearFilters = () => {
    setSelectedQuiz('all');
    setDateRange('30');
    setStatus('all');
    setType('all');
    setSearchQuery('');
    setCurrentPage(1);
    setToast({ type: 'success', message: 'Filters cleared' });
  };

  const handleScheduleReport = (schedule: ScheduleConfig) => {
    console.log('Scheduling report:', schedule);
    setToast({ type: 'success', message: `Report scheduled ${schedule.frequency}!` });
  };

  const handleRegrade = (attemptId: string) => {
    if (!attemptId) return;
    setToast({ type: 'warning', message: 'Regrade is not implemented yet.' });
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

      {/* Quiz Performance Charts */}
      {quizStats.length > 0 && <QuizPerformanceCharts data={quizStats} />}

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
        quizzes={quizStats.map(q => ({ id: q.quizId, title: q.quizTitle }))}
      />

      {/* Overview Table: Aggregated by Quiz */}
      {quizStats.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Category-Wise Quiz Overview</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                <tr>
                  <th className="px-6 py-3 font-semibold">Quiz Title</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Total Attempts</th>
                  <th className="px-6 py-3 font-semibold">Avg Score</th>
                  <th className="px-6 py-3 font-semibold text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quizStats.map((qz, idx) => {
                  const catName = categories.find(c => c._id === qz.category)?.name || 'General';
                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">{qz.quizTitle}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
                           {catName}
                        </span>
                      </td>
                      <td className="px-6 py-3">{qz.totalAttempts}</td>
                      <td className="px-6 py-3 font-semibold text-blue-600">{qz.avgPercentage}%</td>
                      <td className="px-6 py-3 text-right font-medium text-green-600">₹{qz.totalRevenue || 0}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Table - Full Width */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Attempts Audit</h2>
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading quiz attempts...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-600 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <ReportsTable
            attempts={attempts}
            selectedAttempts={selectedAttempts}
            onToggleSelect={handleToggleSelectAttempt}
            onToggleSelectAll={handleToggleSelectAll}
            onViewAttempt={handleViewAttempt}
            onDownloadScorecard={handleDownloadScorecard}
            onBulkExport={handleBulkExport}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Charts & Insights Below Table */}


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

