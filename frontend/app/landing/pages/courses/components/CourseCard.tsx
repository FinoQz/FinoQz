"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type Course = {
  title: string;
  description: string;
  category: string;
  image: string;
};

const categoryColors: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-yellow-100 text-yellow-700",
  Advanced: "bg-red-100 text-red-700",
};

export default function CourseCard({ course }: { course: Course }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
    >
      {/* Top Illustration */}
      <div className="relative h-40 w-full">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Bottom Content */}
      <div className="p-6 text-left">
        <h3 className="text-xl font-semibold text-[#253A7B] mb-2">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{course.description}</p>

        {/* Category Badge */}
        <span
          className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-4 ${categoryColors[course.category]}`}
        >
          {course.category}
        </span>

        {/* Enroll Button */}
        <button className="w-full bg-[#253A7B] text-white py-2 rounded hover:bg-[#1e2a78] transition font-semibold">
          Enroll Now
        </button>
      </div>
    </motion.div>
  );
}
