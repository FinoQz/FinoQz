"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

interface ApiErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function SendEnquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      await api.post("api/contact", data);
      setSubmitted(true);
    } catch (err: unknown) {
      const apiError = err as ApiErrorLike;
      setError(apiError.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="border border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-[#253A7B]" />
        </div>
        <h2 className="text-2xl font-semibold text-[#253A7B] mb-3">
          Message Sent!
        </h2>
        <p className="text-gray-500 mb-8 max-w-md leading-relaxed">
          Thank you for reaching out. Our team has received your enquiry and
          will be in touch shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors text-sm"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-100 rounded-2xl p-8 md:p-10"
    >
      <h2 className="text-xl font-medium text-gray-900 mb-8">
        Send an Enquiry
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-sm text-gray-500 ml-1">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#253A7B] transition-all placeholder:text-gray-300 text-gray-900 bg-transparent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-500 ml-1">Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="john@example.com"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#253A7B] transition-all placeholder:text-gray-300 text-gray-900 bg-transparent"
          />
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <label className="text-sm text-gray-500 ml-1">Subject</label>
        <input
          type="text"
          name="subject"
          placeholder="How can we help you?"
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#253A7B] transition-all placeholder:text-gray-300 text-gray-900 bg-transparent"
        />
      </div>

      <div className="space-y-2 mb-8">
        <label className="text-sm text-gray-500 ml-1">Your Message</label>
        <textarea
          name="message"
          rows={5}
          placeholder="Tell us more about your enquiry..."
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#253A7B] transition-all placeholder:text-gray-300 text-gray-900 bg-transparent resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#253A7B] text-white px-6 py-3.5 rounded-xl hover:bg-[#1e3068] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send Message
            <Send className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
