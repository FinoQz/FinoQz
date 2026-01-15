'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface QuizAIFormProps {
  categoryId: string;
}

interface AIQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export default function QuizAIForm({ categoryId }: QuizAIFormProps) {
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<AIQuestion[]>([]);

  const generateQuiz = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setGenerated([]);

    try {
      const res = await api.post('api/admin/demo-quiz/ai-generate', {
        categoryId,
        prompt,
        count,
      });

      const questions: AIQuestion[] = res.data || [];
      setGenerated(questions);
    } catch (err) {
      console.error('Failed to generate quiz', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#253A7B]">Generate Quiz with AI</h3>

      <div className="space-y-3">
        <textarea
          placeholder="Enter prompt (e.g. Generate MCQs on taxation basics)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
          rows={3}
        />
        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-32 border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="No. of questions"
        />
        <button
          onClick={generateQuiz}
          disabled={loading || !prompt.trim()}
          className="bg-[#253A7B] text-white px-6 py-2 rounded hover:bg-[#1a2a5e] transition text-sm flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* Render AI Questions */}
      {generated.length > 0 && (
        <div className="space-y-4">
          {generated.map((q, i) => (
            <div key={q._id || i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="font-medium text-gray-800 mb-2">
                {i + 1}. {q.question}
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {q.options.map((opt, j) => (
                  <li
                    key={j}
                    className={q.correctIndex === j ? 'text-[#253A7B] font-semibold' : ''}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
