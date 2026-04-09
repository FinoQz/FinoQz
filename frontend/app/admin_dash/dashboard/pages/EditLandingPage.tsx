'use client';

import React, { useState } from 'react';
import CategoryEditor from '../components/edit_landing/CategoryEditor';
import DemoQuizEditor from '../components/edit_landing/DemoQuizEditor';
import UpdatesEditor from '../components/edit_landing/UpdatesEditor';
import ComingSoonEditor from '../components/edit_landing/ComingSoonEditor';
import SuggestionsManager from '../components/edit_landing/SuggestionsManager';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, BookOpen, Calendar, Rocket, Lightbulb } from 'lucide-react';

export default function EditLandingPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'quizzes' | 'updates' | 'comingSoon' | 'suggestions'>('categories');

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Landing Page Editor</h1>
        <p className="text-gray-500 mt-2">Manage colors, categories, and quizzes for the public landing page.</p>
      </div>

      {/* Modern Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl w-fit mb-10 border border-gray-200">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'categories' 
              ? 'bg-white text-[#253A7B] shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layout className="w-4 h-4" />
          Categories
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'quizzes' 
              ? 'bg-white text-[#253A7B] shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Quiz Editor
        </button>
        <button
          onClick={() => setActiveTab('updates')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'updates' 
              ? 'bg-white text-[#253A7B] shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Updates
        </button>
        <button
          onClick={() => setActiveTab('comingSoon')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'comingSoon' 
              ? 'bg-white text-[#253A7B] shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Rocket className="w-4 h-4" />
          Coming Soon
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'suggestions' 
              ? 'bg-white text-[#253A7B] shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Suggestions
        </button>
      </div>


      {/* Editor Content Area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'categories' && (
            <motion.div key="categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <CategoryEditor />
            </motion.div>
          )}
          {activeTab === 'quizzes' && (
            <motion.div key="quizzes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <DemoQuizEditor />
            </motion.div>
          )}
          {activeTab === 'updates' && (
            <motion.div key="updates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <UpdatesEditor />
            </motion.div>
          )}
          {activeTab === 'comingSoon' && (
            <motion.div key="comingSoon" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <ComingSoonEditor />
            </motion.div>
          )}
          {activeTab === 'suggestions' && (
            <motion.div key="suggestions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <SuggestionsManager />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
