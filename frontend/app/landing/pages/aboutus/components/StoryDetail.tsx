"use client";

import { motion } from "framer-motion";
import { LineChart, ShieldCheck, Zap } from "lucide-react";

export default function StoryDetail() {
  const struggles = [
    { title: "Interpreting financial statements", icon: <LineChart className="w-5 h-5" /> },
    { title: "Identifying risks", icon: <ShieldCheck className="w-5 h-5" /> },
    { title: "Making confident decisions", icon: <Zap className="w-5 h-5" /> }
  ];

  return (
    <section className="pt-4 pb-12 md:pb-20 flex flex-col items-center">
      <div className="max-w-3xl w-full text-center space-y-12">
        {/* Story Intro */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase">The Gap We Saw</h2>
          <p className="text-2xl md:text-3xl font-medium text-gray-900 leading-snug">
            Most people read financial content,<br className="hidden md:block" /> 
            but very few <span className="text-[#253A7B] font-bold underline decoration-blue-200 underline-offset-8">truly understand it.</span>
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed">
            The problem is not a lack of information — it’s a lack of <span className="text-gray-800 font-semibold italic">structured thinking.</span>
          </p>
        </motion.div>

        {/* Struggles List (Compact Horizontal Icons) */}
        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="flex flex-wrap justify-center gap-4 md:gap-8 bg-white/40 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
        >
          {struggles.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 w-32 md:w-40 group">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#253A7B] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-[#253A7B]/10">
                {item.icon}
              </div>
              <span className="text-xs md:text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors leading-tight">{item.title}</span>
            </div>
          ))}
        </motion.div>

        {/* Solution & Mantra */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-10"
        >
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Instead of passive learning, we focus on <span className="font-semibold text-gray-800">active testing</span>, real-world scenarios, and analytical thinking.
          </p>
          
          <div className="inline-block relative">
            <div className="absolute -inset-4 bg-blue-50/50 rounded-full blur-2xl -z-10" />
            <p className="text-xl md:text-2xl font-serif italic text-[#253A7B] font-medium border-x-2 border-blue-100 px-8 py-2">
              "Because in investing, <span className="text-blue-600">clarity</span> beats information."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
