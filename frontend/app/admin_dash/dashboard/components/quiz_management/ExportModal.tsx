'use client';

import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, CheckSquare } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import {
  exportParticipantsToExcel, exportParticipantsToPDF,
  exportLeaderboardToExcel, exportLeaderboardToPDF,
  ParticipantExportRow, LeaderboardExportRow
} from '@/utils/exportUtils';

interface ExportModalProps {
  quizId: string;
  quizTitle?: string;
  pricingType?: 'free' | 'paid';
  onClose: () => void;
}

type ExportFormat = 'xlsx' | 'pdf';
type ExportType = 'participants' | 'leaderboard';

export default function ExportModal({ quizId, quizTitle = 'Quiz', pricingType = 'free', onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [exportType, setExportType] = useState<ExportType>('participants');
  const [includeIncomplete, setIncludeIncomplete] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fmtDT = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fmtTime = (secs: number | null) => {
    if (secs === null || secs === undefined) return '—';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const handleExport = async () => {
    setExporting(true);
    setDone(false);
    setErrorMsg('');
    try {
      if (exportType === 'participants') {
        const params = new URLSearchParams({ quizId });
        if (!includeIncomplete) params.set('attemptStatus', 'submitted');
        const res = await apiAdmin.get(`/api/analytics/quiz-participants?${params.toString()}`);
        const participants = res.data?.participants || [];
        const rows: ParticipantExportRow[] = participants.map((p: {
          name: string; email: string; phone: string;
          enrolledAt: string | null; startedAt: string | null; submittedAt: string | null;
          timeTaken: number | null; attemptStatus: string; paymentStatus: string;
          score: number | null; totalScore: number; totalMarks: number;
          correctCount: number; incorrectCount: number; totalQuestions: number;
        }) => ({
          name: p.name || 'Unknown',
          email: p.email || 'N/A',
          phone: p.phone || 'N/A',
          enrolledAt: fmtDT(p.enrolledAt),
          startedAt: fmtDT(p.startedAt),
          submittedAt: fmtDT(p.submittedAt),
          timeTaken: fmtTime(p.timeTaken),
          attemptStatus: p.attemptStatus || '—',
          paymentStatus: pricingType === 'paid' ? (p.paymentStatus || '—') : 'N/A',
          score: p.score != null ? `${p.score}%` : '—',
          totalScore: String(p.totalScore ?? 0),
          totalMarks: String(p.totalMarks ?? 0),
          correctCount: p.correctCount ?? 0,
          incorrectCount: p.incorrectCount ?? 0,
          totalQuestions: p.totalQuestions ?? 0,
        }));
        if (format === 'xlsx') await exportParticipantsToExcel(rows, quizTitle);
        else exportParticipantsToPDF(rows, quizTitle);
      } else {
        const res = await apiAdmin.get(`/api/analytics/top-performers?quizId=${quizId}&limit=500`);
        const data = res.data || [];
        const rows: LeaderboardExportRow[] = data.map((p: {
          fullName?: string; email?: string; avgPercentage?: number;
          totalScore?: number; totalAttempts?: number; certificatesEarned?: number;
        }, i: number) => ({
          rank: i + 1,
          name: p.fullName || 'Unknown',
          email: p.email || 'N/A',
          avgPercentage: p.avgPercentage ?? 0,
          totalScore: p.totalScore ?? 0,
          totalAttempts: p.totalAttempts ?? 0,
          certificatesEarned: p.certificatesEarned ?? 0,
        }));
        if (format === 'xlsx') await exportLeaderboardToExcel(rows, quizTitle);
        else exportLeaderboardToPDF(rows, quizTitle);
      }
      setDone(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error('Export error:', err);
      setErrorMsg('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#253A7B]/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-[#253A7B]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Export Data</h2>
                <p className="text-xs text-gray-500 truncate max-w-[200px]">{quizTitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Export Type */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">What to export</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'participants' as ExportType, label: 'Participants', desc: 'All user attempt data', icon: FileSpreadsheet },
                  { value: 'leaderboard' as ExportType, label: 'Leaderboard', desc: 'Top performers ranking', icon: FileText },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setExportType(opt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${exportType === opt.value
                      ? 'border-[#253A7B] bg-[#253A7B]/5'
                      : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <opt.icon className={`w-5 h-5 mb-2 ${exportType === opt.value ? 'text-[#253A7B]' : 'text-gray-400'}`} />
                    <p className={`font-bold text-sm ${exportType === opt.value ? 'text-[#253A7B]' : 'text-gray-700'}`}>{opt.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Export Format</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'xlsx' as ExportFormat, label: 'Excel (.xlsx)', icon: '📊' },
                  { value: 'pdf' as ExportFormat, label: 'PDF', icon: '📄' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFormat(opt.value)}
                    className={`p-3 rounded-xl border-2 text-center font-semibold text-sm transition-all ${
                      format === opt.value
                        ? 'border-[#253A7B] bg-[#253A7B] text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            {exportType === 'participants' && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Options</label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={includeIncomplete}
                    onChange={e => setIncludeIncomplete(e.target.checked)}
                    className="w-4 h-4 accent-[#253A7B] cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-[#253A7B]" />
                      Include incomplete attempts
                    </p>
                    <p className="text-xs text-gray-400">Include in-progress and not-attempted rows</p>
                  </div>
                </label>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> The file will download directly to your device. Large datasets may take a few seconds.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-xs text-red-600">{errorMsg}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-sm">
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 px-4 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </>
              ) : done ? (
                <>✓ Done!</>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
