// 'use client';

// import React, { useEffect, useState, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import api from '@/lib/api';

// type Question = {
//   question: string;
//   options: string[];
//   // optional: if your backend provides the correct answer index include it to show correct/wrong feedback
//   correctIndex?: number;
// };

// type Quiz = {
//   id?: string;
//   title?: string;
//   questions: Question[];
// };
// export default function TryQuiz() {
//   const router = useRouter();

//   const [loading, setLoading] = useState(true);
//   const [topics, setTopics] = useState<string[]>([]);
//   const [selectedTopic, setSelectedTopic] = useState<string>('');
//   const [quiz, setQuiz] = useState<Quiz | null>(null);
//   const [quizLoading, setQuizLoading] = useState(false);
//   const [quizError, setQuizError] = useState<string | null>(null);

//   const [currentQ, setCurrentQ] = useState(0);
//   const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
//   const [answeredCount, setAnsweredCount] = useState(0);
//   const [score, setScore] = useState(0);
//   const [showResults, setShowResults] = useState(false);

//   const autoNextTimeout = useRef<number | null>(null);

//   // Fetch categories (landing content) to build topic tabs
//   useEffect(() => {
//     let mounted = true;
//     const fetchLanding = async () => {
//       try {
//         setLoading(true);
//         const res = await api.get('/admin/landing');
//         if (!mounted) return;
//         const data = res.data || {};
//         const cats = Array.isArray(data.categories)
//           ? data.categories.map((c: { title?: string; name?: string }) => c.title || c.name).filter(Boolean)
//           : [];
//         const t = cats.length > 0 ? cats : [];
//         setTopics(t);
//         setSelectedTopic(t[0] || '');
//       } catch (err) {
//         console.error('Failed to fetch landing content for TryQuiz', err);
//         if (mounted) {
//           setTopics([]); // will show friendly message / empty state
//           setSelectedTopic('');
//         }
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     fetchLanding();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // Whenever topic changes, fetch quiz for that topic
//   useEffect(() => {
//     if (!selectedTopic) {
//       setQuiz(null);
//       setQuizError(null);
//       return;
//     }

//     let mounted = true;
//     const fetchQuizForTopic = async (topic: string) => {
//       try {
//         setQuizLoading(true);
//         setQuizError(null);
//         setQuiz(null);
//         setCurrentQ(0);
//         setSelectedAnswer(null);
//         setAnsweredCount(0);
//         setScore(0);
//         setShowResults(false);

//         // <-- Adjust this endpoint to match your backend.
//         // Example endpoint: /admin/quizzes?category=Balance%20Sheet
//         const res = await api.get(`/admin/quizzes?category=${encodeURIComponent(topic)}`);

//         if (!mounted) return;

//         // Expect res.data to contain { id, title, questions: [{question, options, correctIndex?}, ...] }
//         const data = res.data;
//         if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
//           setQuizError('No quiz available for this topic.');
//           setQuiz(null);
//         } else {
//           setQuiz({
//             id: data.id,
//             title: data.title || topic,
//             questions: data.questions,
//           });
//         }
//       } catch (err: unknown) {
//         console.error('Failed to fetch quiz for topic', selectedTopic, err);
//         // handle 404 or backend absence gracefully
//         const status =
//           typeof err === 'object' &&
//           err !== null &&
//           'response' in err &&
//           typeof (err as { response?: { status?: number } }).response?.status === 'number'
//             ? (err as { response?: { status?: number } }).response!.status
//             : undefined;
//         const message =
//           status === 404
//             ? 'No quiz found for this topic.'
//             : 'Unable to load quiz. Please try another topic or try again later.';
//         setQuizError(message);
//         setQuiz(null);
//       } finally {
//         if (mounted) setQuizLoading(false);
//       }
//     };

//     fetchQuizForTopic(selectedTopic);

//     return () => {
//       mounted = false;
//       if (autoNextTimeout.current) {
//         window.clearTimeout(autoNextTimeout.current);
//       }
//     };
//   }, [selectedTopic]);

//   const totalQuestions = quiz?.questions.length || 0;

//   // When user selects an option
//   const handleSelect = (idx: number) => {
//     if (selectedAnswer !== null) return; // prevent re-select
//     setSelectedAnswer(idx);
//     setAnsweredCount((c) => c + 1);

//     // if correctIndex is provided, calculate score
//     const currentQuestion = quiz?.questions[currentQ];
//     if (currentQuestion && typeof currentQuestion.correctIndex === 'number') {
//       if (idx === currentQuestion.correctIndex) {
//         setScore((s) => s + 1);
//       }
//     }

