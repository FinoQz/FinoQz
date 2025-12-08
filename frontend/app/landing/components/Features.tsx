// "use client";

// import { BookOpen, Award, Users, BarChart3, Check } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";

// export default function AboutSection() {
//   return (
//     <section
//       id="about"
//       className="py-20 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden"
//     >
//       <div className="relative z-10 container mx-auto px-6">
//         {/* Section Header */}
//         <div className="text-center mb-12">
//           <h2 className="text-4xl font-bold text-[#253A7B] mb-4">Why Choose FinoQz?</h2>
//           <p className="text-xl text-gray-600">
//             Transform your finance knowledge with our proven learning system
//           </p>
//         </div>

//         {/* Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//           {/* Card 1: Interactive Quizzes */}
//           <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
//             <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-white opacity-0 group-hover:opacity-40 blur-xl transition duration-500" />
//             <CardContent className="relative z-10 p-6 space-y-4">
//               <div className="bg-blue-100 p-4 rounded-lg w-fit group-hover:scale-105 transition-transform duration-300">
//                 <BookOpen className="h-8 w-8 text-[#253A7B]" />
//               </div>
//               <h3 className="text-xl font-semibold text-[#253A7B]">Interactive Quizzes</h3>
//               <p className="text-gray-600">
//                 Engage with carefully crafted quizzes on Balance Sheets, Cash Flow, P&L Statements, and more.
//               </p>
//               <ul className="space-y-2">
//                 {["Real-time feedback", "Hint system", "Review mode"].map((item, i) => (
//                   <li key={i} className="flex items-center gap-2">
//                     <Check className="h-4 w-4 text-green-600" />
//                     <span className="text-sm">{item}</span>
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//           </Card>

//           {/* Card 2: Earn Certificates */}
//           <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
//             <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-white opacity-0 group-hover:opacity-40 blur-xl transition duration-500" />
//             <CardContent className="relative z-10 p-6 space-y-4">
//               <div className="bg-purple-100 p-4 rounded-lg w-fit group-hover:scale-105 transition-transform duration-300">
//                 <Award className="h-8 w-8 text-[#253A7B]" />
//               </div>
//               <h3 className="text-xl font-semibold text-[#253A7B]">Earn Certificates</h3>
//               <p className="text-gray-600">
//                 Get certified in various finance topics and boost your career credentials.
//               </p>
//               <ul className="space-y-2">
//                 {["Professional certificates", "Shareable credentials", "Instant downloads"].map((item, i) => (
//                   <li key={i} className="flex items-center gap-2">
//                     <Check className="h-4 w-4 text-green-600" />
//                     <span className="text-sm">{item}</span>
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//           </Card>

//           {/* Card 3: Community Learning */}
//           <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
//             <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-100 to-white opacity-0 group-hover:opacity-40 blur-xl transition duration-500" />
//             <CardContent className="relative z-10 p-6 space-y-4">
//               <div className="bg-green-100 p-4 rounded-lg w-fit group-hover:scale-105 transition-transform duration-300">
//                 <Users className="h-8 w-8 text-[#253A7B]" />
//               </div>
//               <h3 className="text-xl font-semibold text-[#253A7B]">Community Learning</h3>
//               <p className="text-gray-600">
//                 Connect with fellow learners, share insights, and grow together.
//               </p>
//               <ul className="space-y-2">
//                 {["Discussion forums", "Expert insights", "Peer support"].map((item, i) => (
//                   <li key={i} className="flex items-center gap-2">
//                     <Check className="h-4 w-4 text-green-600" />
//                     <span className="text-sm">{item}</span>
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//           </Card>

