"use client";

export default function PrivacyContent() {
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow text-left space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#253A7B]">Privacy Policy</h1>

      <p className="text-gray-700">
        At FinoQz, we value your privacy. This policy outlines how we collect, use, and protect your personal information.
      </p>

      <div>
        <h2 className="text-xl font-semibold text-[#253A7B] mb-2">1. Information We Collect</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Personal details like name, email, and phone number</li>
          <li>Quiz activity and certificate history</li>
          <li>Device and browser information</li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#253A7B] mb-2">2. How We Use Your Data</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>To provide and improve our learning services</li>
          <li>To issue certificates and track progress</li>
          <li>To respond to inquiries and offer support</li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#253A7B] mb-2">3. Data Protection</h2>
        <p className="text-gray-700">
          We use industry-standard security measures to protect your data. However, no method is 100% secure.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#253A7B] mb-2">4. Your Rights</h2>
        <p className="text-gray-700">
          You have the right to access, update, or delete your data. Contact us at <strong>support@finoqz.com</strong>.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#253A7B] mb-2">5. Changes to This Policy</h2>
        <p className="text-gray-700">
          We may update this policy from time to time. Changes will be posted on this page.
        </p>
      </div>
    </div>
  );
}
