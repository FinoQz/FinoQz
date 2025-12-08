// "use client";

// import { motion } from "framer-motion";
// import { Check } from "lucide-react";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// const categories = [
//   {
//     name: "Balance Sheet",
//     description: "Budgeting & saving essentials",
//     topics: ["Budget Planning", "Emergency Funds", "Debt Management"],
//     color: "text-blue-600 bg-blue-50",
//     iconColor: "text-blue-600",
//   },
//   {
//     name: "P&L Statement",
//     description: "Core accounting principles",
//     topics: ["Double Entry", "Trial Balance", "Journal Entries"],
//     color: "text-purple-600 bg-purple-50",
//     iconColor: "text-purple-600",
//   },
//   {
//     name: "Cash Flow Quiz",
//     description: "Stock Investing fundamentals",
//     topics: ["Equity Basics", "Market Indices", "Trading Strategies"],
//     color: "text-green-600 bg-green-50",
//     iconColor: "text-green-600",
//   },
//   {
//     name: "Generic Taxation",
//     description: "Understanding tax systems",
//     topics: ["Income Tax", "GST & VAT", "Tax Planning"],
//     color: "text-orange-600 bg-orange-50",
//     iconColor: "text-orange-600",
//   },
//   {
//     name: "Corporate Finance",
//     description: "Business-level financial strategy",
//     topics: ["Capital Budgeting", "Cost of Capital", "Financial Ratios"],
//     color: "text-pink-600 bg-pink-50",
//     iconColor: "text-pink-600",
//   },
// ];

// export default function QuizCategories() {
//   return (
//     <section
//   id="categories"
//   className="py-20 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden"
// >
//       <div className="container mx-auto px-6">
//         <div className="text-center mb-12">
//           <h2 className="text-4xl font-bold mb-4 text-[#253A7B]">Explore Quiz Categories</h2>
//           <p className="text-xl text-gray-600">
//             Master various finance topics through structured learning paths
//           </p>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
//           {categories.map((cat, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: i * 0.1 }}
//             >
//               <Card className={`rounded-2xl shadow-md hover:shadow-lg transition ${cat.color}`}>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-semibold">{cat.name}</CardTitle>
//                   <CardDescription className="text-sm">{cat.description}</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <ul className="space-y-2 mt-2">
//                     {cat.topics.map((topic, j) => (
//                       <li key={j} className="flex items-center gap-2 text-sm">
//                         <Check className={`h-4 w-4 ${cat.iconColor}`} />
//                         {topic}
//                       </li>
//                     ))}
//                   </ul>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import api from '@/lib/api';

type RemoteCategory = {
  id?: string;
  title?: string;
  description?: string;
  bullets?: string[];
};

type LocalCategory = {
  id: string;
  name: string;
  description: string;
  topics: string[];
  color: string;
  iconColor: string;
};

const fallbackCategories: LocalCategory[] = [
  {
    id: 'cat-balance',
    name: 'Balance Sheet',
    description: 'Budgeting & saving essentials',
    topics: ['Budget Planning', 'Emergency Funds', 'Debt Management'],
    color: 'text-blue-600 bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'cat-pl',
    name: 'P&L Statement',
    description: 'Core accounting principles',
    topics: ['Double Entry', 'Trial Balance', 'Journal Entries'],
    color: 'text-purple-600 bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    id: 'cat-cashflow',
    name: 'Cash Flow Quiz',
    description: 'Stock Investing fundamentals',
    topics: ['Equity Basics', 'Market Indices', 'Trading Strategies'],
    color: 'text-green-600 bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    id: 'cat-tax',
    name: 'Generic Taxation',
    description: 'Understanding tax systems',
    topics: ['Income Tax', 'GST & VAT', 'Tax Planning'],
    color: 'text-orange-600 bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    id: 'cat-corp',
    name: 'Corporate Finance',
    description: 'Business-level financial strategy',
    topics: ['Capital Budgeting', 'Cost of Capital', 'Financial Ratios'],
    color: 'text-pink-600 bg-pink-50',
    iconColor: 'text-pink-600',
  },
];

const palette = [
  { color: 'text-blue-600 bg-blue-50', iconColor: 'text-blue-600' },
  { color: 'text-purple-600 bg-purple-50', iconColor: 'text-purple-600' },
  { color: 'text-green-600 bg-green-50', iconColor: 'text-green-600' },
  { color: 'text-orange-600 bg-orange-50', iconColor: 'text-orange-600' },
  { color: 'text-pink-600 bg-pink-50', iconColor: 'text-pink-600' },
];

export default function QuizCategories() {
  const [categories, setCategories] = useState<LocalCategory[]>(fallbackCategories);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/landing');
        if (!mounted) return;

        const data = res.data || {};
        const remoteCats: RemoteCategory[] = Array.isArray(data.categories) ? data.categories : [];

        if (remoteCats.length === 0) {
          setCategories(fallbackCategories);
          return;
        }

        const mapped: LocalCategory[] = remoteCats.map((rc, idx) => {
          const pal = palette[idx % palette.length];
          return {
            id: rc.id || `cat-${idx}`,
            name: rc.title || rc.id || `Category ${idx + 1}`,
            description: rc.description || '',
            topics: Array.isArray(rc.bullets) && rc.bullets.length > 0 ? rc.bullets : [],
            color: pal.color,
            iconColor: pal.iconColor,
          };
        });

        setCategories(mapped);
      } catch (err) {
        console.error('Failed to load categories from backend, using fallback', err);
        setCategories(fallbackCategories);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="categories" className="py-20 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-[#253A7B]">Explore Quiz Categories</h2>
          <p className="text-xl text-gray-600">Master various finance topics through structured learning paths</p>
        </div>

        {/* flex wrapper - centers cards when there are few items, keeps responsiveness */}
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
          {loading
            ? // loading placeholders
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-full sm:w-1/2 md:w-1/3 xl:w-1/5 rounded-2xl p-6 bg-white/60 animate-pulse h-36" />
              ))
            : categories.map((cat, i) => (
                <motion.div
                  key={cat.id || i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="w-full sm:w-1/2 md:w-1/3 xl:w-1/5"
                >
                  <div className="h-full flex items-stretch">
                    <Card className="rounded-2xl shadow-md hover:shadow-lg transition w-full">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-[#253A7B]">{cat.name}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">{cat.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 mt-2">
                          {cat.topics.length > 0 ? (
                            cat.topics.map((topic, j) => (
                              <li key={j} className="flex items-center gap-2 text-sm">
                                <Check className={`h-4 w-4 ${cat.iconColor}`} />
                                <span className="text-gray-700">{topic}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-gray-500">No topics defined</li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}