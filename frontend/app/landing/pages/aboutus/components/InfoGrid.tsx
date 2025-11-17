"use client";

import { motion } from "framer-motion";

export default function InfoGrid() {
  const items = [
    {
      title: "🚀 Our Mission",
      text: "To simplify finance education and make it accessible to everyone, everywhere.",
      delay: 0.5,
    },
    {
      title: "🌍 Our Vision",
      text: "To build the world’s most trusted finance learning ecosystem.",
      delay: 0.6,
    },
    {
      title: "📖 Our Story",
      text: "Founded in India, FinoQz started with a simple idea: make finance fun, practical, and part of everyday life.",
      delay: 0.7,
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 mb-16">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: item.delay }}
          className="bg-white p-6 rounded-xl shadow"
        >
          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
          <p>{item.text}</p>
        </motion.div>
      ))}
    </div>
  );
}
