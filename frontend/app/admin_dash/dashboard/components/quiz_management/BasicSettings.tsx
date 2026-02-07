'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Clock, Target, RotateCw, AlertCircle, Brain, Loader2 } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface BasicSettingsProps {
  quizTitle: string;
  description: string;
  duration: string;
  totalMarks: string;
  attemptLimit: 'unlimited' | '1';
  shuffleQuestions: boolean;
  negativeMarking: boolean;
  negativePerWrong: string;
  numberOfQuestions: string; // <-- Added
  onQuizTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onTotalMarksChange: (value: string) => void;
  onAttemptLimitChange: (value: 'unlimited' | '1') => void;
  onShuffleQuestionsChange: (value: boolean) => void;
  onNegativeMarkingChange: (value: boolean) => void;
  onNegativePerWrongChange: (value: string) => void;
  onNumberOfQuestionsChange: (value: string) => void; // <-- Added

  // Connection props
  quizId?: string;
  autosave?: boolean;
  onSaveError?: (err: unknown) => void;
  getAuthToken?: () => Promise<string | null>; // <-- inject token provider
}

const durationPresets = [15, 30, 45, 60];
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function BasicSettings({
  quizTitle,
  description,
  duration,
  totalMarks,
  attemptLimit,
  shuffleQuestions,
  negativeMarking,
  negativePerWrong,
  numberOfQuestions, // <-- Added
  onQuizTitleChange,
  onDescriptionChange,
  onDurationChange,
  onTotalMarksChange,
  onAttemptLimitChange,
  onShuffleQuestionsChange,
  onNegativeMarkingChange,
  onNegativePerWrongChange,
  onNumberOfQuestionsChange, // <-- Added
  quizId,
  autosave = true,
  onSaveError,
  getAuthToken
}: BasicSettingsProps) {
  const [localTitle, setLocalTitle] = useState(quizTitle);
  const [localDesc, setLocalDesc] = useState(description);
  const [localDuration, setLocalDuration] = useState(duration);
  const [localTotalMarks, setLocalTotalMarks] = useState(totalMarks);
  const [localAttemptLimit, setLocalAttemptLimit] = useState(attemptLimit);
  const [localShuffle, setLocalShuffle] = useState(shuffleQuestions);
  const [localNegative, setLocalNegative] = useState(negativeMarking);
  const [localNegativePerWrong, setLocalNegativePerWrong] = useState(negativePerWrong);
  const [localNumberOfQuestions, setLocalNumberOfQuestions] = useState(numberOfQuestions); // <-- Added

  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  useEffect(() => setLocalTitle(quizTitle), [quizTitle]);
  useEffect(() => setLocalDesc(description), [description]);
  useEffect(() => setLocalDuration(duration), [duration]);
  useEffect(() => setLocalTotalMarks(totalMarks), [totalMarks]);
  useEffect(() => setLocalAttemptLimit(attemptLimit), [attemptLimit]);
  useEffect(() => setLocalShuffle(shuffleQuestions), [shuffleQuestions]);
  useEffect(() => setLocalNegative(negativeMarking), [negativeMarking]);
  useEffect(() => setLocalNegativePerWrong(negativePerWrong), [negativePerWrong]);
  useEffect(() => setLocalNumberOfQuestions(numberOfQuestions), [numberOfQuestions]); // <-- Added

  // Fetch quiz data on mount if quizId provided
  useEffect(() => {
    if (!quizId) return;
    let mounted = true;
    (async () => {
      try {
        const token = getAuthToken ? await getAuthToken() : null;
        const res = await fetch(`${API_BASE}/api/admin/quizzes/${quizId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) {
          console.warn('Failed fetching quiz', await res.text());
          return;
        }
        const qRes = await res.json();
        const q = qRes.data?.data || qRes.data;
        if (!q || !mounted) return;

        const incomingDuration = q.duration ? String(q.duration) : '';
        const incomingTotal = q.totalMarks ? String(q.totalMarks) : '';

        setLocalTitle(q.quizTitle || '');
        onQuizTitleChange(q.quizTitle || '');

        setLocalDesc(q.description || '');
        onDescriptionChange(q.description || '');

        setLocalDuration(incomingDuration);
        onDurationChange(incomingDuration);

        setLocalTotalMarks(incomingTotal);
        onTotalMarksChange(incomingTotal);

        setLocalAttemptLimit(q.attemptLimit || '1');
        onAttemptLimitChange(q.attemptLimit || '1');

        setLocalShuffle(!!q.shuffleQuestions);
        onShuffleQuestionsChange(!!q.shuffleQuestions);

        setLocalNegative(!!q.negativeMarking);
        onNegativeMarkingChange(!!q.negativeMarking);

        setLocalNegativePerWrong(String(q.negativePerWrong ?? ''));
        onNegativePerWrongChange(String(q.negativePerWrong ?? ''));

        setLocalNumberOfQuestions(String(q.numberOfQuestions ?? ''));
        onNumberOfQuestionsChange(String(q.numberOfQuestions ?? ''));
      } catch (err) {
        console.error('Error fetching quiz in BasicSettings', err);
      }
    })();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const saveToServer = React.useCallback(async () => {
    if (!quizId) return;
    setSaving(true);
    try {
      const token = getAuthToken ? await getAuthToken() : null;
      const payload: {
        quizTitle: string;
        description: string;
        duration: number;
        totalMarks: number;
        attemptLimit: 'unlimited' | '1';
        shuffleQuestions: boolean;
        negativeMarking: boolean;
        negativePerWrong: number;
        numberOfQuestions: number;
      } = {
        quizTitle: localTitle,
        description: localDesc,
        duration: localDuration ? Number(localDuration) : 0,
        totalMarks: localTotalMarks ? Number(localTotalMarks) : 0,
        attemptLimit: localAttemptLimit,
        shuffleQuestions: localShuffle,
        negativeMarking: localNegative,
        negativePerWrong: localNegativePerWrong ? Number(localNegativePerWrong) : 0,
        numberOfQuestions: localNumberOfQuestions ? Number(localNumberOfQuestions) : 0
      };

      const res = await fetch(`${API_BASE}/api/admin/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        onSaveError?.({ status: res.status, body: text });
      } else {
        await res.json();
        setLastSavedAt(new Date().toISOString());
      }
    } catch (err) {
      onSaveError?.(err);
    } finally {
      setSaving(false);
    }
  }, [
    quizId,
    localTitle,
    localDesc,
    localDuration,
    localTotalMarks,
    localAttemptLimit,
    localShuffle,
    localNegative,
    localNegativePerWrong,
    localNumberOfQuestions,
    onSaveError,
    getAuthToken
  ]);

  const scheduleSave = React.useCallback(() => {
    if (!autosave || !quizId) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void saveToServer();
    }, 1000);
  }, [autosave, quizId, saveToServer]);

  // Helper to trigger parent callbacks when local changes
  useEffect(() => { onQuizTitleChange(localTitle); scheduleSave(); }, [localTitle, onQuizTitleChange, scheduleSave]);
  useEffect(() => { onDescriptionChange(localDesc); scheduleSave(); }, [localDesc, onDescriptionChange, scheduleSave]);
  useEffect(() => { onDurationChange(localDuration); scheduleSave(); }, [localDuration, onDurationChange, scheduleSave]);
  useEffect(() => { onTotalMarksChange(localTotalMarks); scheduleSave(); }, [localTotalMarks, onTotalMarksChange, scheduleSave]);
  useEffect(() => { onAttemptLimitChange(localAttemptLimit); scheduleSave(); }, [localAttemptLimit, onAttemptLimitChange, scheduleSave]);
  useEffect(() => { onShuffleQuestionsChange(localShuffle); scheduleSave(); }, [localShuffle, onShuffleQuestionsChange, scheduleSave]);
  useEffect(() => { onNegativeMarkingChange(localNegative); scheduleSave(); }, [localNegative, onNegativeMarkingChange, scheduleSave]);
  useEffect(() => { onNegativePerWrongChange(localNegativePerWrong); scheduleSave(); }, [localNegativePerWrong, onNegativePerWrongChange, scheduleSave]);
  useEffect(() => { onNumberOfQuestionsChange(localNumberOfQuestions); scheduleSave(); }, [localNumberOfQuestions, onNumberOfQuestionsChange, scheduleSave]); // <-- Added

  const handleManualSave = async () => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    await saveToServer();
    alert('Saved');
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const [loadingDesc, setLoadingDesc] = useState(false);

  async function handleSuggestDescription(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    event.preventDefault();
    if (!localTitle.trim()) return;
    setLoadingDesc(true);
    try {
      const res = await apiAdmin.post('/api/quizzes/admin/generate-description', { quizTitle: localTitle });
      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.statusText || 'Failed to generate description');
      }
      const data = res.data;
      if (data?.description) {
        setLocalDesc(data.description);
      }
    } catch (err) {
      alert('Failed to generate description');
      if (onSaveError) onSaveError(err);
    } finally {
      setLoadingDesc(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Settings</h2>
          <p className="text-sm text-gray-600">Configure the core settings for your quiz</p>
        </div>

        <div className="text-right">
          {quizId ? (
            autosave ? (
              <div className="text-xs text-gray-500">
                {saving ? 'Saving...' : lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved yet'}
              </div>
            ) : (
              <button
                onClick={handleManualSave}
                className="px-3 py-1 bg-[#253A7B] text-white rounded text-sm hover:bg-[#1a2a5e] transition"
              >
                Save
              </button>
            )
          ) : (
            <div className="text-xs text-gray-400">Will save after quiz is created</div>
          )}
        </div>
      </div>

      {/* Quiz Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quiz Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder="e.g., Personal Finance Fundamentals"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <div className="relative">
          <textarea
            value={localDesc}
            onChange={e => setLocalDesc(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition pr-10"
            rows={4}
            placeholder="Enter quiz description"
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-400 hover:text-[#253A7B] transition"
            onClick={handleSuggestDescription}
            disabled={loadingDesc || !quizTitle.trim()}
            title="Suggest Description with AI"
          >
            {loadingDesc ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Brain className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">You can auto-generate a description using AI.</p>
      </div>

      {/* Number of Questions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Questions <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={localNumberOfQuestions}
          onChange={e => setLocalNumberOfQuestions(e.target.value)}
          placeholder="e.g., 20"
          min="1"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duration (minutes) <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {durationPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setLocalDuration(preset.toString())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${localDuration === preset.toString()
                ? 'bg-[#253A7B] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {preset} min
            </button>
          ))}
        </div>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="number"
            value={localDuration}
            onChange={(e) => setLocalDuration(e.target.value)}
            placeholder="Custom duration"
            min="1"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Total Marks and Attempt Limit - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Marks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Marks <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              value={localTotalMarks}
              onChange={(e) => setLocalTotalMarks(e.target.value)}
              placeholder="e.g., 100"
              min="1"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Attempt Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attempt Limit <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLocalAttemptLimit('1')}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${localAttemptLimit === '1'
                ? 'bg-[#253A7B] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
            >
              1 Attempt
            </button>
            <button
              type="button"
              onClick={() => setLocalAttemptLimit('unlimited')}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${localAttemptLimit === 'unlimited'
                ? 'bg-[#253A7B] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
            >
              Unlimited
            </button>
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        {/* Shuffle Questions */}
        <div
          onClick={() => setLocalShuffle(!localShuffle)}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition"
        >
          <div className="flex items-center gap-3">
            <RotateCw className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Shuffle Questions</h4>
              <p className="text-xs text-gray-600">Randomize question order for each attempt</p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full transition ${localShuffle ? 'bg-[#253A7B]' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${localShuffle ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </div>
        </div>

        {/* Negative Marking */}
        <div
          onClick={() => setLocalNegative(!localNegative)}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Negative Marking</h4>
              <p className="text-xs text-gray-600">Deduct marks for incorrect answers</p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full transition ${localNegative ? 'bg-[#253A7B]' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${localNegative ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </div>
        </div>

        {/* Negative Per Wrong - Show when negative marking is ON */}
        {localNegative && (
          <div className="ml-8 p-4 bg-white rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Negative Marks per Wrong Answer
            </label>
            <input
              type="number"
              value={localNegativePerWrong}
              onChange={(e) => setLocalNegativePerWrong(e.target.value)}
              placeholder="e.g., 0.25"
              step="0.25"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1">Common values: 0.25, 0.33, 0.5</p>
          </div>
        )}
      </div>

    </div>
  );
}