//     // auto-advance after short delay (if not last question)
//     if (currentQ + 1 < totalQuestions) {
//       autoNextTimeout.current = window.setTimeout(() => {
//         setSelectedAnswer(null);
//         setCurrentQ((c) => c + 1);
//       }, 900);
//     } else {
//       // last question -> show results after short delay
//       autoNextTimeout.current = window.setTimeout(() => {
//         setShowResults(true);
//       }, 900);
//     }
//   };

//   const handleNext = () => {
//     if (currentQ + 1 < totalQuestions) {
//       setSelectedAnswer(null);
//       setCurrentQ((c) => c + 1);
//     } else {
//       setShowResults(true);
//     }
//   };

//   const handleRestart = () => {
//     setCurrentQ(0);
//     setSelectedAnswer(null);
//     setAnsweredCount(0);
//     setScore(0);
//     setShowResults(false);
//   };

//   const gotoLogin = () => {
//     router.push('/landing/auth/user_login/login');
//   };

//   // Basic skeleton while landing content loads
//   if (loading) {
//     return (
//       <section id="TryQuiz" className="py-20 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
//         <div className="container mx-auto px-6 text-center">
//           <h2 className="text-3xl font-semibold text-[#253A7B] mb-2">Try a Finance Quiz</h2>
//           <p className="text-gray-600">Preparing topics…</p>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section id="TryQuiz" className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
//       <div className="container mx-auto px-6">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <h2 className="text-4xl md:text-5xl font-extrabold text-[#253A7B] mb-3">Try a Finance Quiz</h2>
//           <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
//             Test yourself with short topic-based quizzes — no login required. Select a topic to begin.
//           </p>
//         </div>

//         {/* Topics */}
//         <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
//           {topics && topics.length > 0 ? (
//             topics.map((topic) => (
//               <button
//                 key={topic}
//                 onClick={() => setSelectedTopic(topic)}
//                 className={`px-5 py-2 rounded-full text-sm md:text-base font-medium transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300
//                   ${
//                     selectedTopic === topic
//                       ? 'bg-[#253A7B] text-white shadow-lg'
//                       : 'bg-white text-[#253A7B] border border-blue-100 hover:shadow'
//                   }`}
//                 aria-pressed={selectedTopic === topic}
//               >
//                 {topic}
//               </button>
//             ))
//           ) : (
//             <p className="text-gray-600">No topics available right now. Please check back later.</p>
//           )}
//         </div>

//         {/* Quiz Card */}
//         <div className="max-w-3xl mx-auto">
//           <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
//             {/* Card header: quiz title + progress */}
//             <div className="px-6 py-4 border-b border-blue-50 flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">
//                   Topic
//                 </p>
//                 <h3 className="text-lg font-semibold text-[#253A7B]">
//                   {selectedTopic || '—'}
//                 </h3>
//               </div>
//               <div className="text-right">
//                 <p className="text-sm text-gray-500">Progress</p>
//                 <p className="text-sm font-medium text-[#253A7B]">
//                   {totalQuestions === 0 ? '0/0' : `${currentQ + 1}/${totalQuestions}`}
//                 </p>
//               </div>
//             </div>

//             {/* Progress bar */}
//             <div className="px-6 pt-4">
//               <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-gradient-to-r from-[#253A7B] to-blue-500 transition-all"
//                   style={{ width: `${totalQuestions ? ((currentQ / totalQuestions) * 100).toFixed(2) : 0}%` }}
//                 />
//               </div>
//             </div>

//             <div className="p-6">
//               {/* Loading / Error states when fetching quiz */}
//               {quizLoading && (
//                 <div className="text-center py-12">
//                   <div className="inline-block w-48 h-2 bg-blue-100 rounded-full animate-pulse" />
//                   <p className="mt-4 text-gray-600">Loading quiz…</p>
//                 </div>
//               )}

//               {!selectedTopic && (
//                 <div className="text-center py-10">
//                   <p className="text-gray-600">Choose a topic above to load a quiz.</p>
//                 </div>
//               )}

//               {!quizLoading && quizError && (
//                 <div className="text-center py-10">
//                   <p className="text-gray-600 mb-4">{quizError}</p>
//                   <p className="text-sm text-gray-500">
//                     If you did like quizzes for this topic, please add them in the admin panel.
//                   </p>
//                 </div>
//               )}

//               {!quizLoading && quiz && !showResults && (
//                 <>
//                   {/* Question */}
//                   <div>
//                     <p className="text-sm text-gray-500 mb-2">Question</p>
//                     <h4 className="text-xl md:text-2xl font-semibold text-[#253A7B] leading-snug">
//                       {quiz.questions[currentQ].question}
//                     </h4>
//                   </div>

