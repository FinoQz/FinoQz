'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Clock, Target, RotateCw, AlertCircle } from 'lucide-react';

interface BasicSettingsProps {
  quizTitle: string;
  description: string;
  duration: string;
  totalMarks: string;
  attemptLimit: 'unlimited' | '1';
  shuffleQuestions: boolean;
  negativeMarking: boolean;
  negativePerWrong: string;
  onQuizTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onTotalMarksChange: (value: string) => void;
  onAttemptLimitChange: (value: 'unlimited' | '1') => void;
  onShuffleQuestionsChange: (value: boolean) => void;
  onNegativeMarkingChange: (value: boolean) => void;
  onNegativePerWrongChange: (value: string) => void;

  // Connection props
  quizId?: string;            // if provided, component will fetch and autosave to backend
  autosave?: boolean;         // default true when quizId provided
  onSaveError?: (err: unknown) => void;
}

const durationPresets = [15, 30, 45, 60];
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function BasicSettings({
  quizTitle,
  description,
  duration,
  totalMarks,
  attemptLimit,
  shuffleQuestions,
  negativeMarking,
  negativePerWrong,
  onQuizTitleChange,
  onDescriptionChange,
  onDurationChange,
  onTotalMarksChange,
  onAttemptLimitChange,
  onShuffleQuestionsChange,
  onNegativeMarkingChange,
  onNegativePerWrongChange,
  quizId,
  autosave = true,
  onSaveError
}: BasicSettingsProps) {
  // Local state to allow editing and debounced autosave
  const [localTitle, setLocalTitle] = useState(quizTitle);
  const [localDesc, setLocalDesc] = useState(description);
  const [localDuration, setLocalDuration] = useState(duration);
  const [localTotalMarks, setLocalTotalMarks] = useState(totalMarks);
  const [localAttemptLimit, setLocalAttemptLimit] = useState(attemptLimit);
  const [localShuffle, setLocalShuffle] = useState(shuffleQuestions);
  const [localNegative, setLocalNegative] = useState(negativeMarking);
  const [localNegativePerWrong, setLocalNegativePerWrong] = useState(negativePerWrong);

  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  // Sync incoming props -> local when parent changes
  useEffect(() => setLocalTitle(quizTitle), [quizTitle]);
  useEffect(() => setLocalDesc(description), [description]);
  useEffect(() => setLocalDuration(duration), [duration]);
  useEffect(() => setLocalTotalMarks(totalMarks), [totalMarks]);
  useEffect(() => setLocalAttemptLimit(attemptLimit), [attemptLimit]);
  useEffect(() => setLocalShuffle(shuffleQuestions), [shuffleQuestions]);
  useEffect(() => setLocalNegative(negativeMarking), [negativeMarking]);
  useEffect(() => setLocalNegativePerWrong(negativePerWrong), [negativePerWrong]);

  // If quizId provided, fetch quiz data on mount
  useEffect(() => {
    if (!quizId) return;
    let mounted = true;
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${API_BASE}/api/admin/quizzes/${quizId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) {
          // don't throw to avoid breaking UI; forward to callback if needed
          console.warn('Failed fetching quiz', await res.text());
          return;
        }
        const json = await res.json();
        const q = json.data || json;
        if (!q || !mounted) return;

        // populate both local and parent via callbacks
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
      } catch (err) {
        console.error('Error fetching quiz in BasicSettings', err);
      }
    })();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  // Helper to trigger parent callbacks when local changes
  useEffect(() => { onQuizTitleChange(localTitle); scheduleSave(); }, [localTitle]);
  useEffect(() => { onDescriptionChange(localDesc); scheduleSave(); }, [localDesc]);
  useEffect(() => { onDurationChange(localDuration); scheduleSave(); }, [localDuration]);
  useEffect(() => { onTotalMarksChange(localTotalMarks); scheduleSave(); }, [localTotalMarks]);
  useEffect(() => { onAttemptLimitChange(localAttemptLimit); scheduleSave(); }, [localAttemptLimit]);
  useEffect(() => { onShuffleQuestionsChange(localShuffle); scheduleSave(); }, [localShuffle]);
  useEffect(() => { onNegativeMarkingChange(localNegative); scheduleSave(); }, [localNegative]);
  useEffect(() => { onNegativePerWrongChange(localNegativePerWrong); scheduleSave(); }, [localNegativePerWrong]);

  function scheduleSave() {
    if (!autosave || !quizId) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void saveToServer();
    }, 1000);
  }

  async function saveToServer() {
    if (!quizId) return;
    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const payload: unknown = {
        quizTitle: localTitle,
        description: localDesc,
        duration: localDuration ? Number(localDuration) : 0,
        totalMarks: localTotalMarks ? Number(localTotalMarks) : 0,
        attemptLimit: localAttemptLimit,
        shuffleQuestions: localShuffle,
        negativeMarking: localNegative,
        negativePerWrong: localNegativePerWrong ? Number(localNegativePerWrong) : 0
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
        console.warn('Autosave failed', res.status, text);
        onSaveError?.({ status: res.status, body: text });
      } else {
        const json = await res.json();
        setLastSavedAt(new Date().toISOString());
      }
    } catch (err) {
      console.error('Autosave error', err);
      onSaveError?.(err);
    } finally {
      setSaving(false);
    }
  }

  // Manual save button (useful if autosave disabled)
  const handleManualSave = async () => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    await saveToServer();
    alert('Saved');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={localDesc}
          onChange={(e) => setLocalDesc(e.target.value)}
          placeholder="Brief description of what this quiz covers..."
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{localDesc.length}/200 characters</p>
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                localDuration === preset.toString()
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
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                localAttemptLimit === '1'
                  ? 'bg-[#253A7B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              1 Attempt
            </button>
            <button
              type="button"
              onClick={() => setLocalAttemptLimit('unlimited')}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                localAttemptLimit === 'unlimited'
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