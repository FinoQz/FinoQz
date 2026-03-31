'use client';

import React, { useState } from 'react';
import CategoryEditor from '../components/edit_landing/CategoryEditor';
import DemoQuizEditor from '../components/edit_landing/DemoQuizEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, BookOpen } from 'lucide-react';

export default function EditLandingPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'quizzes'>('categories');

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
      </div>

      {/* Editor Content Area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'categories' ? (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CategoryEditor />
            </motion.div>
          ) : (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <DemoQuizEditor />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
