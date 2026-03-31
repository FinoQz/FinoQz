'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, BookOpen, Layers, Globe, Zap, Heart } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

type RemoteCategory = {
  _id?: string;
  id?: string;
  name?: string;
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

const palette = [
  { color: 'text-blue-600 bg-blue-50', iconColor: 'text-blue-600' },
  { color: 'text-purple-600 bg-purple-50', iconColor: 'text-purple-600' },
  { color: 'text-green-600 bg-green-50', iconColor: 'text-green-600' },
  { color: 'text-orange-600 bg-orange-50', iconColor: 'text-orange-600' },
  { color: 'text-pink-600 bg-pink-50', iconColor: 'text-pink-600' },
];

const icons = [BookOpen, Layers, Globe, Zap, Heart];

export default function QuizCategories() {
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await apiAdmin.get('api/admin/demo-quiz/public/categories');
        if (!mounted) return;
        const remoteCats: RemoteCategory[] = Array.isArray(res.data) ? res.data : [];
        const mapped: LocalCategory[] = remoteCats.map((rc, idx) => {
          const pal = palette[idx % palette.length];
          return {
            id: rc._id || rc.id || `cat-${idx}`,
            name: rc.name || `Category ${idx + 1}`,
            description: rc.description || '',
            topics: Array.isArray(rc.bullets) ? rc.bullets : [],
            color: pal.color,
            iconColor: pal.iconColor,
          };
        });
        setCategories(mapped);
      } catch (err) {
        console.error('Failed to load categories', err);
        setCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => { mounted = false; };
  }, []);

  return (
    <section id="categories" className="py-12 md:py-20 bg-[#FAFAFA] relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* NEW "SOBER" HEADING STYLE (MATCHING STORYDETAIL) */}
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold tracking-[0.2em] text-blue-600 uppercase"
          >
            Curated Learning Paths
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-gray-900 leading-tight">
            Explore <span className="text-[#253A7B] font-bold underline decoration-blue-200 underline-offset-8">Quiz Categories</span>
          </h2>
          
          <p className="text-lg text-gray-500 font-normal max-w-2xl mx-auto leading-relaxed">
            Master various finance topics through <span className="text-gray-800 font-semibold italic">structured learning paths.</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-7xl mx-auto">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[calc(50%-0.75rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(25%-1rem)] xl:w-[calc(20%-1rem)] rounded-2xl md:rounded-[1.5rem] p-4 bg-white/60 animate-pulse h-40 border border-white/80 shadow-sm" />
            ))
          ) : categories.length === 0 ? (
            <p className="text-gray-500 text-sm text-center w-full">No categories available.</p>
          ) : (
            categories.map((cat, i) => {
              const IconComp = icons[i % icons.length];
              
              // Generate a more descriptive "Sober" tagline if one isn't provided
              const fallbackDesc = cat.name.toLowerCase().includes('statement') ? 'Analyze balance sheets & cash flows.' :
                                   cat.name.toLowerCase().includes('valuation') ? 'Master DCF & relative multiples.' :
                                   cat.name.toLowerCase().includes('market') ? 'Understand trends & indicators.' :
                                   cat.name.toLowerCase().includes('ratio') ? 'Measure performance & efficiency.' :
                                   'Deep dive into core principles.';

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl md:rounded-[1.5rem] p-4 md:p-5 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 w-[calc(50%-0.75rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(25%-1rem)] xl:w-[calc(20%-1rem)]"
                >
                   {/* Icon Backdrop */}
                   <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-xl -mr-8 -mt-8 opacity-0 group-hover:opacity-30 transition-opacity ${cat.color}`} />
                   
                   <div className="flex-grow space-y-3 relative z-10 text-center flex flex-col items-center">
                     <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#253A7B] transition-all group-hover:bg-[#253A7B] group-hover:text-white shadow-sm">
                        <IconComp className="w-4 h-4 md:w-5 md:h-5" />
                     </div>
                     
                     <div className="space-y-1">
                        <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight group-hover:text-[#253A7B] transition-colors">{cat.name}</h3>
                        <p className="text-[10px] md:text-xs text-gray-400 font-semibold leading-tight line-clamp-2 italic">
                           {cat.description || fallbackDesc}
                        </p>
                     </div>

                     <ul className="space-y-1.5 mt-2 hidden md:block">
                        {(cat.topics || []).slice(0, 3).map((topic, j) => (
                          <li key={j} className="flex items-center gap-1.5 justify-center">
                             <div className="w-1 h-1 rounded-full bg-blue-300" />
                             <span className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-wider">{topic}</span>
                          </li>
                        ))}
                     </ul>
                   </div>

                   <div className="pt-4 mt-auto flex justify-between items-center text-[#253A7B] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#253A7B]">Explore</span>
                      <Check className="w-3 h-3" />
                   </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
