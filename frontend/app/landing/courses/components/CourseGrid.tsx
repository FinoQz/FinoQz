"use client";

import CourseCard from "./CourseCard";
import Image from "next/image";

const courses = [
  {
    title: "Finance Fundamentals",
    description: "Understand the basics of personal and business finance.",
    category: "Beginner",
    image: "/a.svg"
  },
  {
    title: "Investment Strategies",
    description: "Learn how to build and manage your investment portfolio.",
    category: "Intermediate",
    image: "/b.svg",
  },
  {
    title: "Advanced Financial Modeling",
    description: "Master Excel and build real-world financial understanding models.",
    category: "Advanced",
    image: "/f.svg",
  },
];

export default function CourseGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course, i) => (
        <CourseCard key={i} course={course} />
      ))}
    </div>
  );
}
