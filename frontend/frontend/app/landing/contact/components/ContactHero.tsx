"use client";

import Navbar from "../../components/Navbar";
import ContactHero from "./ContactHero";
import ContactInfo from "./ContactInfo";
import SendEnquiryForm from "./SendEnquiryForm";
import Footer from "../../components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-900">
      <Navbar />

      {/* Add clear spacing below navbar */}
      <div className="pt-16 md:pt-20 px-4 md:px-6 container mx-auto">
        <ContactHero />

        {/* Side-by-side layout with balanced spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start mt-10 mb-12">
          <ContactInfo />
          <SendEnquiryForm />
        </div>

        <div className="text-center mt-8 text-gray-600 italic">
          “We’re here to help you grow — reach out anytime.”
        </div>
      </div>

      <Footer />
    </div>
  );
}
