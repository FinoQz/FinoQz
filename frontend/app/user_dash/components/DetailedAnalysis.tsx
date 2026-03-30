'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

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

interface DetailedAnalysisProps {
  answers: Answer[];
  totalQuestions: number;
}

export default function DetailedAnalysis({ answers, totalQuestions }: DetailedAnalysisProps) {
  const [expandedQuestions, setExpandedQuestions] = React.useState<Set<string>>(new Set());

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categoryPerformance = () => {
    // This would be calculated based on question categories
    // For now, showing basic stats
    const correct = answers.filter(a => a.isCorrect).length;
    const incorrect = answers.filter(a => !a.isCorrect).length;
    return { correct, incorrect };
  };

  const stats = categoryPerformance();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Performance Summary */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Correct Answers</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.correct}
              <span className="text-sm text-green-700 ml-1">
                ({((stats.correct / totalQuestions) * 100).toFixed(0)}%)
              </span>
            </p>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700">Incorrect Answers</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              {stats.incorrect}
              <span className="text-sm text-red-700 ml-1">
                ({((stats.incorrect / totalQuestions) * 100).toFixed(0)}%)
              </span>
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Avg Time/Question</span>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatTime(
                Math.round(
                  answers.reduce((acc, a) => acc + a.timeSpent, 0) / answers.length
                )
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Question-wise Breakdown */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Question-wise Analysis</h2>
        
        <div className="space-y-3">
          {answers.map((answer, index) => (
            <div
              key={answer.questionId}
              className={`border-2 rounded-lg overflow-hidden transition-all ${
                answer.isCorrect
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              {/* Question Header */}
              <button
                onClick={() => toggleQuestion(answer.questionId)}
                className="w-full px-4 py-4 flex items-center justify-between hover:opacity-80 transition"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    answer.isCorrect
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 line-clamp-1">
                      {answer.questionText}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                      <span className={`flex items-center gap-1 ${
                        answer.isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {answer.isCorrect ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                      <span className="text-gray-600">
                        {answer.marksAwarded}/{answer.marksAllocated} marks
                      </span>
                      <span className="text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(answer.timeSpent)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  {expandedQuestions.has(answer.questionId) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {expandedQuestions.has(answer.questionId) && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="mt-4 space-y-3">
                    {/* Options */}
                    {answer.options.map((option, optIndex) => {
                      const isSelected = optIndex === answer.selectedAnswer;
                      const isCorrect = optIndex === answer.correctAnswer;
                      
                      let bgColor = 'bg-white';
                      let borderColor = 'border-gray-200';
                      let textColor = 'text-gray-800';
                      
                      if (isCorrect) {
                        bgColor = 'bg-green-100';
                        borderColor = 'border-green-300';
                        textColor = 'text-green-900';
                      } else if (isSelected && !isCorrect) {
                        bgColor = 'bg-red-100';
                        borderColor = 'border-red-300';
                        textColor = 'text-red-900';
                      }
                      
                      return (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isCorrect && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                              {isSelected && !isCorrect && (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`${textColor} font-medium`}>
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </p>
                              {isCorrect && (
                                <p className="text-xs text-green-700 mt-1 font-medium">
                                  ✓ Correct Answer
                                </p>
                              )}
                              {isSelected && !isCorrect && (
                                <p className="text-xs text-red-700 mt-1 font-medium">
                                  ✗ Your Answer
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Explanation */}
                    {answer.explanation && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                            <p className="text-sm text-blue-800">{answer.explanation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">Tips for Improvement</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Review the questions you got wrong and understand the correct answers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Pay attention to questions where you spent more time - they might need more practice</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Study the explanations provided to strengthen your understanding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Consider retaking the quiz after reviewing the material</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
