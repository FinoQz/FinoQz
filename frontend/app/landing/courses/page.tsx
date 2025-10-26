"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseGrid from "./components/CourseGrid";

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-900">
      <Navbar />
      <section className="py-20 text-[#253A7B]">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-6">Explore Our Courses</h1>
          <p className="text-lg mb-12 max-w-2xl mx-auto">
            Join thousands of learners mastering finance with FinoQz. Choose your path and start learning today.
          </p>
          <CourseGrid />
        </div>
      </section>
      <Footer />
    </div>
  );
}
