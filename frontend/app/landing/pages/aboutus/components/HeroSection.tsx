"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="text-center pt-8"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-500 font-medium text-sm mb-6 tracking-wide">
        OUR JOURNEY
      </div>
      <h1 className="text-4xl md:text-5xl font-semibold text-[#253A7B] mb-6 tracking-tight">
        About FinoQz
      </h1>
      <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto font-normal">
        FinoQZ helps you move from consuming financial information to actually understanding and applying it.
      </p>
    </motion.div>
  );
}
