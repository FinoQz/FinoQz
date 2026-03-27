'use client';

import React, { useState } from 'react';
import {
  FileText, FileJson, Brain, PlusCircle, Edit2, Loader2, FileUp, FileSpreadsheet, Trash2, UploadCloud
} from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin'; // <-- apne axios instance ka sahi path lagayein

type Question = {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

const isValidObjectId = (id?: string) => /^[a-fA-F0-9]{24}$/.test(id || '');

const TABS = [
  { key: 'manual', label: 'Manual Setup', icon: <PlusCircle className="w-5 h-5" /> },
  { key: 'upload', label: 'Upload File', icon: <FileUp className="w-5 h-5" /> },
  { key: 'ai', label: 'Finoqz.AI', icon: <Brain className="w-5 h-5" /> },
];


interface UploadImportProps {
  quizId: string;
  numberOfQuestions?: string;
  onCacheQuestions?: (questions: Question[]) => void;
}

export default function UploadImport({ quizId, numberOfQuestions, onCacheQuestions }: UploadImportProps) {
  const [tab, setTab] = useState('manual');

  return (
    <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition border
              ${tab === t.key
                ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]'
                : 'bg-white text-[var(--theme-primary)] border-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10'
              }`}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 border w-full">
        {tab === 'manual' && (
          <ManualQuizSetup
            quizId={quizId}
            numberOfQuestions={numberOfQuestions}
            onCacheQuestions={onCacheQuestions}
          />
        )}
        {tab === 'upload' && (
          <UploadQuizFile
            quizId={quizId}
            numberOfQuestions={numberOfQuestions}
            onCacheQuestions={onCacheQuestions}
          />
        )}
        {tab === 'ai' && <AIQuizGenerator quizId={quizId} onCacheQuestions={onCacheQuestions} />}
      </div>
    </div>
  );
}

// 1. Manual Quiz Setup
function ManualQuizSetup({
  quizId,
  numberOfQuestions,
  onCacheQuestions
}: {
  quizId: string;
  numberOfQuestions?: string;
  onCacheQuestions?: (questions: Question[]) => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([
    { text: '', options: ['', '', '', ''], correct: 0, explanation: '' }
  ]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState('');

  // Add or update question
  const handleSaveQuestion = (idx: number, q: Question) => {
    setQuestions(prev => prev.map((item, i) => (i === idx ? q : item)));
    setEditingIdx(null);
  };

  // Add new question
  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { text: '', options: ['', '', '', ''], correct: 0, explanation: '' }
    ]);
    setEditingIdx(questions.length);
  };

  // Remove question
  const handleRemoveQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

  // Edit question
  const handleEditQuestion = (idx: number) => setEditingIdx(idx);


  // Backend se save
  const handleSaveQuiz = async () => {
    const totalQ = parseInt(numberOfQuestions || '0', 10);
    if (totalQ > 0 && questions.length < totalQ) {
      setPopupMsg(`You have added only ${questions.length} out of ${totalQ} questions. Please add all questions before saving.`);
      setShowPopup(true);
      return;
    }
    if (!isValidObjectId(quizId)) {
      onCacheQuestions?.(questions);
      setPopupMsg('Questions saved locally. They will be imported after the quiz is created.');
      setShowPopup(true);
      return;
    }
    setSaving(true);
    try {
      await apiAdmin.post('/api/upload/manual', {
        quizId,
        questions,
      });
      alert('Quiz questions saved!');
    } catch {
      alert('Failed to save quiz');
    }
    setSaving(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manual Quiz Setup</h2>
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={idx} className="border rounded-xl p-4 bg-gray-50 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
              <span className="font-semibold text-[var(--theme-primary)]">Question {idx + 1}</span>
              <div className="flex gap-2">
                <button
                  className="text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 p-1 rounded"
                  onClick={() => handleEditQuestion(idx)}
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  className="text-red-500 hover:bg-red-100 p-1 rounded"
                  onClick={() => handleRemoveQuestion(idx)}
                  title="Delete"
                  disabled={questions.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {editingIdx === idx ? (
              <ManualQuestionEditor
                question={q}
                onSave={(q: Question) => handleSaveQuestion(idx, q)}
                onCancel={() => setEditingIdx(null)}
              />
            ) : (
              <div>
                <div className="mb-2">
                  <span className="font-medium">Q:</span> {q.text || <span className="italic text-gray-400">[No question]</span>}
                </div>
                <ul className="mb-2">
                  {q.options.map((opt, i) => (
                    <li key={i} className={`flex items-center gap-2 ${q.correct === i ? 'font-semibold text-green-700' : ''}`}>
                      <span className={`inline-block w-6 h-6 rounded-full text-center border ${q.correct === i ? 'bg-green-100 border-green-400' : 'bg-gray-100 border-gray-300'}`}>{String.fromCharCode(65 + i)}</span>
                      {opt || <span className="italic text-gray-400">[No option]</span>}
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Explanation:</span> {q.explanation || <span className="italic text-gray-400">[No explanation]</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          className="bg-[var(--theme-primary)] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 justify-center"
          onClick={handleAddQuestion}
          disabled={numberOfQuestions ? questions.length >= parseInt(numberOfQuestions, 10) : false}
        >
          <PlusCircle className="w-4 h-4" /> Add Question
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
          onClick={handleSaveQuiz}
          disabled={saving}
        >
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : `Save Quiz${numberOfQuestions ? ` (${questions.length}/${numberOfQuestions})` : ''}`}
        </button>
      </div>

      {/* Popup for incomplete questions */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
            <div className="mb-4 text-red-600 font-semibold">Incomplete Questions</div>
            <div className="mb-6">{popupMsg}</div>
            <button
              className="bg-[var(--theme-primary)] text-white px-4 py-2 rounded-lg font-semibold"
              onClick={() => setShowPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type ManualQuestionEditorProps = {
  question: Question;
  onSave: (q: Question) => void;
  onCancel: () => void;
};

function ManualQuestionEditor({ question, onSave, onCancel }: ManualQuestionEditorProps) {
  const [q, setQ] = useState<Question>({ ...question });

  return (
    <div className="space-y-2">
      <input
        className="w-full border rounded px-2 py-1"
        value={q.text}
        onChange={e => setQ({ ...q, text: e.target.value })}
        placeholder="Enter question"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {q.options.map((opt: string, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              checked={q.correct === i}
              onChange={() => setQ({ ...q, correct: i })}
              className="accent-[var(--theme-primary)]"
            />
            <input
              className="w-full border rounded px-2 py-1"
              value={opt}
              onChange={e => {
                const options = [...q.options];
                options[i] = e.target.value;
                setQ({ ...q, options });
              }}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
            />
          </div>
        ))}
      </div>
      <input
        className="w-full border rounded px-2 py-1"
        value={q.explanation}
        onChange={e => setQ({ ...q, explanation: e.target.value })}
        placeholder="Explanation (optional)"
      />
      <div className="flex gap-2 mt-2 flex-col sm:flex-row">
        <button
          className="bg-[var(--theme-primary)] text-white px-3 py-1 rounded"
          onClick={() => onSave(q)}
        >
          Save
        </button>
        <button
          className="bg-gray-200 text-gray-700 px-3 py-1 rounded"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// 2. Upload File (PDF/JSON/CSV/XLSX)
function UploadQuizFile({
  quizId,
  numberOfQuestions,
  onCacheQuestions
}: {
  quizId: string;
  numberOfQuestions?: string;
  onCacheQuestions?: (questions: Question[]) => void;
}) {
  const [fileType, setFileType] = useState('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [importing, setImporting] = useState(false);

  const pickRandom = (items: Question[], limit?: string) => {
    const n = parseInt(limit || '0', 10);
    if (!n || n <= 0 || items.length <= n) return items;

    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, n);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  // Backend se parse
  const handleParse = async () => {
    setLoading(true);
    try {
      let res;

      if (fileType === 'pdf') {
        const formData = new FormData();
        formData.append('pdf', file!);
        res = await apiAdmin.post('/api/upload/pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (fileType === 'json') {
        const text = await file!.text();
        const json = JSON.parse(text);
        res = await apiAdmin.post('/api/upload/json', { questions: json.questions || json });
      } else if (fileType === 'csv' || fileType === 'xlsx') {
        const formData = new FormData();
        formData.append('file', file!);
        res = await apiAdmin.post('/api/upload/excel', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        alert('Only PDF/JSON/CSV/XLSX supported for now.');
        setLoading(false);
        return;
      }

      const payload = res.data?.data || res.data?.questions || res.data;
      const list = Array.isArray(payload) ? payload : [];
      const selected = pickRandom(list, numberOfQuestions);
      setQuestions(selected);
      if (!isValidObjectId(quizId)) {
        onCacheQuestions?.(selected);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to parse file');
    }
    setLoading(false);
  };

  // Backend pe import
  const handleImport = async () => {
    if (!questions.length) return alert('No questions to import.');
    if (!isValidObjectId(quizId)) {
      onCacheQuestions?.(questions);
      alert('Questions saved locally. They will be imported after the quiz is created.');
      return;
    }

    setImporting(true);
    try {
      await apiAdmin.post('/api/upload/manual', { quizId, questions });
      alert('Questions imported!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to import questions';
      console.error(err);
      alert(msg);
    }
    setImporting(false);
  };

  // For editing extracted questions
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  // Save edited question
  const handleSaveQuestion = (idx: number, q: Question) => {
    setQuestions(prev => {
      const updated = prev.map((item, i) => (i === idx ? q : item));
      if (!isValidObjectId(quizId)) {
        onCacheQuestions?.(updated);
      }
      return updated;
    });
    setEditingIdx(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Upload Quiz File</h2>
      <div className="flex flex-wrap gap-3 mb-4">
        {['pdf', 'csv', 'json', 'xlsx'].map(type => (
          <button
            key={type}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition
              ${fileType === type
                ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]'
                : 'bg-white text-[var(--theme-primary)] border-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10'
              }`}
            onClick={() => setFileType(type)}
          >
            {type === 'pdf' && <FileText className="w-4 h-4" />}
            {type === 'csv' && <FileSpreadsheet className="w-4 h-4" />}
            {type === 'json' && <FileJson className="w-4 h-4" />}
            {type === 'xlsx' && <FileSpreadsheet className="w-4 h-4" />}
            {type.toUpperCase()}
          </button>
        ))}
      </div>
      {/* Custom Upload Box */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--theme-primary)] rounded-xl px-4 py-6 sm:px-6 sm:py-8 cursor-pointer bg-[#f5f8ff] hover:bg-[#e9f0ff] transition mb-4 w-full">
        <UploadCloud className="w-10 h-10 text-[var(--theme-primary)] mb-2" />
        <span className="font-semibold text-[var(--theme-primary)] mb-1 text-center break-all">
          {file ? file.name : `Click to upload ${fileType.toUpperCase()} file`}
        </span>
        <span className="text-xs text-gray-500 mb-2 text-center">
          Supported: {fileType.toUpperCase()}
        </span>
        <input
          type="file"
          accept={fileType === 'pdf' ? '.pdf' : fileType === 'csv' ? '.csv' : fileType === 'json' ? '.json' : '.xlsx'}
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      <button
        className="bg-[var(--theme-primary)] text-white px-4 py-2 rounded-lg font-semibold w-full sm:w-auto"
        onClick={handleParse}
        disabled={!file || loading}
      >
        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Parse & Generate'}
      </button>
      {questions.length > 0 && (
        <div className="space-y-6 mt-6">
          <h3 className="font-semibold mb-2">Extracted Questions</h3>
          {questions.map((q, idx) => (
            <div key={idx} className="border rounded-xl p-4 bg-gray-50 relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                <span className="font-semibold text-[var(--theme-primary)]">Question {idx + 1}</span>
                <button
                  className="text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 p-1 rounded"
                  onClick={() => setEditingIdx(idx)}
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              {editingIdx === idx ? (
                <ManualQuestionEditor
                  question={q}
                  onSave={q => handleSaveQuestion(idx, q)}
                  onCancel={() => setEditingIdx(null)}
                />
              ) : (
                <div>
                  <div className="mb-2">
                    <span className="font-medium">Q:</span> {q.text}
                  </div>
                  <ul className="mb-2">
                    {q.options.map((opt: string, i: number) => (
                      <li key={i} className={`flex items-center gap-2 ${q.correct === i ? 'font-semibold text-green-700' : ''}`}>
                        <span className={`inline-block w-6 h-6 rounded-full text-center border ${q.correct === i ? 'bg-green-100 border-green-400' : 'bg-gray-100 border-gray-300'}`}>{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Explanation:</span> {q.explanation}
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleImport}
            disabled={importing}
            title={!isValidObjectId(quizId) ? 'Will save locally until the quiz is created.' : undefined}
          >
            {importing ? <Loader2 className="animate-spin w-5 h-5" /> : 'Import to Quiz'}
          </button>
          {!isValidObjectId(quizId) && (
            <p className="text-xs text-amber-600 mt-2">
              Questions will be cached and imported after quiz creation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// 3. Generate with Finoqz.AI
function AIQuizGenerator({
  quizId,
  onCacheQuestions
}: {
  quizId: string;
  onCacheQuestions?: (questions: Question[]) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  // Backend se generate
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const pdfText = '';
      if (file) {
        // 1. PDF ko backend pe bhejo, text extract karo
        const formData = new FormData();
        formData.append('pdf', file);
        // Optionally, extract text and use in prompt
        // For now, skip and just use prompt
      }
      // 2. Ab Gemini ko prompt + PDF text bhejo
      const res = await apiAdmin.post('/api/quizzes/admin/generate-questions', {
        prompt: `${prompt}\n\nPDF Content:\n${pdfText}`,
        numQuestions: 10, // ya jitne user ne set kiye hain
        topic: '',
      });
      console.log('Excel res.data:', res.data);

      const payload = res.data?.data || res.data?.questions || res.data;
      setQuestions(Array.isArray(payload) ? payload : []);
    } catch (err: unknown) {
      console.error(err);
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { error?: { status?: string } } } }).response === 'object' &&
        (err as { response?: { data?: { error?: { status?: string } } } }).response?.data?.error?.status === 'UNAVAILABLE'
      ) {
        alert('Gemini AI model is overloaded. Please try again after some time.');
      } else {
        alert('AI generation failed');
      }
    }
    setLoading(false);
  };

  // Backend pe import
  const handleImport = async () => {
    if (!questions.length) return alert('No questions to import.');
    if (!isValidObjectId(quizId)) {
      onCacheQuestions?.(questions);
      alert('Questions saved locally. They will be imported after the quiz is created.');
      return;
    }

    setImporting(true);
    try {
      await apiAdmin.post('/api/upload/manual', { quizId, questions });
      alert('AI Quiz imported!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to import questions';
      console.error(err);
      alert(msg);
    }
    setImporting(false);
  };

  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  // Save edited question
  const handleSaveQuestion = (idx: number, q: Question) => {
    setQuestions(prev => prev.map((item, i) => (i === idx ? q : item)));
    setEditingIdx(null);
  };

  // For editing generated questions

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Generate Quiz with Finoqz.AI</h2>
      {/* Custom Upload Box */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--theme-primary)] rounded-xl px-4 py-6 sm:px-6 sm:py-8 cursor-pointer bg-[#f5f8ff] hover:bg-[#e9f0ff] transition mb-4 w-full">
        <UploadCloud className="w-10 h-10 text-[var(--theme-primary)] mb-2" />
        <span className="font-semibold text-[var(--theme-primary)] mb-1 text-center break-all">
          {file ? file.name : 'Click to upload PDF file'}
        </span>
        <span className="text-xs text-gray-500 mb-2 text-center">
          Supported: PDF
        </span>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      <textarea
        className="w-full border rounded-lg px-3 py-2 mb-4"
        rows={2}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Enter prompt for AI (e.g. 'Generate MCQs on chapter 2')"
      />
      <button
        className="bg-[var(--theme-primary)] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 w-full sm:w-auto justify-center"
        onClick={handleGenerate}
        disabled={!file || !prompt || loading}
      >
        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Brain className="w-5 h-5" />}
        Generate Quiz
      </button>
      {questions.length > 0 && (
        <div className="space-y-6 mt-6">
          <h3 className="font-semibold mb-2">Generated Questions</h3>
          {questions.map((q, idx) => (
            <div key={idx} className="border rounded-xl p-4 bg-gray-50 relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                <span className="font-semibold text-[var(--theme-primary)]">Question {idx + 1}</span>
                <button
                  className="text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 p-1 rounded"
                  onClick={() => setEditingIdx(idx)}
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              {editingIdx === idx ? (
                <ManualQuestionEditor
                  question={q}
                  onSave={q => handleSaveQuestion(idx, q)}
                  onCancel={() => setEditingIdx(null)}
                />
              ) : (
                <div>
                  <div className="mb-2">
                    <span className="font-medium">Q:</span> {q.text}
                  </div>
                  <ul className="mb-2">
                    {q.options.map((opt: string, i: number) => (
                      <li key={i} className={`flex items-center gap-2 ${q.correct === i ? 'font-semibold text-green-700' : ''}`}>
                        <span className={`inline-block w-6 h-6 rounded-full text-center border ${q.correct === i ? 'bg-green-100 border-green-400' : 'bg-gray-100 border-gray-300'}`}>{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Explanation:</span> {q.explanation}
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold w-full sm:w-auto"
            onClick={handleImport}
            disabled={importing}
            title={!isValidObjectId(quizId) ? 'Will save locally until the quiz is created.' : undefined}
          >
            {importing ? <Loader2 className="animate-spin w-5 h-5" /> : 'Import to Quiz'}
          </button>
          {!isValidObjectId(quizId) && (
            <p className="text-xs text-amber-600 mt-2">
              Questions will be cached and imported after quiz creation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}



// Parent component me <ManualQuizSetup quizId={quizId} />, <UploadQuizFile quizId={quizId} />, <AIQuizGenerator quizId={quizId} /> pass karo.