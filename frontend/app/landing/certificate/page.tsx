"use client";

import Navbar from "../components/Navbar";
import CertificateHero from "./components/CertificateHero";
import DemoCertificate from "./components/DemoCertificate";
import QuizBenefits from "./components/QuizBenefits";
import Achievements from "./components/Achievements";
import Footer from "../components/Footer";

export default function CertificatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-900">
      <Navbar />
      <section className="py-20 container mx-auto px-6">
        <CertificateHero />
        <DemoCertificate />
        <QuizBenefits />
        <Achievements />
        <div className="text-center mt-12 text-gray-600 italic">
          “Your journey deserves recognition. Start your quiz, earn your certificate.”
        </div>
      </section>
      <Footer />
    </div>
  );
}