//           {/* Card 4: Track Your Performance */}
//           <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
//             <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-blue-100 to-white opacity-0 group-hover:opacity-40 blur-xl transition duration-500" />
//             <CardContent className="relative z-10 p-6 space-y-4">
//               <div className="bg-yellow-100 p-4 rounded-lg w-fit group-hover:scale-105 transition-transform duration-300">
//                 <BarChart3 className="h-8 w-8 text-[#253A7B]" />
//               </div>
//               <h3 className="text-xl font-semibold text-[#253A7B]">Track Your Performance</h3>
//               <p className="text-gray-600">
//                 Get detailed analytics and insights to improve your learning outcomes and stay motivated.
//               </p>
//               <ul className="space-y-2">
//                 {["Progress dashboard", "Topic-wise analytics", "Personalized tips"].map((item, i) => (
//                   <li key={i} className="flex items-center gap-2">
//                     <Check className="h-4 w-4 text-green-600" />
//                     <span className="text-sm">{item}</span>
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </section>
//   );
// }
'use client';

import React, { useEffect, useState } from 'react';
import { Check, BookOpen, Award, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';

type WhyCard = {
  id?: string;
  title?: string;
  description?: string;
};

type RemoteWhyCard = {
  id?: string;
  title?: string;
  heading?: string;
  description?: string;
  text?: string;
};

const fallbackCards: WhyCard[] = [
  {
    id: 'why-1',
    title: 'Interactive Quizzes',
    description:
      'Engage with carefully crafted quizzes on Balance Sheets, Cash Flow, P&L Statements, and more.',
  },
  {
    id: 'why-2',
    title: 'Earn Certificates',
    description:
      'Get certified in various finance topics and boost your career credentials.',
  },
  {
    id: 'why-3',
    title: 'Community Learning',
    description:
      'Connect with fellow learners, share insights, and grow together.',
  },
  {
    id: 'why-4',
    title: 'Track Your Performance',
    description:
      'Get detailed analytics and insights to improve your learning outcomes and stay motivated.',
  },
];

export default function AboutSection() {
  const [cards, setCards] = useState<WhyCard[]>(fallbackCards);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchWhyCards = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/landing');
        if (!mounted) return;
        const data = res.data || {};
        const remote: RemoteWhyCard[] = Array.isArray(data.whyCards) ? (data.whyCards as RemoteWhyCard[]) : [];
        if (remote.length > 0) {
          // normalize to expected shape
          const mapped = remote.map((r: RemoteWhyCard, idx: number) => ({
            id: r.id || `why-${idx}`,
            title: r.title || r.heading || `Card ${idx + 1}`,
            description: r.description || r.text || '',
          }));
          setCards(mapped);
        } else {
          setCards(fallbackCards);
        }
      } catch (err) {
        console.error('Failed to fetch Why Choose cards, using fallback', err);
        setCards(fallbackCards);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWhyCards();
    return () => {
      mounted = false;
    };
  }, []);

  const icons = [BookOpen, Award, Users, BarChart3];

  return (
    <section
      id="about"
      className="py-20 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden"
    >
      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#253A7B] mb-4">Why Choose FinoQz?</h2>
          <p className="text-xl text-gray-600">
            Transform your finance knowledge with our proven learning system
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading
            ? // simple loading placeholders
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md p-6 animate-pulse h-56"
                />
              ))
            : cards.map((card, i) => {
                const Icon = icons[i % icons.length];
                const features =
                  card.title && card.title.toLowerCase().includes('quiz')
                    ? ['Real-time feedback', 'Hint system', 'Review mode']
                    : card.title && card.title.toLowerCase().includes('certificate')
                    ? ['Professional certificates', 'Shareable credentials', 'Instant downloads']
                    : card.title && card.title.toLowerCase().includes('community')
                    ? ['Discussion forums', 'Expert insights', 'Peer support']
                    : ['Progress dashboard', 'Topic-wise analytics', 'Personalized tips'];

                return (
                  <Card
                    key={card.id || i}
                    className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 opacity-0 group-hover:opacity-40 blur-xl transition duration-500" />
                    <CardContent className="relative z-10 p-6 space-y-4">
                      <div className="bg-white/80 p-4 rounded-lg w-fit group-hover:scale-105 transition-transform duration-300">
                        <Icon className="h-8 w-8 text-[#253A7B]" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#253A7B]">
                        {card.title}
                      </h3>
                      <p className="text-gray-600">{card.description}</p>
                      <ul className="space-y-2">
                        {features.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      </div>
    </section>
  );
}