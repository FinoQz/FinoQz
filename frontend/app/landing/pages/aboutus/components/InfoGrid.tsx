"use client";

import { motion } from "framer-motion";
import { Target, Globe, BookOpen } from "lucide-react";

export default function InfoGrid() {
  const items = [
    {
      title: "Our Mission",
      text: "To build investors who can think, analyze, and make independent financial decisions — not rely on tips or noise.",
      delay: 0.1,
      icon: <Target className="w-6 h-6 text-[#253A7B]" />
    },
    {
      title: "Our Vision",
      text: "To create a generation of financially intelligent individuals who understand businesses, not just stock prices.",
      delay: 0.2,
      icon: <Globe className="w-6 h-6 text-[#253A7B]" />
    },
    {
      title: "Our Story",
      text: "We built on a simple observation — most people read financial content, but very few truly understand it.",
      delay: 0.3,
      icon: <BookOpen className="w-6 h-6 text-[#253A7B]" />
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-12 border-y border-gray-100 py-16">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: item.delay, ease: "easeOut" }}
          className="text-center md:text-left flex flex-col items-center md:items-start"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6">
            {item.icon}
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-3">{item.title}</h3>
          <p className="text-gray-500 leading-relaxed">{item.text}</p>
        </motion.div>
      ))}
    </div>
  );
}
