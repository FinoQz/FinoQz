'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Image as ImageIcon,
  PlusCircle as PlusIcon,
  Trash2 as TrashIcon,
  Save as SaveIcon,
  UploadCloud as UploadIcon,
  X as XIcon,
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
};

export default function LandingPageManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hero, setHero] = useState<HeroData>({
    title: '',
    subtitle: '',
    ctaText: 'Try Free Quiz',
    ctaLink: '/quiz',
    imageUrl: null,
  });
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [whyCards, setWhyCards] = useState<WhyCard[]>([]);
  const [dummyQuiz, setDummyQuiz] = useState<DummyQuiz | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/landing', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data || {};
        if (data.hero) setHero(data.hero);
        if (data.categories) setCategories(data.categories);
        if (data.whyCards) setWhyCards(data.whyCards);
        if (data.dummyQuiz) setDummyQuiz(data.dummyQuiz);
        if (data.hero?.imageUrl) setHeroPreview(data.hero.imageUrl);
      } catch (err) {
        console.error('Error loading landing content', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  // hero image preview
  useEffect(() => {
    if (!heroImageFile) return;
    const url = URL.createObjectURL(heroImageFile);
    setHeroPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [heroImageFile]);

  const handleAddCategory = () => {
    setCategories((prev) => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        title: 'New Category',
        description: '',
        bullets: [''],
      },
    ]);
  };

  const handleAddWhyCard = () => {
    setWhyCards((prev) => [
      ...prev,
      { id: `why-${Date.now()}`, title: 'New Card', description: '' },
    ]);
  };

  const handleAddQuestion = () => {
    if (!dummyQuiz) {
      setDummyQuiz({
        id: `quiz-${Date.now()}`,
        title: 'New Dummy Quiz',
        questions: [
          {
            id: `q-${Date.now()}`,
            question: 'New question?',
            options: ['A', 'B', 'C', 'D'],
            correctIndex: 0,
          },
        ],
      });
      return;
    }
    setDummyQuiz({
      ...dummyQuiz,
      questions: [
        ...dummyQuiz.questions,
        {
          id: `q-${Date.now()}`,
          question: 'New question?',
          options: ['A', 'B', 'C', 'D'],
          correctIndex: 0,
        },
      ],
    });
  };

  const handleRemoveHeroImage = () => {
    setHeroImageFile(null);
    setHeroPreview(null);
    setHero((h) => ({ ...h, imageUrl: null }));
  };

  const handleSave = async () => {
    if (!token) {
      alert('Admin token not found, please login again.');
      return;
    }

    setSaving(true);

    try {
      // If hero image is present upload via form-data
      const formData = new FormData();
      const payload = {
        hero: { ...hero, imageUrl: hero?.imageUrl ?? null },
        categories,
        whyCards,
        dummyQuiz,
      };

      formData.append('payload', JSON.stringify(payload));
      if (heroImageFile) {
        formData.append('heroImage', heroImageFile);
      }

      await api.post('/admin/landing', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Landing page content saved.');
    } catch (err) {
      console.error('Error saving landing content', err);
      alert('Error saving landing content. See console.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading landing page content...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Landing Page Manager</h2>
          <p className="text-sm text-gray-500 mt-1">Edit hero, categories, why-choose cards and the demo quiz.</p>
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
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <h3 className="font-medium text-lg mb-2">Hero Section</h3>
            <p className="text-sm text-gray-500 mb-4">This content appears in the top fold of your public landing page.</p>

            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              value={hero.title}
              onChange={(e) => setHero((h) => ({ ...h, title: e.target.value }))}
              className="mt-1 block w-full border rounded-md p-2"
            />

            <label className="block text-sm font-medium text-gray-700 mt-3">Subtitle</label>
            <textarea
              value={hero.subtitle}
              onChange={(e) => setHero((h) => ({ ...h, subtitle: e.target.value }))}
              className="mt-1 block w-full border rounded-md p-2"
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">CTA Text</label>
                <input
                  value={hero.ctaText}
                  onChange={(e) => setHero((h) => ({ ...h, ctaText: e.target.value }))}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CTA Link</label>
                <input
                  value={hero.ctaLink}
                  onChange={(e) => setHero((h) => ({ ...h, ctaLink: e.target.value }))}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
            </div>
          </div>

          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>

            <div className="border border-dashed rounded-lg p-3 bg-gray-50">
              <div className="w-full h-40 bg-white rounded-md flex items-center justify-center overflow-hidden relative">
                {heroPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={heroPreview} alt="hero preview" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs">No hero image</span>
                  </div>
                )}

                {heroPreview && (
                  <button
                    onClick={handleRemoveHeroImage}
                    className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
                    title="Remove image"
                  >
                    <XIcon className="w-4 h-4 text-gray-700" />
                  </button>
                )}
              </div>

              <label className="mt-3 block text-sm cursor-pointer">
                <div className="flex items-center gap-2 text-[#253A7B] font-medium">
                  <UploadIcon className="w-4 h-4" />
                  <span>Upload new image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (f) setHeroImageFile(f);
                  }}
                  className="hidden"
                />
              </label>

              <p className="text-xs text-gray-500 mt-2">Recommended size: 1200x700px. PNG/JPEG.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-lg">Category Cards</h3>
            <p className="text-sm text-gray-500">Manage the small cards shown in Explore Quiz Categories.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center gap-2 bg-[#253A7B] text-white px-3 py-2 rounded-lg"
            >
              <PlusIcon className="w-4 h-4" />
              Add Card
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => (
            <details key={cat.id} className="group border rounded-lg p-4 open:shadow-md">
              <summary className="cursor-pointer flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">{cat.title || 'Untitled Category'}</div>
                  <div className="text-xs text-gray-500">{cat.description ? `${cat.description.slice(0, 60)}${cat.description.length > 60 ? '...' : ''}` : 'No description'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setCategories((prev) => prev.filter((p) => p.id !== cat.id));
                    }}
                    className="text-red-600 hover:text-red-700"
                    title="Remove card"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-400 group-open:hidden">Edit</span>
                </div>
              </summary>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    value={cat.title}
                    onChange={(e) => {
                      const newT = e.target.value;
                      setCategories((prev) => prev.map((p) => (p.id === cat.id ? { ...p, title: newT } : p)));
                    }}
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    value={cat.description}
                    onChange={(e) =>
                      setCategories((prev) => prev.map((p) => (p.id === cat.id ? { ...p, description: e.target.value } : p)))
                    }
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700">Bullets</label>
                <div className="space-y-2 mt-2">
                  {cat.bullets.map((b, bi) => (
                    <div key={bi} className="flex gap-2">
                      <input
                        value={b}
                        onChange={(e) =>
                          setCategories((prev) =>
                            prev.map((p) =>
                              p.id === cat.id ? { ...p, bullets: p.bullets.map((bb, idx) => (idx === bi ? e.target.value : bb)) } : p
                            )
                          )
                        }
                        className="flex-1 border rounded p-2"
                      />
                      <button
                        onClick={() =>
                          setCategories((prev) =>
                            prev.map((p) =>
                              p.id === cat.id ? { ...p, bullets: p.bullets.filter((_, idx) => idx !== bi) } : p
                            )
                          )
                        }
                        className="px-2 text-red-600"
                      >
                        x
                      </button>
                      <button
                        onClick={() =>
                          setCategories((prev) =>
                            prev.map((p) =>
                              p.id === cat.id ? { ...p, bullets: [...p.bullets.slice(0, bi + 1), '', ...p.bullets.slice(bi + 1)] } : p
                            )
                          )
                        }
                        className="px-2 text-green-600"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Why Choose Cards */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-lg">Why Choose FinoQz</h3>
            <p className="text-sm text-gray-500">Cards that appear under Why Choose FinoQz — short and focused.</p>
          </div>
          <div>
            <button
              onClick={handleAddWhyCard}
              className="inline-flex items-center gap-2 bg-[#253A7B] text-white px-3 py-2 rounded-lg"
            >
              <PlusIcon className="w-4 h-4" />
              Add Card
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {whyCards.map((w) => (
            <div key={w.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <input
                    value={w.title}
                    onChange={(e) => setWhyCards((prev) => prev.map((p) => (p.id === w.id ? { ...p, title: e.target.value } : p)))}
                    className="block w-full font-semibold border-b pb-1 text-gray-800"
                    placeholder="Card title"
                  />
                  <textarea
                    value={w.description}
                    onChange={(e) => setWhyCards((prev) => prev.map((p) => (p.id === w.id ? { ...p, description: e.target.value } : p)))}
                    className="mt-2 w-full border rounded p-2"
                    rows={3}
                    placeholder="Short description"
                  />
                </div>
                <div className="ml-3">
                  <button
                    onClick={() => setWhyCards((prev) => prev.filter((p) => p.id !== w.id))}
                    className="text-red-600"
                    title="Remove"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dummy Quiz */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-lg">Dummy Quiz (public demo)</h3>
            <p className="text-sm text-gray-500">A small demo quiz shown on the landing page. Keep it short (3 questions recommended).</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg"
            >
              <PlusIcon className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>

        {dummyQuiz ? (
          <div className="space-y-4">
            <input
              value={dummyQuiz.title}
              onChange={(e) => setDummyQuiz({ ...dummyQuiz, title: e.target.value })}
              className="block w-full font-semibold border-b pb-1 mb-2 text-lg"
              placeholder="Quiz title"
            />
            {dummyQuiz.questions.map((q, qi) => (
              <details key={q.id} className="group border rounded-lg p-4 open:shadow-md">
                <summary className="flex items-center justify-between cursor-pointer">
                  <div className="font-medium">Q{qi + 1}: {q.question.slice(0, 60) || 'Untitled question'}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDummyQuiz({
                          ...dummyQuiz,
                          questions: dummyQuiz.questions.filter((_, idx) => idx !== qi),
                        });
                      }}
                      className="text-red-600"
                      title="Remove question"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </summary>

                <div className="mt-3 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Question</label>
                  <input
                    value={q.question}
                    onChange={(e) =>
                      setDummyQuiz({
                        ...dummyQuiz,
                        questions: dummyQuiz.questions.map((qq) => (qq.id === q.id ? { ...qq, question: e.target.value } : qq)),
                      })
                    }
                    className="w-full border rounded p-2"
                  />

                  <div>
                    <label className="text-sm font-medium text-gray-700">Options</label>
                    <div className="mt-2 space-y-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input
                            value={opt}
                            onChange={(e) =>
                              setDummyQuiz({
                                ...dummyQuiz,
                                questions: dummyQuiz.questions.map((qq) =>
                                  qq.id === q.id ? { ...qq, options: qq.options.map((o, idx) => (idx === oi ? e.target.value : o)) } : qq
                                ),
                              })
                            }
                            className="flex-1 border rounded p-2"
                          />
                          <label className="text-sm">Correct</label>
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctIndex === oi}
                            onChange={() =>
                              setDummyQuiz({
                                ...dummyQuiz,
                                questions: dummyQuiz.questions.map((qq) => (qq.id === q.id ? { ...qq, correctIndex: oi } : qq)),
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No dummy quiz configured yet.</div>
        )}
      </section>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#253A7B] hover:bg-[#1f335f] text-white px-4 py-2 rounded-lg"
        >
          <SaveIcon className="w-4 h-4" />
          <span className="text-sm">{saving ? 'Saving...' : 'Save Landing Content'}</span>
        </button>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-white border px-4 py-2 rounded-lg"
        >
          <XIcon className="w-4 h-4" />
          <span className="text-sm text-gray-700">Cancel</span>
        </button>
      </div>
    </div>
  );
}