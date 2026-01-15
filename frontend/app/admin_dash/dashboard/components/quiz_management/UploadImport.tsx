'use client';

import React, { useState } from 'react';
import { Upload, FileText, FileJson, Download, Check, X, Edit2, AlertCircle, Loader2 } from 'lucide-react';

interface ExtractedQuestion {
  id: string;
  type: 'mcq' | 'true-false' | 'short-answer';
  text: string;
  options?: string[];
  correct?: number | string;
  marks: number;
  confidence: 'high' | 'medium' | 'low';
  status: 'pending' | 'accepted' | 'rejected';
}

interface UploadImportProps {
  onQuestionsImported?: (questions: ExtractedQuestion[]) => void;
}

export default function UploadImport({ onQuestionsImported }: UploadImportProps) {
  const [uploadType, setUploadType] = useState<'csv-json' | 'pdf'>('pdf');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<'idle' | 'parsing' | 'ready' | 'failed'>('idle');
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Dummy extracted questions for demo
  const dummyQuestions: ExtractedQuestion[] = [
    {
      id: '1',
      type: 'mcq',
      text: 'What is the primary purpose of diversification in investment?',
      options: ['To maximize returns', 'To reduce risk', 'To increase liquidity', 'To avoid taxes'],
      correct: 1,
      marks: 1,
      confidence: 'high',
      status: 'pending'
    },
    {
      id: '2',
      type: 'mcq',
      text: 'Which financial ratio measures a company\'s ability to pay short-term obligations?',
      options: ['Debt-to-equity', 'Current ratio', 'ROE', 'P/E ratio'],
      correct: 1,
      marks: 1,
      confidence: 'high',
      status: 'pending'
    },
    {
      id: '3',
      type: 'true-false',
      text: 'Compound interest is calculated only on the principal amount.',
      options: ['True', 'False'],
      correct: 1,
      marks: 1,
      confidence: 'medium',
      status: 'pending'
    }
  ];

  const handleFileUpload = (file: File) => {
    if (file.type === 'application/pdf') {
      setPdfFile(file);
      setParseStatus('idle');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleGenerateJSON = async () => {
    if (!pdfFile) return;

    setIsParsing(true);
    setParseStatus('parsing');

    // Simulate PDF parsing with delay
    setTimeout(() => {
      setExtractedQuestions(dummyQuestions);
      setParseStatus('ready');
      setIsParsing(false);
    }, 3000);
  };

  const handleAccept = (id: string) => {
    setExtractedQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, status: 'accepted' as const } : q)
    );
  };

  const handleReject = (id: string) => {
    setExtractedQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, status: 'rejected' as const } : q)
    );
  };

  const handleAcceptAll = () => {
    setExtractedQuestions(prev =>
      prev.map(q => ({ ...q, status: 'accepted' as const }))
    );
  };

  const handleRejectAll = () => {
    setExtractedQuestions(prev =>
      prev.map(q => ({ ...q, status: 'rejected' as const }))
    );
  };

  const handleImportToQuiz = () => {
    const accepted = extractedQuestions.filter(q => q.status === 'accepted');
    onQuestionsImported?.(accepted);
    alert(`${accepted.length} questions imported successfully!`);
  };

  const handleDownloadJSON = () => {
    const jsonData = {
      quizTitle: 'Sample Quiz',
      category: 'Personal Finance',
      questions: extractedQuestions.filter(q => q.status === 'accepted')
    };
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-questions.json';
    a.click();
  };

  const acceptedCount = extractedQuestions.filter(q => q.status === 'accepted').length;
  const lowConfidenceCount = extractedQuestions.filter(q => q.confidence === 'low').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload & Import Questions</h2>
        <p className="text-sm text-gray-600">Upload question files or convert PDF to structured questions</p>
      </div>

      {/* Upload Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CSV/JSON Upload */}
        <div className={`p-5 rounded-xl border-2 cursor-pointer transition ${
          uploadType === 'csv-json' ? 'border-[#253A7B] bg-[#253A7B] bg-opacity-5' : 'border-gray-200 hover:border-gray-300'
        }`}
          onClick={() => setUploadType('csv-json')}
        >
          <FileJson className="w-10 h-10 text-[#253A7B] mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Upload CSV / JSON</h3>
          <p className="text-sm text-gray-600 mb-3">Upload pre-formatted question files</p>
          <a href="#" className="text-xs text-[#253A7B] hover:underline">Download template</a>
        </div>

        {/* PDF Upload */}
        <div className={`p-5 rounded-xl border-2 cursor-pointer transition ${
          uploadType === 'pdf' ? 'border-[#253A7B] bg-[#253A7B] bg-opacity-5' : 'border-gray-200 hover:border-gray-300'
        }`}
          onClick={() => setUploadType('pdf')}
        >
          <FileText className="w-10 h-10 text-[#253A7B] mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Upload PDF</h3>
          <p className="text-sm text-gray-600">Convert question paper to JSON using AI</p>
        </div>
      </div>

      {/* PDF Upload Area */}
      {uploadType === 'pdf' && (
        <div className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
              isDragging ? 'border-[#253A7B] bg-[#253A7B] bg-opacity-5' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-1">Drag & drop your PDF here</p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] cursor-pointer transition">
              <Upload className="w-4 h-4" />
              Browse Files
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-4">Max 10MB, up to 200 pages</p>
          </div>

          {/* File Metadata */}
          {pdfFile && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="w-10 h-10 text-[#253A7B] mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">{pdfFile.name}</h4>
                    <p className="text-sm text-gray-600">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span>📄 Estimated: 15-25 pages</span>
                      <span>🌐 Language: English</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setPdfFile(null)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Generate JSON Button */}
              {parseStatus === 'idle' && (
                <button
                  onClick={handleGenerateJSON}
                  className="w-full mt-4 px-4 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium flex items-center justify-center gap-2"
                >
                  <FileJson className="w-5 h-5" />
                  Generate JSON
                </button>
              )}

              {/* Parsing Status */}
              {parseStatus === 'parsing' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Parsing PDF...</p>
                      <p className="text-xs text-blue-700">This may take up to 30s depending on file size</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Parse Complete */}
              {parseStatus === 'ready' && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        PDF parsed — {extractedQuestions.length} questions detected
                      </p>
                      <p className="text-xs text-green-700">Review and edit questions below</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Extracted Questions Preview */}
          {parseStatus === 'ready' && (
            <div className="space-y-4">
              {/* Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900">{acceptedCount} Accepted</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{extractedQuestions.length} Total</span>
                  {lowConfidenceCount > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-orange-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {lowConfidenceCount} Need Review
                      </span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAcceptAll}
                    className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={handleDownloadJSON}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download JSON
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {extractedQuestions.map((question) => (
                  <div
                    key={question.id}
                    className={`p-4 rounded-xl border-2 transition ${
                      question.status === 'accepted'
                        ? 'border-green-300 bg-green-50'
                        : question.status === 'rejected'
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            question.type === 'mcq' ? 'bg-blue-100 text-blue-700' :
                            question.type === 'true-false' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {question.type.toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            question.confidence === 'high' ? 'bg-green-100 text-green-700' :
                            question.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {question.confidence} confidence
                          </span>
                          <span className="text-xs text-gray-600">{question.marks} mark(s)</span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium mb-2">{question.text}</p>
                        {question.options && (
                          <div className="space-y-1">
                            {question.options.map((option, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                <span className={`${idx === question.correct ? 'text-green-600 font-medium' : ''}`}>
                                  {String.fromCharCode(65 + idx)}. {option}
                                  {idx === question.correct && ' ✓'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {question.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAccept(question.id)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                              title="Accept"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(question.id)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(question.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {question.status === 'accepted' && (
                          <span className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium">
                            Accepted
                          </span>
                        )}
                        {question.status === 'rejected' && (
                          <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Import Button */}
              {acceptedCount > 0 && (
                <button
                  onClick={handleImportToQuiz}
                  className="w-full px-4 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Import {acceptedCount} Question{acceptedCount > 1 ? 's' : ''} to Quiz
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