//                   {/* Options */}
//                   <ul className="mt-6 space-y-4">
//                     {quiz.questions[currentQ].options.map((opt, idx) => {
//                       const isSelected = selectedAnswer === idx;
//                       const correctIdx = quiz.questions[currentQ].correctIndex;
//                       const showCorrect =
//                         typeof correctIdx === 'number' && selectedAnswer !== null;
//                       const isCorrect = typeof correctIdx === 'number' && idx === correctIdx;
//                       const btnBg = isSelected
//                         ? showCorrect
//                           ? isCorrect
//                             ? 'bg-green-100'
//                             : 'bg-red-100'
//                           : 'bg-blue-50'
//                         : 'bg-white';

//                       return (
//                         <li key={idx}>
//                           <button
//                             onClick={() => handleSelect(idx)}
//                             disabled={selectedAnswer !== null}
//                             className={`w-full text-left px-5 py-4 rounded-xl border flex items-center justify-between transition ${
//                               isSelected ? 'ring-2 ring-offset-1 ring-blue-200' : 'hover:shadow'
//                             } ${btnBg} border-blue-100`}
//                             aria-pressed={isSelected}
//                             aria-label={`Option ${idx + 1}: ${opt}`}
//                           >
//                             <div className="flex items-center gap-4">
//                               <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-[#253A7B] font-semibold">
//                                 {String.fromCharCode(65 + idx)}
//                               </div>
//                               <span className="text-[#253A7B] font-medium">{opt}</span>
//                             </div>

//                             {/* feedback icon / label */}
//                             <div className="text-sm">
//                               {selectedAnswer !== null && typeof correctIdx === 'number' ? (
//                                 isCorrect ? (
//                                   <span className="text-green-600 font-semibold">Correct</span>
//                                 ) : isSelected ? (
//                                   <span className="text-red-600 font-semibold">Incorrect</span>
//                                 ) : (
//                                   <span className="text-gray-400"> </span>
//                                 )
//                               ) : null}
//                             </div>
//                           </button>
//                         </li>
//                       );
//                     })}
//                   </ul>

//                   {/* Footer actions */}
//                   <div className="mt-8 flex items-center justify-between">
//                     <div className="text-sm text-gray-600">
//                       Answered: {answeredCount}
//                       {typeof quiz.questions[currentQ].correctIndex === 'number' && (
//                         <> · Score: {score}/{totalQuestions}</>
//                       )}
//                     </div>

//                     <div className="flex items-center gap-3">
//                       <button
//                         className="text-sm text-gray-500 hover:underline"
//                         onClick={() => {
//                           // reveal answer functionality: select the correct option if available
//                           const correct = quiz.questions[currentQ].correctIndex;
//                           if (typeof correct === 'number') {
//                             setSelectedAnswer(correct);
//                             setAnsweredCount((c) => c + (selectedAnswer === null ? 1 : 0));
//                             // update score if not already counted
//                             if (selectedAnswer === null) {
//                               setScore((s) => s + 1);
//                             }
//                             // auto-next
//                             if (currentQ + 1 < totalQuestions) {
//                               autoNextTimeout.current = window.setTimeout(() => {
//                                 setSelectedAnswer(null);
//                                 setCurrentQ((c) => c + 1);
//                               }, 900);
//                             } else {
//                               autoNextTimeout.current = window.setTimeout(() => {
//                                 setShowResults(true);
//                               }, 900);
//                             }
//                           }
//                         }}
//                       >
//                         Reveal
//                       </button>

//                       <button
//                         onClick={handleNext}
//                         className="bg-[#253A7B] text-white px-5 py-2 rounded-full hover:bg-blue-700 transition disabled:opacity-60"
//                         disabled={selectedAnswer === null && totalQuestions > 0} // prevent skipping without answering
//                       >
//                         {currentQ + 1 < totalQuestions ? 'Next' : 'Finish'}
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               )}

//               {/* Results */}
//               {!quizLoading && quiz && showResults && (
//                 <div className="text-center py-10">
//                   <h3 className="text-3xl font-bold text-[#253A7B] mb-2">Quiz Complete</h3>
//                   {typeof quiz.questions[0]?.correctIndex === 'number' ? (
//                     <p className="text-lg text-gray-700 mb-4">
//                       You scored <span className="font-semibold text-[#253A7B]">{score}</span> out of{' '}
//                       <span className="font-semibold text-[#253A7B]">{totalQuestions}</span>
//                     </p>
//                   ) : (
//                     <p className="text-lg text-gray-700 mb-4">
//                       You have completed the quiz. Create an account to track results and progress.
//                     </p>
//                   )}

