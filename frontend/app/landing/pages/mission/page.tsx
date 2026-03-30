"use client";

import Navbar from "@/app/landing/components/Navbar";
import Footer from "@/app/landing/components/Footer";
import { motion } from "framer-motion";
import { Target, Zap, Globe, Heart } from "lucide-react";

const pillars = [
  {
    icon: Target,
    title: "Accessible Learning",
    description:
      "Breaking down complex financial concepts into digestible, easy-to-understand life lessons and daily quizzes.",
    delay: 0.1,
  },
  {
    icon: Zap,
    title: "Interactive Engagement",
    description:
      "Making financial education genuinely fun and interactive, keeping our users motivated and eager to discover more.",
    delay: 0.2,
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Ensuring high-quality financial literacy tools are freely available to everyone, regardless of background or region.",
    delay: 0.3,
  },
  {
    icon: Heart,
    title: "User-Centric Focus",
    description:
      "Continuously adapting and evolving our platform based on community feedback to deliver maximum educational value.",
    delay: 0.4,
  },
];

export default function MissionPage() {
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
              OUR PURPOSE
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-[#253A7B] mb-6 tracking-tight">
              Our Mission
            </h1>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto font-normal">
              To empower individuals worldwide through accessible, innovative,
              and engaging financial education — bridging the gap between
              theoretical knowledge and practical financial independence.
            </p>
          </motion.div>

          {/* Pillars Grid */}
          <div className="grid md:grid-cols-2 gap-12 border-y border-gray-100 py-16">
            {pillars.map((item, i) => (
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
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {item.description}
                </p>
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
              &quot;We believe that financial literacy is the foundation of a secure
              and confident life. Our mission drives every feature we build and
              every lesson we share.&quot;
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
