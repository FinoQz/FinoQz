'use client';

import React, { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import {
  Image as ImageIcon,
  PlusCircle as PlusIcon,
  Trash2 as TrashIcon,
  Save as SaveIcon,
  UploadCloud as UploadIcon,
  X as XIcon,
  FileText as FileIcon,
  Shuffle as ShuffleIcon,
  Download as DownloadIcon,
} from 'lucide-react';

type HeroData = {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string | null;
};

type CategoryCard = {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  shuffle?: boolean;
  weight?: number;
};

type WhyCard = {
  id: string;
  title: string;
  description: string;
};

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
};

type DummyQuiz = {
  id: string;
  title: string;
  questions: QuizQuestion[];
  showAnswersAfterSubmit?: boolean;
};

export default function LandingPageManagerPro() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [hero, setHero] = useState<HeroData>({
    title: '',
    subtitle: '',
    ctaText: 'Try Free Quiz',
    ctaLink: '#TryQuiz',
    imageUrl: null,
  });
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [whyCards, setWhyCards] = useState<WhyCard[]>([]);
  const [dummyQuiz, setDummyQuiz] = useState<DummyQuiz | null>(null);

  // Generation UI
  const [genNumQuestions, setGenNumQuestions] = useState<number>(3);
  const [genPrompt, setGenPrompt] = useState<string>(
    'Create a short finance quiz about {topic}. Include questions and 4 options each.'
  );
  const [genLoading, setGenLoading] = useState(false);
  const [genSourcePreview, setGenSourcePreview] = useState<string | null>(null);
  const [selectedGenTopic, setSelectedGenTopic] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  // admin token (used for POST actions). GET /admin/landing is public, so we fetch without token.
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        // GET is public in the backend implementation. No Authorization required.
        const res = await api.get('/admin/landing');
        if (!mounted) return;
        const data = res.data || {};
        if (data.hero) setHero((h) => ({ ...h, ...data.hero }));
        if (Array.isArray(data.categories)) setCategories(data.categories);
        if (Array.isArray(data.whyCards)) setWhyCards(data.whyCards);
        if (data.dummyQuiz) setDummyQuiz(data.dummyQuiz);
        if (data.hero?.imageUrl) setHeroPreview(data.hero.imageUrl);
      } catch (err) {
        console.error('Error loading landing content', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!heroImageFile) return;
    const url = URL.createObjectURL(heroImageFile);
    setHeroPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [heroImageFile]);

  const ensureDummy = () => {
    if (!dummyQuiz) {
      setDummyQuiz({
        id: `dummy-${Date.now()}`,
        title: 'Demo: Basic Finance Quiz',
        questions: [],
        showAnswersAfterSubmit: true,
      });
    }
  };

  // ----- Category helpers -----
  const addCategory = () =>
    setCategories((prev) => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        title: 'New Category',
        description: '',
        bullets: [''],
        shuffle: true,
        weight: 1,
      },
    ]);

  const removeCategory = (id: string) => setCategories((prev) => prev.filter((c) => c.id !== id));

  // ----- Why cards -----
  const addWhyCard = () =>
    setWhyCards((prev) => [...prev, { id: `why-${Date.now()}`, title: 'New', description: '' }]);

  // ----- Dummy Quiz CRUD -----
  const addQuestion = (template?: Partial<QuizQuestion>) => {
    ensureDummy();
    setDummyQuiz((dq) =>
      dq
        ? {
            ...dq,
            questions: [
              ...dq.questions,
              {
                id: `q-${Date.now()}`,
                question: template?.question ?? 'New question?',
                options: template?.options ?? ['Option A', 'Option B', 'Option C', 'Option D'],
                correctIndex: typeof template?.correctIndex === 'number' ? template!.correctIndex : 0,
              },
            ],
          }
        : dq
    );
  };

  const updateQuestion = (qid: string, updater: Partial<QuizQuestion>) =>
    setDummyQuiz((dq) =>
      dq
        ? {
            ...dq,
            questions: dq.questions.map((q) => (q.id === qid ? { ...q, ...updater } : q)),
          }
        : dq
    );

  const removeQuestion = (qid: string) =>
    setDummyQuiz((dq) => (dq ? { ...dq, questions: dq.questions.filter((q) => q.id !== qid) } : dq));

  const moveQuestion = (qid: string, direction: 'up' | 'down') => {
    if (!dummyQuiz) return;
    const arr = [...dummyQuiz.questions];
    const idx = arr.findIndex((q) => q.id === qid);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= arr.length) return;
    const temp = arr[newIdx];
    arr[newIdx] = arr[idx];
    arr[idx] = temp;
    setDummyQuiz({ ...dummyQuiz, questions: arr });
  };

  // ----- Import / Export -----
  const importJSON = (json: string) => {
    try {
      const data = JSON.parse(json);
      if (!data || !Array.isArray(data.questions)) throw new Error('Invalid quiz JSON (questions array missing)');
      const normalizedQuestions = data.questions.map((q: Partial<QuizQuestion>, i: number) => ({
        id: q.id || `im-${Date.now()}-${i}`,
        question: q.question || `Question ${i + 1}`,
        options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['A', 'B', 'C', 'D'],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      }));
      setDummyQuiz({
        id: data.id || `import-${Date.now()}`,
        title: data.title || 'Imported Quiz',
        questions: normalizedQuestions,
        showAnswersAfterSubmit: !!data.showAnswersAfterSubmit,
      });
      alert('Quiz imported successfully');
    } catch (err: unknown) {
      console.error('Import error', err);
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to import JSON: ${message}`);
    }
  };

  const exportJSON = () => {
    if (!dummyQuiz) {
      alert('No dummy quiz to export');
      return;
    }
    const blob = new Blob([JSON.stringify(dummyQuiz, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dummyQuiz.title?.replace(/\s+/g, '_') || 'quiz'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ----- LLM / file generation -----
  const handleGenerateFromFile = async (file: File, topic?: string) => {
    if (!token) {
      alert('Please login to admin to generate quizzes.');
      return;
    }
    setGenLoading(true);
    setGenSourcePreview(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('prompt', genPrompt);
      fd.append('numQuestions', String(genNumQuestions));
      if (topic) fd.append('topic', topic);

      const res = await api.post('/admin/generate-quiz-from-file', fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      if (data && Array.isArray(data.questions)) {
        setDummyQuiz({
          id: data.id || `gen-${Date.now()}`,
          title: data.title || `Generated Quiz: ${topic || 'From File'}`,
          questions: data.questions.map((q: Partial<QuizQuestion>, i: number) => ({
            id: q.id || `gq-${Date.now()}-${i}`,
            question: q.question || `Q${i + 1}`,
            options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['A', 'B', 'C', 'D'],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          })),
          showAnswersAfterSubmit: true,
        });
        setGenSourcePreview(`Generated from file: ${file.name}`);
      } else {
        alert('Generation returned no questions — check backend logs or tweak prompt.');
      }
    } catch (err) {
      console.error('File generation failed', err);
      alert('Failed to generate quiz from file. Check backend or logs.');
    } finally {
      setGenLoading(false);
    }
  };

  const handleGenerateFromPrompt = async (topic?: string) => {
    if (!token) {
      alert('Please login to admin to generate quizzes.');
      return;
    }
    setGenLoading(true);
    setGenSourcePreview(null);

    try {
      const body = { prompt: genPrompt.replace('{topic}', topic || ''), numQuestions: genNumQuestions, topic };
      const res = await api.post('/admin/generate-quiz', body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      if (data && Array.isArray(data.questions)) {
        setDummyQuiz({
          id: data.id || `gen-${Date.now()}`,
          title: data.title || `Generated: ${topic || 'Prompt'}`,
          questions: data.questions.map((q: Partial<QuizQuestion>, i: number) => ({
            id: q.id || `gq-${Date.now()}-${i}`,
            question: q.question || `Q${i + 1}`,
            options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['A', 'B', 'C', 'D'],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          })),
          showAnswersAfterSubmit: true,
        });
        setGenSourcePreview(`Generated from prompt`);
      } else {
        alert('Generation returned no questions — tweak the prompt and try again.');
      }
    } catch (err) {
      console.error('Prompt generation failed', err);
      alert('Failed to generate quiz from prompt. Check backend.');
    } finally {
      setGenLoading(false);
    }
  };

  // ----- Save landing content -----
  const handleSave = async () => {
    if (!token) {
      alert('Admin token not found, please login again.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        hero: { ...hero, imageUrl: hero?.imageUrl ?? null },
        categories,
        whyCards,
        dummyQuiz,
      };

      const form = new FormData();
      form.append('payload', JSON.stringify(payload));
      if (heroImageFile) form.append('heroImage', heroImageFile);

      await api.post('/admin/landing', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      alert('Saved successfully.');
    } catch (err) {
      console.error('Save failed', err);
      alert('Save failed. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  // ----- file input handlers -----
  const onJSONFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        importJSON(text);
      } catch (err) {
        alert('Failed to read JSON file');
      }
    };
    reader.readAsText(file);
  };

  const onPDFFile = (file: File | null) => {
    if (!file) return;
    if (!confirm(`Generate quiz from ${file.name} using LLM? This may take a few seconds.`)) return;
    handleGenerateFromFile(file, selectedGenTopic || undefined);
  };

  if (loading) return <div className="p-6">Loading advanced landing manager…</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Landing Page — Pro Manager</h1>
          <p className="text-sm text-gray-500">Create a highly credible demo quiz and manage landing content.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#253A7B] hover:bg-[#1f335f] text-white px-4 py-2 rounded-lg shadow"
          >
            <SaveIcon className="w-4 h-4" />
            <span className="text-sm">{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-lg"
          >
            <XIcon className="w-4 h-4" />
            <span className="text-sm text-gray-700">Discard</span>
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-white border rounded-2xl p-6 shadow-sm grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Hero</h2>
          <input
            value={hero.title}
            onChange={(e) => setHero((h) => ({ ...h, title: e.target.value }))}
            placeholder="Hero title"
            className="w-full p-2 border rounded"
          />
          <textarea
            value={hero.subtitle}
            onChange={(e) => setHero((h) => ({ ...h, subtitle: e.target.value }))}
            placeholder="Subtitle"
            className="w-full p-2 border rounded"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={hero.ctaText}
              onChange={(e) => setHero((h) => ({ ...h, ctaText: e.target.value }))}
              className="p-2 border rounded"
            />
            <input
              value={hero.ctaLink}
              onChange={(e) => setHero((h) => ({ ...h, ctaLink: e.target.value }))}
              className="p-2 border rounded"
            />
          </div>
          <label className="text-sm text-gray-500">CTA Link can be an anchor (#TryQuiz) to smooth-scroll or a route (/quiz).</label>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Hero Image</label>
          <div className="border border-dashed rounded-lg p-3 bg-gray-50">
            <div className="w-full h-40 bg-white rounded-md flex items-center justify-center overflow-hidden relative">
              {heroPreview ? (
                <img src={heroPreview} alt="hero preview" className="object-cover w-full h-full" />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">No image</span>
                </div>
              )}
              {heroPreview && (
                <button
                  onClick={() => {
                    setHeroImageFile(null);
                    setHeroPreview(null);
                    setHero((h) => ({ ...h, imageUrl: null }));
                  }}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1"
                  title="Remove image"
                >
                  <XIcon className="w-4 h-4 text-gray-700" />
                </button>
              )}
            </div>

            <label className="mt-3 flex items-center gap-2 text-[#253A7B] cursor-pointer">
              <UploadIcon className="w-4 h-4" />
              <span className="text-sm">Upload hero image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (f) setHeroImageFile(f);
                }}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">Recommended: 1200x700px PNG/JPEG</p>
          </div>
        </div>
      </section>

      {/* CATEGORY MANAGEMENT */}
      <section className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <div className="flex items-center gap-2">
            <button onClick={addCategory} className="inline-flex items-center gap-2 bg-[#253A7B] text-white px-3 py-2 rounded-lg">
              <PlusIcon className="w-4 h-4" /> Add
            </button>
            <button onClick={() => {}} className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-lg">
              Import
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {categories.map((c) => (
            <div key={c.id} className="border rounded-lg p-4 grid md:grid-cols-8 gap-3 items-start">
              <div className="md:col-span-3">
                <input
                  className="w-full font-semibold text-lg"
                  value={c.title}
                  onChange={(e) => setCategories((prev) => prev.map((p) => (p.id === c.id ? { ...p, title: e.target.value } : p)))}
                />
                <input
                  className="w-full mt-1 text-sm text-gray-500"
                  value={c.description}
                  onChange={(e) => setCategories((prev) => prev.map((p) => (p.id === c.id ? { ...p, description: e.target.value } : p)))}
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-sm font-medium">Bullets</label>
                <div className="space-y-2 mt-2">
                  {c.bullets.map((b, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={b}
                        onChange={(e) =>
                          setCategories((prev) =>
                            prev.map((p) => (p.id === c.id ? { ...p, bullets: p.bullets.map((bb, idx) => (idx === i ? e.target.value : bb)) } : p))
                          )
                        }
                        className="flex-1 p-2 border rounded"
                      />
                      <button
                        onClick={() => setCategories((prev) => prev.map((p) => (p.id === c.id ? { ...p, bullets: p.bullets.filter((_, idx) => idx !== i) } : p)))}
                        className="text-red-600"
                      >
                        x
                      </button>
                      <button
                        onClick={() =>
                          setCategories((prev) => prev.map((p) => (p.id === c.id ? { ...p, bullets: [...p.bullets.slice(0, i + 1), '', ...p.bullets.slice(i + 1)] } : p)))
                        }
                        className="text-green-600"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col items-end gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <ShuffleIcon className="w-4 h-4" /> <span>Shuffle on landing</span>
                  <input
                    type="checkbox"
                    checked={!!c.shuffle}
                    onChange={(e) => setCategories((prev) => prev.map((p) => (p.id === c.id ? { ...p, shuffle: e.target.checked } : p)))}
                    className="ml-2"
                  />
                </label>

                <label className="text-sm">
                  Weight
                  <input
                    type="number"
                    min={0}
                    value={c.weight ?? 1}
                    onChange={(e) => setCategories((prev) => prev.map((p) => (p.id === c.id ? { ...p, weight: Number(e.target.value) } : p)))}
                    className="w-20 ml-2 p-1 border rounded"
                  />
                </label>

                <div className="flex gap-2">
                  <button onClick={() => removeCategory(c.id)} title="Remove" className="text-red-600">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Cards */}
      <section className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Why Choose FinoQz</h2>
          <button onClick={addWhyCard} className="inline-flex items-center gap-2 bg-[#253A7B] text-white px-3 py-2 rounded-lg">
            <PlusIcon className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {whyCards.map((w) => (
            <div key={w.id} className="border rounded-lg p-4">
              <input
                value={w.title}
                onChange={(e) => setWhyCards((prev) => prev.map((p) => (p.id === w.id ? { ...p, title: e.target.value } : p)))}
                className="w-full font-semibold text-lg border-b pb-1"
              />
              <textarea
                value={w.description}
                onChange={(e) => setWhyCards((prev) => prev.map((p) => (p.id === w.id ? { ...p, description: e.target.value } : p)))}
                className="w-full mt-2 p-2 border rounded"
                rows={3}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Dummy Quiz Manager (Pro) */}
      <section className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileIcon className="w-5 h-5" /> Dummy Quiz (Landing Demo)
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                ensureDummy();
                addQuestion();
              }}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg"
            >
              <PlusIcon className="w-4 h-4" /> Q
            </button>

            <label className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-lg cursor-pointer">
              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                onChange={(e) => onJSONFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <DownloadIcon className="w-4 h-4" /> Import JSON
            </label>

            <label className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-lg cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => onPDFFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <UploadIcon className="w-4 h-4" /> Generate from file
            </label>

            <button onClick={exportJSON} className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-lg">
              <DownloadIcon className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Generation / LLM controls */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm">Number of questions</label>
            <input
              type="number"
              min={1}
              max={20}
              value={genNumQuestions}
              onChange={(e) => setGenNumQuestions(Math.max(1, Number(e.target.value)))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm">Topic (optional)</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedGenTopic}
              onChange={(e) => setSelectedGenTopic(e.target.value)}
            >
              <option value="">(none)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm">Generation prompt (LLM)</label>
            <textarea
              rows={2}
              value={genPrompt}
              onChange={(e) => setGenPrompt(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleGenerateFromPrompt(selectedGenTopic || undefined)}
                disabled={genLoading}
                className="px-3 py-2 bg-[#253A7B] text-white rounded-lg"
              >
                {genLoading ? 'Generating...' : 'Generate from Prompt'}
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-white border rounded-lg">
                Upload file to generate
              </button>
              <button
                onClick={() => {
                  setGenPrompt('Create a short multiple choice quiz about {topic} with four options each and indicate the correct option.');
                  alert('Prompt reset');
                }}
                className="px-3 py-2 bg-white border rounded-lg"
              >
                Reset Prompt
              </button>
            </div>
            {genSourcePreview && <div className="text-xs text-gray-500 mt-2">Last generation: {genSourcePreview}</div>}
          </div>
        </div>

        {/* Show/Hide answers toggle */}
        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!dummyQuiz?.showAnswersAfterSubmit}
              onChange={(e) => setDummyQuiz((dq) => (dq ? { ...dq, showAnswersAfterSubmit: e.target.checked } : dq))}
            />
            <span className="text-sm">Show correct answers to users after they submit the landing demo quiz</span>
          </label>
        </div>

        {/* Questions list */}
        <div className="space-y-3">
          {!dummyQuiz && <div className="text-sm text-gray-500">No dummy quiz yet. Generate or add questions.</div>}
          {dummyQuiz &&
            dummyQuiz.questions.map((q, qi) => (
              <details key={q.id} className="group border rounded-lg p-3 open:shadow-md">
                <summary className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-medium">
                      Q{qi + 1}. {q.question.slice(0, 60) || 'Untitled question'}
                    </div>
                    <div className="text-xs text-gray-500">{q.options.map((o, i) => `${String.fromCharCode(65 + i)}: ${o}`).join(' • ')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveQuestion(q.id, 'up');
                      }}
                      title="Move up"
                      className="text-gray-600"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveQuestion(q.id, 'down');
                      }}
                      title="Move down"
                      className="text-gray-600"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeQuestion(q.id);
                      }}
                      className="text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </summary>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-8">
                    <label className="text-sm">Question text</label>
                    <textarea
                      value={q.question}
                      onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                      className="w-full p-2 border rounded"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-sm">Correct option</label>
                    <div className="flex flex-col gap-2 mt-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            value={opt}
                            onChange={(e) => updateQuestion(q.id, { options: q.options.map((oo, idx) => (idx === i ? e.target.value : oo)) })}
                            className="flex-1 p-2 border rounded"
                          />
                          <label className="text-sm">Correct</label>
                          <input type="radio" name={`correct-${q.id}`} checked={q.correctIndex === i} onChange={() => updateQuestion(q.id, { correctIndex: i })} />
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => updateQuestion(q.id, { options: [...q.options, 'New option'] })} className="px-2 py-1 bg-white border rounded">
                          + Option
                        </button>
                        <button onClick={() => updateQuestion(q.id, { options: q.options.slice(0, -1) })} className="px-2 py-1 bg-white border rounded">
                          - Option
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-[#253A7B] text-white px-4 py-2 rounded-lg">
          <SaveIcon className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Landing Content'}
        </button>
      </div>

      <div className="text-xs text-gray-500">
        Tip: To make the landing demo feel legit, keep 3 high-quality questions per topic, enable Show correct answers after submit for instant feedback, and use the LLM generator to bootstrap content from PDFs or prompts — then edit manually to ensure correctness.
      </div>
    </div>
  );

}