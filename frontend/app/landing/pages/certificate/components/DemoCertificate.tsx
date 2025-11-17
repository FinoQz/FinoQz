"use client";

import Image from "next/image";

export default function DemoCertificate() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-12 text-center">
      <Image
        src="/certificate.png" // Place this image in public/
        alt="Demo Certificate"
        width={800}
        height={500}
        className="mx-auto rounded-md"
      />
      <p className="mt-4 text-gray-700 text-sm italic">
        Earn this certificate by attempting the quiz and scoring above 70%
      </p>
    </div>
  );
}
