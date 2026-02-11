'use client';

import React from 'react';
import { X, AlertCircle, RotateCcw, Info } from 'lucide-react';

interface RetakeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quizTitle: string;
  previousScore?: number;
  totalQuestions?: number;
  attemptsUsed?: number;
  totalAttempts?: number;
}

export default function RetakeConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  quizTitle,
  previousScore,
  totalQuestions,
  attemptsUsed,
  totalAttempts,
}: RetakeConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border-2 border-gray-200">
        {/* Header */}
        <div className="p-5 border-b-2 border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-[#253A7B]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Retake Quiz</h2>
                <p className="text-xs text-gray-600">Confirm your action</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Quiz Title */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3">
            <p className="text-xs text-gray-600 mb-1">Quiz Name</p>
            <h3 className="text-sm font-bold text-gray-900">{quizTitle}</h3>
          </div>

          {/* Previous Score */}
          {previousScore !== undefined && totalQuestions && (
            <div className="bg-gradient-to-br from-blue-50 to-gray-50 border-2 border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-600 mb-2">Previous Score</p>
              <p className="text-2xl font-bold text-[#253A7B]">
                {previousScore} <span className="text-lg text-gray-400">/ {totalQuestions}</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {Math.round((previousScore / totalQuestions) * 100)}% Accuracy
              </p>
            </div>
          )}

          {/* Attempts Info */}
          {attemptsUsed !== undefined && totalAttempts && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-600 mb-2">Attempts</p>
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-gray-900">
                  {attemptsUsed} <span className="text-gray-500">of {totalAttempts}</span>
                </p>
                {attemptsUsed < totalAttempts ? (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    {totalAttempts - attemptsUsed} left
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold">
                    Last attempt
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Warning Box */}
          <div className="bg-blue-50 border-2 border-[#253A7B] rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#253A7B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#253A7B] mb-1.5">Important Information</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Your previous attempt score will be replaced</li>
                  <li>• Timer will restart from the beginning</li>
                  <li>• All questions will be shown again</li>
                  <li>• Make sure you have enough time to complete</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning if last attempt */}
          {attemptsUsed !== undefined && totalAttempts && attemptsUsed >= totalAttempts - 1 && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-1">Final Attempt</p>
                  <p className="text-xs text-gray-600">
                    This will be your last attempt. Make sure you&apos;re ready before proceeding.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t-2 border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex-1 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto flex-1 px-5 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-semibold shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Confirm Retake
          </button>
        </div>
      </div>
    </div>
  );
}