//                   <div className="flex items-center justify-center gap-4 mt-6">
//                     <button
//                       onClick={handleRestart}
//                       className="px-5 py-2 rounded-full border border-blue-200 bg-white text-[#253A7B] hover:shadow"
//                     >
//                       Retry
//                     </button>
//                     <button
//                       onClick={gotoLogin}
//                       className="px-6 py-2 rounded-full bg-[#253A7B] text-white hover:bg-blue-700"
//                     >
//                       Login / Signup
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* If no quiz available and not loading, suggest action */}
//           {!quizLoading && !quiz && selectedTopic && quizError && (
//             <div className="mt-6 text-center text-sm text-gray-600">
//               <p>{quizError}</p>
//               <p className="mt-2">
//                 Want more quizzes? Add them in admin or contact the team.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

type Question = {
  _id?: string;
  question: string;
  options: string[];
  correctIndex?: number;
};

type Category = {
  _id: string;
  name: string;
};

const LOGIN_AFTER = 5;

export default function TryQuiz() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    api.get('/admin/demo-quiz/public/categories')
      .then(res => {
        setCategories(res.data || []);
        setSelectedCategoryId(res.data?.[0]?._id || '');
      })
      .catch(err => console.error('Failed to load categories', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;
    setQuestions([]);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setShowLoginPrompt(false);

    api.get(`/admin/demo-quiz/public/quiz?categoryId=${selectedCategoryId}`)
      .then(res => setQuestions(res.data?.questions || []))
      .catch(err => console.error('Failed to load quiz', err));
  }, [selectedCategoryId]);

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);

    const correct = questions[currentQ]?.correctIndex;
    if (index === correct) setScore(s => s + 1);

    if (currentQ + 1 === LOGIN_AFTER) {
      timeoutRef.current = window.setTimeout(() => setShowLoginPrompt(true), 800);
    } else if (currentQ + 1 < questions.length) {
      timeoutRef.current = window.setTimeout(() => {
        setSelectedAnswer(null);
        setCurrentQ(q => q + 1);
      }, 900);
    } else {
      timeoutRef.current = window.setTimeout(() => setShowResults(true), 900);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setCurrentQ(q => q + 1);
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setShowLoginPrompt(false);
  };

  const gotoLogin = () => router.push('/landing/auth/user_login/login');

  if (loading) return <div className="text-center py-20">Loading quiz...</div>;

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-3xl mx-auto px-4 space-y-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#253A7B]"> Try a Finance Quiz</h2>
          <p className="text-gray-600 mt-2">Select a category and test your knowledge - no login required</p>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategoryId(cat._id)}
              className={`px-4 py-2 rounded border text-sm ${
                selectedCategoryId === cat._id
                  ? 'bg-[#253A7B] text-white border-[#253A7B]'
                  : 'border-gray-300 text-gray-700 hover:border-[#253A7B]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Quiz Box */}
        {questions.length > 0 && !showResults && !showLoginPrompt && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#253A7B]">
                Question {currentQ + 1} of {questions.length}
              </h3>
              <span className="text-sm text-gray-500">{score} correct</span>
            </div>

            <p className="text-gray-800 font-medium">{questions[currentQ].question}</p>

            <div className="space-y-2">
              {questions[currentQ].options.map((opt, i) => {
                const isCorrect = i === questions[currentQ].correctIndex;
                const isSelected = i === selectedAnswer;
                const show = selectedAnswer !== null;

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={show}
                    className={`w-full text-left px-4 py-2 rounded border transition ${
                      show
                        ? isCorrect
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : isSelected
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300'
                        : 'border-gray-300 hover:border-[#253A7B]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && currentQ + 1 < questions.length && (
              <button
                onClick={handleNext}
                className="mt-4 bg-[#253A7B] text-white px-4 py-2 rounded hover:bg-[#1a2a5e] text-sm"
              >
                Next
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="bg-white rounded-xl shadow p-6 text-center space-y-4">
            <h3 className="text-xl font-semibold text-[#253A7B]">Quiz Complete!</h3>
            <p className="text-gray-700">Your score: {score} / {questions.length}</p>
            <button
              onClick={handleRestart}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 text-sm"
            >
              Restart
            </button>
          </div>
        )}

        {/* Login Prompt */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
              <h4 className="text-lg font-semibold text-[#253A7B]">Continue to full quiz</h4>
              <p className="text-gray-700">
                You’ve reached {LOGIN_AFTER} questions. Login to continue and save your progress.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={gotoLogin}
                  className="bg-[#253A7B] text-white px-4 py-2 rounded hover:bg-[#1a2a5e] text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 text-sm"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
