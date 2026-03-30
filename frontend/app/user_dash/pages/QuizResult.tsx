'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ResultSummary from '../components/ResultSummary';
import DetailedAnalysis from '../components/DetailedAnalysis';
import api from '@/lib/api';

interface Answer {
  questionId: string;
  questionText: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  marksAwarded: number;
  marksAllocated: number;
  timeSpent: number;
  options: string[];
  explanation?: string;
}

interface QuizResultData {
  attemptId: string;
  quizTitle: string;
  totalScore: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  passed: boolean;
  passPercentage: number;
  attemptNumber: number;
  submittedAt: string;
  answers: Answer[];
  allowRetake: boolean;
  certificateEligible: boolean;
  certificateId?: string;
}

export default function QuizResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams?.get('attemptId');

  const [result, setResult] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary');

  const fetchResult = React.useCallback(async () => {
    if (!attemptId) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/quiz-attempts/${attemptId}/result`);
      setResult(response.data.data);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to fetch quiz result';
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || error;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  const handleRetake = () => {
    // Navigate to quiz attempt page
    router.push(`/user_dash/pages/Quizes`);
  };

  const handleDownloadCertificate = async () => {
    if (result?.certificateId) {
      try {
        window.open(`/api/certificates/${result.certificateId}/download`, '_blank');
      } catch (err) {
        console.error('Failed to download certificate:', err);
      }
    }
  };

  const handleShare = () => {
    const shareText = `I scored ${result?.percentage.toFixed(1)}% in ${result?.quizTitle}! 🎉`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Quiz Result',
        text: shareText,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`)
        .then(() => alert('Result link copied to clipboard!'))
        .catch(err => console.error('Failed to copy:', err));
    }
  };

  const handleViewDetails = () => {
    setActiveTab('detailed');
  };

  const handleBackToDashboard = () => {
    router.push('/user_dash');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#253A7B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border-2 border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Result not found'}</p>
          <button
            onClick={handleBackToDashboard}
            className="px-6 py-3 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 mb-6 border border-gray-200 inline-flex">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'summary'
                ? 'bg-[#253A7B] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'detailed'
                ? 'bg-[#253A7B] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Detailed Analysis
          </button>
        </div>

        {/* Content */}
        {activeTab === 'summary' ? (
          <ResultSummary
            result={result}
            onRetake={result.allowRetake ? handleRetake : undefined}
            onDownloadCertificate={
              result.certificateEligible && result.passed
                ? handleDownloadCertificate
                : undefined
            }
            onShare={handleShare}
            onViewDetails={handleViewDetails}
            allowRetake={result.allowRetake}
            certificateEligible={result.certificateEligible && result.passed}
          />
        ) : (
          <DetailedAnalysis
            answers={result.answers}
            totalQuestions={result.totalQuestions}
          />
        )}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
