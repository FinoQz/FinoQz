"use client";

import Navbar from "../components/Navbar";
import HeroSection from "./components/HeroSection";
import InfoGrid from "./components/InfoGrid";
import FounderSection from "./components/FounderSection";
import Footer from "../components/Footer";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-900">
      <Navbar />
      <section className="bg-gradient-to-b from-white via-[#f0f4ff] to-[#dbeafe] text-[#253A7B] py-20">
        <div className="container mx-auto px-6">
          <HeroSection />
          <InfoGrid />
          <FounderSection />
        </div>
      </section>
      <Footer />
    </div>
  );
}
