"use client";

export default function RefundContent() {
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow text-left space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#253A7B]">Refund Policy</h1>

      <p className="text-gray-700">
        At FinoQz, we strive to provide high-quality educational content and experiences. This Refund Policy outlines the conditions under which refunds may be issued.
      </p>

      <div>
        <h2 className="text-xl font-semibold text-[#253A7B] mb-2">1. Free Content</h2>
        <p className="text-gray-700">
          Most of our quizzes and learning materials are free to access. No refunds apply to free content.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#253A7B] mb-2">2. Paid Services</h2>
        <p className="text-gray-700">
          If you purchase premium content, certificates, or subscriptions, you may request a refund within 7 days of purchase, provided the content has not been fully accessed or downloaded.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#253A7B] mb-2">3. Non-Refundable Items</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Certificates already issued</li>
          <li>Quizzes already completed</li>
          <li>Downloaded resources</li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#253A7B] mb-2">4. How to Request a Refund</h2>
        <p className="text-gray-700">
          To request a refund, contact us at <strong>support@finoqz.com</strong> with your order details and reason for the request. We aim to respond within 3 business days.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#253A7B] mb-2">5. Changes to This Policy</h2>
        <p className="text-gray-700">
          FinoQz reserves the right to update this refund policy at any time. Changes will be posted on this page.
        </p>
      </div>
    </div>
  );
}
