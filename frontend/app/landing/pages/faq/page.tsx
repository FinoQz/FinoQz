"use client";

import Navbar from "@/app/landing/components/Navbar";
import Footer from "@/app/landing/components/Footer";
import FAQAccordion from "./components/FAQAccordion";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-900">
      <Navbar />
      <section className="pt-16 pb-20 container mx-auto px-4 md:px-6">
        <h1 className="text-4xl font-bold text-[#253A7B] mb-6 text-center">Frequently Asked Questions</h1>
        <p className="text-center text-gray-700 mb-10 max-w-2xl mx-auto">
          Got questions about FinoQz? We’ve got answers.
        </p>
        <FAQAccordion />
      </section>
      <Footer />
    </div>
  );
}
