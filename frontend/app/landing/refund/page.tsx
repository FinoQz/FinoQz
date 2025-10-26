"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RefundContent from "./components/RefundContent";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-900">
      <Navbar />
      <section className="pt-16 pb-20 container mx-auto px-4 md:px-6">
        <RefundContent />
      </section>
      <Footer />
    </div>
  );
}
