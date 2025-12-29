'use client';

import { useState } from 'react';
import { Plus, Trash2, RotateCcw, Undo2, Save } from 'lucide-react';

interface Reason {
  id: string;
  title: string;
  description: string;
  bullets: string[];
}

const defaultReasons: Reason[] = [
  {
    id: 'why-1',
    title: 'Interactive Quizzes',
    description:
      'Engage with carefully crafted quizzes on Balance Sheets, Cash Flow, P&L Statements, and more.',
    bullets: ['Real-time feedback', 'Hint system', 'Review mode'],
  },
  {
    id: 'why-2',
    title: 'Earn Certificates',
    description:
      'Get certified in various finance topics and boost your career credentials.',
    bullets: ['Professional certificates', 'Shareable credentials', 'Instant downloads'],
  },
  {
    id: 'why-3',
    title: 'Community Learning',
    description:
      'Connect with fellow learners, share insights, and grow together.',
    bullets: ['Discussion forums', 'Expert insights', 'Peer support'],
  },
  {
    id: 'why-4',
    title: 'Track Your Performance',
    description:
      'Get detailed analytics and insights to improve your learning outcomes and stay motivated.',
    bullets: ['Progress dashboard', 'Topic-wise analytics', 'Personalized tips'],
  },
];

export default function WhyChooseEditor() {
  const [reasons, setReasons] = useState<Reason[]>(defaultReasons);
  const [initialReasons, setInitialReasons] = useState<Reason[]>(defaultReasons);
  const [undoStack, setUndoStack] = useState<Reason[] | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  const addReason = () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    setUndoStack(reasons);
    const newReason: Reason = {
      id: `why-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      bullets: [],
    };
    setReasons((prev) => [...prev, newReason]);
    setNewTitle('');
    setNewDescription('');
    setDirty(true);
  };

  const removeReason = (id: string) => {
    setUndoStack(reasons);
    setReasons((prev) => prev.filter((r) => r.id !== id));
    setDirty(true);
  };

  const updateReason = (
    id: string,
    field: keyof Reason,
    value: string[] | string
  ) => {
    setUndoStack(reasons);
    setReasons((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
    setDirty(true);
  };

  const handleUndo = () => {
    if (undoStack) {
      setReasons(undoStack);
      setUndoStack(null);
      setDirty(true);
    }
  };

  const handleReset = () => {
    setReasons(initialReasons);
    setUndoStack(null);
    setDirty(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('payload', JSON.stringify({ reasons }));

      const res = await fetch('http://localhost:5000/api/admin/landing', {
        method: 'PATCH',
        body: formData,
      });

      const result = await res.json();
      if (!result.ok) {
        alert('Failed to save reasons');
      } else {
        alert('Saved successfully!');
        setInitialReasons(reasons);
        setUndoStack(null);
        setDirty(false);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Why Choose FinoQz</h2>
        <div className="flex gap-2">
          <button
            onClick={handleUndo}
            disabled={!undoStack}
            className="text-sm px-3 py-2 border rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40"
          >
            <Undo2 className="w-4 h-4 inline mr-1" />
            Undo
          </button>
          <button
            onClick={handleReset}
            disabled={!dirty}
            className="text-sm px-3 py-2 border rounded text-gray-700 hover:bg-gray-100 disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4 inline mr-1" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || loading}
            className="bg-[#253A7B] text-white px-4 py-2 rounded hover:bg-[#1a2a5e] transition text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4 inline mr-1" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Add New Reason */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Title (e.g. Learn from Experts)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
        />
        <textarea
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
        />
        <button
          onClick={addReason}
          className="bg-[#253A7B] text-white px-4 py-2 rounded hover:bg-[#1a2a5e] transition text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Reason
        </button>
      </div>

      {/* Reason Cards */}
      <ul className="space-y-4">
        {reasons.map((reason) => (
          <li
            key={reason.id}
            className="border border-gray-100 bg-gray-50 p-4 rounded space-y-4"
          >
            <div className="flex justify-between items-start gap-2">
              <input
                type="text"
                value={reason.title}
                onChange={(e) => updateReason(reason.id, 'title', e.target.value)}
                className="text-base font-semibold text-gray-800 bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none flex-1"
              />
              <button
                onClick={() => removeReason(reason.id)}
                className="text-red-500 hover:text-red-700"
                title="Delete reason"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={reason.description}
              onChange={(e) => updateReason(reason.id, 'description', e.target.value)}
              className="w-full text-sm text-gray-700 bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none"
            />

            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {reason.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => {
                      const updated = [...reason.bullets];
                      updated[idx] = e.target.value;
                      updateReason(reason.id, 'bullets', updated);
                    }}
                    className="flex-1 bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const updated = reason.bullets.filter((_, i) => i !== idx);
                      updateReason(reason.id, 'bullets', updated);
                    }}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <BulletInput
              onAdd={(text) => {
                const updated = [...reason.bullets, text];
                updateReason(reason.id, 'bullets', updated);
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function BulletInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const value = text.trim();
    if (!value) return;
    onAdd(value);
    setText('');
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add bullet"
        className="flex-1 bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none"
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="text-xs text-blue-600 hover:text-blue-800"
      >
        Add
      </button>
    </div>
  );
}