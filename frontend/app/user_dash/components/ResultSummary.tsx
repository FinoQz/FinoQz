'use client';

import React from 'react';
import { Trophy, Clock, Target, TrendingUp, Award, Download, RotateCcw, Share2, CheckCircle, XCircle } from 'lucide-react';

interface QuizResultData {
  attemptId: string;
  quizTitle: string;
  totalScore: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number; // in seconds
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  passed: boolean;
  passPercentage: number;
  attemptNumber: number;
  submittedAt: string;
}

interface ResultSummaryProps {
  result: QuizResultData;
  onRetake?: () => void;
  onDownloadCertificate?: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
  allowRetake?: boolean;
  certificateEligible?: boolean;
}

export default function ResultSummary({
  result,
  onRetake,
  onDownloadCertificate,
  onShare,
  onViewDetails,
  allowRetake = true,
  certificateEligible = false
}: ResultSummaryProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const gradeInfo = getGrade(result.percentage);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Card */}
      <div className={`rounded-2xl p-8 text-center ${
        result.passed ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'
      }`}>
        <div className="flex justify-center mb-4">
          {result.passed ? (
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-green-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <Target className="w-12 h-12 text-orange-600" />
            </div>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          {result.passed ? 'Congratulations!' : 'Keep Trying!'}
        </h1>
        <p className="text-white text-lg opacity-90">
          {result.passed 
            ? 'You have successfully completed the quiz!' 
            : `You need ${result.passPercentage}% to pass. You scored ${result.percentage.toFixed(1)}%`
          }
        </p>
      </div>

      {/* Score Card */}
      <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">Your Score</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-5xl font-bold text-[#253A7B]">
              {result.totalScore}/{result.totalMarks}
            </div>
            <div className={`text-4xl font-bold ${gradeInfo.color} ${gradeInfo.bg} px-4 py-2 rounded-lg`}>
              {gradeInfo.grade}
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {result.percentage.toFixed(1)}%
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
            <p className="text-sm text-gray-600">Correct</p>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{result.incorrectAnswers}</p>
            <p className="text-sm text-gray-600">Incorrect</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{formatTime(result.timeTaken)}</p>
            <p className="text-sm text-gray-600">Time Taken</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{result.totalQuestions}</p>
            <p className="text-sm text-gray-600">Total Questions</p>
          </div>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Quiz Title:</span>
            <span className="font-semibold text-gray-900">{result.quizTitle}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Attempt Number:</span>
            <span className="font-semibold text-gray-900">#{result.attemptNumber}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Submitted At:</span>
            <span className="font-semibold text-gray-900">{formatDate(result.submittedAt)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Status:</span>
            <span className={`font-semibold ${result.passed ? 'text-green-600' : 'text-orange-600'}`}>
              {result.passed ? 'Passed' : 'Not Passed'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="px-6 py-3 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              View Details
            </button>
          )}

          {certificateEligible && result.passed && onDownloadCertificate && (
            <button
              onClick={onDownloadCertificate}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Certificate
            </button>
          )}

          {allowRetake && onRetake && (
            <button
              onClick={onRetake}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Quiz
            </button>
          )}

          {onShare && (
            <button
              onClick={onShare}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Result
            </button>
          )}
        </div>
      </div>

      {/* Motivational Message */}
      {result.passed ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <Award className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-green-900 mb-2">Excellent Performance!</h3>
          <p className="text-green-700">
            Youve demonstrated great understanding of the subject. Keep up the fantastic work!
          </p>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
          <Target className="w-12 h-12 text-orange-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-orange-900 mb-2">Room for Improvement</h3>
          <p className="text-orange-700">
            Dont be discouraged! Review the material and try again. Youre on the path to success!
          </p>
        </div>
      )}
    </div>
  );
}
