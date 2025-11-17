"use client";

import Navbar from "@/app/landing/components/Navbar";
import Footer from "@/app/landing/components/Footer";
import TermsContent from "./components/TermsContent";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-900">
      <Navbar />
      <section className="pt-16 pb-20 container mx-auto px-4 md:px-6">
        <TermsContent />
      </section>
      <Footer />
    </div>
  );
}
