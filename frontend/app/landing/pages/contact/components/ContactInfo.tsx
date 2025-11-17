"use client";

export default function ContactInfo() {
  return (
    <div className="bg-white p-5 md:p-6 rounded-xl shadow text-left">
      <h2 className="text-xl md:text-2xl font-bold text-[#253A7B] mb-3">Contact Details</h2>
      <ul className="space-y-2 text-gray-700 text-sm md:text-base">
        <li><strong>Email:</strong> support@finoqz.com</li>
        <li><strong>Phone:</strong> +91 8287755328</li>
        <li><strong>Location:</strong> Noida Extension, Uttar Pradesh, India</li>
      </ul>
    </div>
  );
}
