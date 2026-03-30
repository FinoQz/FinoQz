'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';

interface FAQ {
  q: string;
  a: React.ReactNode;
}

interface FAQSection {
  title: string;
  questions: FAQ[];
}

const sections: FAQSection[] = [
  {
    title: 'CORE UNDERSTANDING',
    questions: [
      {
        q: '1. What defines FinoQZ?',
        a: "FinoQZ is a specialized practice platform dedicated to mastering fundamental analysis. We replace passive reading with active application through structured quizzes based on real-world financial statements and scenarios."
      }
    ]
  },
  {
    title: 'CURRICULUM',
    questions: [
      {
        q: '2. Which financial domains are covered?',
        a: "FinoQZ currently facilitates deep dives into Balance Sheets, Profit & Loss statements, Cash Flow data, and critical Financial Ratios. Our roadmap includes progressively advanced, scenario-driven modules."
      },
      {
        q: '3. Is the approach theoretical or applied?',
        a: "Our focus is strictly on practical application. Quizzes are engineered to sharpen your ability to interpret financial data, identify underlying risks (red flags), and make informed investment decisions."
      }
    ]
  },
  {
    title: 'THE EDGE',
    questions: [
      {
        q: '4. What differentiates FinoQZ from conventional platforms?',
        a: "While others explain the components of a balance sheet, FinoQZ validates your ability to actually analyze and interpret them in a professional context."
      }
    ]
  },
  {
    title: 'INVESTMENT VALUE',
    questions: [
      {
        q: '5. How does this translate to stock market success?',
        a: "By mastering these modules, you develop the clarity to read financial statements independently, distinguish between strong and weak business models, and avoid the common pitfalls of amateur analysis."
      }
    ]
  },
  {
    title: 'SKILL ACQUISITION',
    questions: [
      {
        q: '6. Which professional skills will I acquire?',
        a: "Users build a robust foundation in financial statement interpretation, ratio-driven analysis, risk identification, and structured analytical thinking."
      }
    ]
  },
  {
    title: 'METHODOLOGY',
    questions: [
      {
        q: '7. What is the most effective way to use FinoQZ?',
        a: "We recommend starting with foundational quizzes, meticulously reviewing mistakes for deeper insight, and eventually progressing to complex, scenario-based evaluations."
      }
    ]
  },
  {
    title: 'THE ROADMAP',
    questions: [
      {
        q: '8. Is advanced content in development?',
        a: "Yes. Our expansion plans include advanced financial modeling, real-world corporate case studies, and comprehensive scenario-based investing decision modules."
      }
    ]
  },
  {
    title: 'AUTHORITY',
    questions: [
      {
        q: '9. Why choose FinoQZ for financial learning?',
        a: "FinoQZ is built upon a synthesis of practical experience in auditing, compliance, and active investing, ensuring every module delivers industry-relevant value."
      }
    ]
  },
  {
    title: 'GET STARTED',
    questions: [
      {
        q: '10. How can I begin my journey?',
        a: "Simply create an account and immediately begin refining your fundamental analysis skills through our structured quiz environment."
      }
    ]
  }
];

function AccordionItem({ faq, isOpen, onClick, idx }: { faq: FAQ; isOpen: boolean; onClick: () => void; idx: number }) {
  return (
    <motion.div 
       initial={{ opacity: 0, y: 20 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       transition={{ duration: 0.7, delay: idx * 0.05, ease: "easeOut" }}
       className={`relative group bg-white/70 backdrop-blur-xl border rounded-[1rem] md:rounded-[1.25rem] overflow-hidden transition-all duration-500 shadow-[0_15px_40px_-20px_rgba(37,58,123,0.06)] hover:shadow-[0_25px_60px_-20px_rgba(37,58,123,0.12)] ${isOpen ? 'border-[#253A7B]/20' : 'border-white/90'}`}
    >
      <div className={`absolute top-0 left-0 w-1 md:w-1.5 h-full bg-gradient-to-b from-[#253A7B] to-blue-400 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

      <button
        onClick={onClick}
        className="w-full px-5 md:px-7 py-5 md:py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={`text-[13px] md:text-base font-bold tracking-tight pr-4 transition-colors duration-300 ${isOpen ? 'text-[#253A7B]' : 'text-gray-800'}`}>
          {faq.q}
        </span>
        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#253A7B] text-white rotate-180 shadow-md shadow-blue-900/10' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
          <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="px-5 md:px-7 pb-5 md:pb-7 text-gray-500 leading-relaxed text-[12px] md:text-sm font-medium italic pt-2 border-t border-gray-50/50">
              <motion.div
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                {faq.a}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQContent() {
  const [openId, setOpenId] = useState<string | null>('0-0');

  const toggle = (id: string) => setOpenId(openId === id ? null : id);

  return (
    <div className="max-w-4xl mx-auto space-y-12 md:space-y-16 pb-20 px-0">
      {sections.map((section, sidx) => (
        <div key={sidx} className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-4 md:gap-6 px-1">
            <span className="text-[9px] md:text-[11px] font-bold tracking-[0.3em] md:tracking-[0.4em] text-[#253A7B] uppercase whitespace-nowrap bg-blue-50/50 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-blue-100/50">
              {section.title}
            </span>
            <div className="h-px w-full bg-gradient-to-r from-gray-100 to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 gap-3 md:gap-5">
            {section.questions.map((faq, fidx) => {
              const id = `${sidx}-${fidx}`;
              return (
                <AccordionItem
                  key={fidx}
                  faq={faq}
                  isOpen={openId === id}
                  onClick={() => toggle(id)}
                  idx={fidx}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Optimized Tagline Section for Mobile */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="pt-24 md:pt-32 text-center overflow-hidden"
      >
         <div className="relative inline-block group max-w-full px-4">
            {/* Soft Glow */}
            <div className="absolute inset-x-0 top-0 h-full bg-blue-600/10 blur-[40px] md:blur-[60px] rounded-full group-hover:bg-blue-600/15 transition-all duration-700" />
            
            <div className="relative border-y border-blue-100/50 py-6 md:py-8 px-4 md:px-12 space-y-4">
               <span className="block text-[#253A7B] font-serif text-2xl md:text-5xl italic font-medium tracking-tight">
                 "Start Testing Your <span className="text-blue-600 relative inline-block">Investment IQ
                   <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-1 text-blue-200/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                     <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                   </svg>
                 </span>"
               </span>
               <div className="flex items-center justify-center gap-2 md:gap-3 pt-4 md:pt-6 text-[9px] md:text-[11px] font-bold tracking-[0.2em] md:tracking-[0.4em] text-gray-400 uppercase">
                  <div className="w-6 md:w-10 h-px bg-gray-200" />
                  Experience Mastery
                  <div className="w-6 md:w-10 h-px bg-gray-200" />
               </div>
            </div>
         </div>
      </motion.div>
    </div>
  );
}
