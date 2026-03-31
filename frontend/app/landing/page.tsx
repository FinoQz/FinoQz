'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from "./components/Navbar";
import TryQuizPreview from "./components/TryQuiz";
import QuizCategories from "./components/QuizCategories";
import Reviews from "./components/Reviews";
import Footer from "./components/Footer";

// Global Preloader Component
function Preloader() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAFAFA]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex items-center gap-4">
          <Image
            src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg"
            alt="FinoQz Logo"
            width={60}
            height={60}
            priority
            unoptimized
            className="drop-shadow-md"
          />
          <motion.h1
            initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-800"
          >
            FinoQz
          </motion.h1>
        </div>
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#253A7B]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [shouldShowLoader, setShouldShowLoader] = useState(false);

  useEffect(() => {
    // Check if the preloader has already been shown in this session
    const hasLoaded = sessionStorage.getItem('finoqz_pref_loaded');
    
    if (hasLoaded) {
      setLoading(false);
      return;
    }

    // Otherwise, it's the first time; prepare to show the loader
    setShouldShowLoader(true);

    const timer = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem('finoqz_pref_loaded', 'true');
    }, 1800); // Wait enough time for the intro animation
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-[#253A7B] selection:text-white">
      <AnimatePresence>
        {loading && shouldShowLoader && <Preloader key="preloader" />}
      </AnimatePresence>

      {/* Render unconditionally so TryQuiz fetches its network data while the Preloader plays! */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className={loading ? "h-screen overflow-hidden pointer-events-none" : ""}
      >
        <Navbar />
        {/* Try Quiz prominent showcase */}
        <div className="relative z-10 pb-16">
          <TryQuizPreview />
        </div>
        <QuizCategories />
        <Reviews />
        <Footer />
      </motion.div>
    </div>
  );
}
