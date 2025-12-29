'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface QuizQuestionFormProps {
  categoryId: string;
}

interface Question {
  _id?: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export default function QuizQuestionForm({ categoryId }: QuizQuestionFormProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState<string[]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [categoryId]);

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/admin/demo-quiz/questions?categoryId=${categoryId}`);
      setQuestions(res.data || []);
    } catch (err) {
      console.error('Failed to load questions', err);
    }
  };

  const addQuestion = async () => {
    if (
      !newQuestion.trim() ||
      newOptions.some((opt) => !opt.trim()) ||
      correctIndex === null
    )
      return;

    const payload = {
      categoryId,
      question: newQuestion.trim(),
      options: newOptions.map((opt) => opt.trim()),
      correctIndex,
    };

    try {
      const res = await api.post('/admin/demo-quiz/questions', payload);
      setQuestions((prev) => [...prev, res.data]);
      setNewQuestion('');
      setNewOptions(['', '', '', '']);
      setCorrectIndex(null);
    } catch (err) {
      console.error('Failed to add question', err);
    }
  };

  const removeQuestion = async (_id?: string) => {
    if (!_id) return;
    try {
      await api.delete(`/admin/demo-quiz/questions/${_id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== _id));
    } catch (err) {
      console.error('Failed to delete question', err);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#253A7B]">
        Add Questions to: <span className="text-gray-800">{categoryId}</span>
      </h3>

      {/* New Question Form */}
      <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
        <input
          type="text"
          placeholder="Enter question"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />

        {newOptions.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
              className="accent-[#253A7B]"
            />
            <input
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const updated = [...newOptions];
                updated[i] = e.target.value;
                setNewOptions(updated);
              }}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        ))}

        <button
          onClick={addQuestion}
          disabled={loading}
          className="mt-2 bg-[#253A7B] text-white px-4 py-2 rounded hover:bg-[#1a2a5e] transition text-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          {loading ? 'Saving...' : 'Add Question'}
        </button>
      </div>

      {/* Existing Questions */}
      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q._id || i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800 mb-2">
                    {i + 1}. {q.question}
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {q.options.map((opt, j) => (
                      <li
                        key={j}
                        className={
                          q.correctIndex === j ? 'text-[#253A7B] font-semibold' : ''
                        }
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => removeQuestion(q._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
