"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function FounderSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <h2 className="text-3xl font-bold mb-6">Meet the Founder</h2>
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/founder1.png"
          alt="Founder Photo"
          width={280}
          height={280}
          className="rounded-xl shadow-md border border-gray-200"
        />
        
        <div>
          <h3 className="text-xl font-semibold">Siddhartha Singh</h3>
          <p className="text-sm text-gray-600">Founder & CEO, FinoQz</p>
          <p className="mt-4 max-w-xl mx-auto text-gray-700">
            “I started FinoQz to help people master finance in a way that’s practical, engaging, and community-driven. Every learner deserves clarity and confidence.”
          </p>
        </div>
      </div>
    </motion.div>
  );
}
