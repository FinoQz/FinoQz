import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import TryQuizPreview from "./components/TryQuiz";
import QuizCategories from "./components/QuizCategories";
import Community from "./components/Community";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-900">
      <Navbar />
      <Hero />
      <QuizCategories />
      <TryQuizPreview />
      <Features />
      <Community />
      <CTA />
      <Footer />
    </div>
  );
}
