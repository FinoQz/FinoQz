"use client";

import Navbar from "@/app/landing/components/Navbar";
import ContactInfo from "./components/ContactInfo";
import SendEnquiryForm from "./components/SendEnquiryForm";
import Footer from "@/app/landing/components/Footer";
import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-24 pb-24 relative">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-16 relative z-10">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center pt-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-500 font-medium text-sm mb-6 tracking-wide">
              GET IN TOUCH
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-[#253A7B] mb-6 tracking-tight">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto font-normal">
              Have questions or feedback? We&apos;d love to hear from you. Drop us a
              line and our team will get back to you shortly.
            </p>
          </motion.div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start border-t border-gray-100 pt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="lg:col-span-2"
            >
              <ContactInfo />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-3"
            >
              <SendEnquiryForm />
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
