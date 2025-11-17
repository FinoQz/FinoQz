"use client";

import { useState } from "react";

export default function SendEnquiryForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // You can integrate backend API here
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow text-left space-y-4 max-w-xl mx-auto"
    >
      <h2 className="text-xl md:text-2xl font-bold text-[#253A7B] mb-3">Send an Enquiry</h2>


      <input
        type="text"
        placeholder="Your Name"
        required
        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
      />

      <input
        type="email"
        placeholder="Your Email"
        required
        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
      />

      <input
        type="text"
        placeholder="Subject"
        required
        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
      />

      <textarea
        rows={4}
        placeholder="Your Message"
        required
        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
      />

      <button
        type="submit"
        className="bg-[#253A7B] text-white px-6 py-2 rounded hover:bg-[#1e2a78] transition font-semibold w-full"
      >
        Submit
      </button>

      {submitted && (
        <p className="text-green-600 text-sm mt-2">Thank you! Your enquiry has been submitted.</p>
      )}
    </form>
  );
}
