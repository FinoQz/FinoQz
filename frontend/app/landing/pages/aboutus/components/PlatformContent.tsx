"use client";

import { motion } from "framer-motion";
import { Check, UserCircle, Layout, Activity, Award, TrendingUp, Layers } from "lucide-react";

export default function PlatformContent() {
  const whatWeDoItems = [
    { text: "Concept-based learning", icon: <Layers className="w-5 h-5" />, sub: "Financial statements & valuation" },
    { text: "Practical quizzes", icon: <Check className="w-5 h-5" />, sub: "Sharpening decision-making" },
    { text: "Real-world scenarios", icon: <Activity className="w-5 h-5" />, sub: "Case studies & market events" },
    { text: "Smart Tools", icon: <Award className="w-5 h-5" />, sub: "Continuously improve your IQ" }
  ];

  const approaches = [
    { title: "Clarity", description: "Simplifying complex financial concepts" },
    { title: "Application", description: "Testing real understanding" },
    { title: "Analysis", description: "Identifying risks & quality signals" },
  ];

  const categories = [
    { title: "Who It Is For", list: ["Retail investors", "Working professionals", "Finance students", "Serious builders"] },
    { title: "Why Different", list: ["No noise, no hype", "Focus on process", "Self-improvement", "Continuous testing"] }
  ];

  return (
    <div className="space-y-12 py-12">
      {/* Interactive Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* Main Who We Are Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="md:col-span-4 bg-white border border-gray-100 rounded-[2rem] p-8 flex flex-col justify-center shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors" />
          <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-4">The Platform</h2>
          <h3 className="text-2xl md:text-3xl font-bold text-[#253A7B] mb-4 leading-tight">
             A focused learning ecosystem built for individuals who want to think like investors, not just follow tips.
          </h3>
          <p className="text-gray-500 max-w-xl font-medium">
            We emphasize structured learning, analytical thinking, and real-world application. No noise, just clarity.
          </p>
        </motion.div>

        {/* Approach Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="md:col-span-2 bg-[#253A7B] rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-xl shadow-blue-900/10"
        >
          <h2 className="text-xs font-bold tracking-widest opacity-60 uppercase mb-6">Our Approach</h2>
          <div className="space-y-4">
            {approaches.map((app, i) => (
              <div key={i} className="flex flex-col border-b border-white/10 pb-3 last:border-0 hover:border-white/30 transition-colors group">
                <span className="text-lg font-bold group-hover:text-blue-300 transition-colors">{app.title}</span>
                <span className="text-xs opacity-70">{app.description}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Feature Cards */}
        {whatWeDoItems.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            className="md:col-span-3 lg:col-span-1.5 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#253A7B] mb-4 group-hover:bg-[#253A7B] group-hover:text-white transition-colors">
              {item.icon}
            </div>
            <h4 className="font-bold text-gray-900 mb-1">{item.text}</h4>
            <p className="text-xs text-gray-400 group-hover:text-gray-600 leading-relaxed transition-colors">
              {item.sub}
            </p>
          </motion.div>
        ))}

        {/* Dynamic Lists Section (New Layout) */}
        {categories.map((cat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className={`md:col-span-3 rounded-[2.5rem] p-8 border ${i === 0 ? 'bg-blue-50/30 border-blue-100' : 'bg-gray-50/50 border-gray-200'}`}
          >
            <h2 className="text-xs font-bold tracking-widest text-[#253A7B] uppercase mb-6">{cat.title}</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              {cat.list.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#253A7B] opacity-30 group-hover:opacity-100 transition-opacity" />
                   <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

      </div>

      {/* Final Callout (Extra Interaction) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-12"
      />
      
      <div className="text-center pt-8">
        <p className="text-lg md:text-xl text-gray-400 font-medium italic">
          &quot;This is active learning, not passive content.&quot;
        </p>
      </div>
    </div>
  );
}
