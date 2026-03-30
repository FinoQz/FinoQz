"use client";

import Navbar from "@/app/landing/components/Navbar";
import HeroSection from "./components/HeroSection";
import InfoGrid from "./components/InfoGrid";
import StoryDetail from "./components/StoryDetail";
import PlatformContent from "./components/PlatformContent";
import FounderSection from "./components/FounderSection";
import Footer from "@/app/landing/components/Footer";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-24 pb-24 relative">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-12 relative z-10">
          <HeroSection />
          <InfoGrid />
          <StoryDetail />
          <PlatformContent />
          <FounderSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
