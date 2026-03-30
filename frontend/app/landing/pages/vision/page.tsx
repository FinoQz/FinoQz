"use client";

import Navbar from "@/app/landing/components/Navbar";
import Footer from "@/app/landing/components/Footer";
import { motion } from "framer-motion";
import { Eye, Rocket, TrendingUp } from "lucide-react";

const goals = [
  {
    icon: Eye,
    text: "A globally recognized standard for interactive financial education.",
    delay: 0.1,
  },
  {
    icon: Rocket,
    text: "Continuous innovation in AI-driven personalized learning paths.",
    delay: 0.2,
  },
  {
    icon: TrendingUp,
    text: "Empowering millions to make sound, confident financial decisions.",
    delay: 0.3,
  },
];

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-24 pb-24 relative">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-24 relative z-10">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center pt-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-500 font-medium text-sm mb-6 tracking-wide">
              OUR FUTURE OUTLOOK
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-[#253A7B] mb-6 tracking-tight">
              Our Vision
            </h1>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto font-normal">
              To create a world where financial literacy is a fundamental right,
              not a privilege — fostering a global community of financially
              independent and confident individuals.
            </p>
          </motion.div>

          {/* Goals */}
          <div className="grid md:grid-cols-3 gap-12 border-y border-gray-100 py-16">
            {goals.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: item.delay,
                  ease: "easeOut",
                }}
                className="flex flex-col items-center md:items-start text-center md:text-left"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-[#253A7B]" />
                </div>
                <p className="text-gray-500 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Bottom Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-2xl mx-auto pb-8"
          >
            <p className="text-lg text-gray-500 leading-relaxed italic border-l-4 border-blue-200 pl-6 text-left">
              &quot;We envision a future where every individual, regardless of
              background, has the knowledge and tools to build lasting financial
              security.&quot;
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
