"use client";

import Navbar from "@/app/landing/components/Navbar";
import Footer from "@/app/landing/components/Footer";
import FAQContent from "./components/FAQContent";
import { motion } from "framer-motion";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 flex flex-col font-sans selection:bg-[#253A7B] selection:text-white">
      <Navbar />
      <main className="flex-grow pt-24 pb-24 relative">
        <div className="container mx-auto px-6 max-w-4xl space-y-16 relative z-10 text-center">
          {/* SOBER HEADING STYLE (MATCHING STORYDETAIL) */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-bold tracking-[0.2em] text-blue-600 uppercase"
            >
              Support
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900">
              FinoQz — <span className="text-[#253A7B] font-bold underline decoration-blue-200 underline-offset-8">FAQ</span>
            </h1>
          </div>

          <FAQContent />
        </div>
      </main>
      <Footer />
    </div>
  );
}
