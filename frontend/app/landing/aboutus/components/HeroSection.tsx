"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <h1 className="text-4xl font-bold mb-4">About FinoQz</h1>
      <p className="text-lg max-w-2xl mx-auto">
        FinoQz is on a mission to make finance learning a daily habit. We empower learners with smart tools, engaging content, and a vibrant community.
      </p>
    </motion.div>
  );
}
