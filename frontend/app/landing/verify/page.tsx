"use client";

import { useParams } from "next/navigation";
import Image from "next/image";

export default function CertificateVerificationPage() {
  const params = useParams();
  const certificateId = params?.certificateId || "FINOQZ-INT-2025-001";

  const certificateData = {
    name: "Prakhar Srivastava",
    company: "Finoqz Pvt Ltd.",
    employeeId: "EMP-1029",
    certificateId,
    role: "Backend Developer Intern",
    issueDate: "10 Nov 2025, 11:57 AM IST",
    period: "30 Aug 2025 – 31 Oct 2025",
    status: "Verified",
    companyDetails: {
      address: "Finoqz Pvt Ltd., Tower 5, Sector 62, Noida Extention, UP, India",
      mobile: "+91 98765 43210",
      email: "contact@finoqz.com",
      website: "www.finoqz.com",
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4 py-8">
      <div className="max-w-5xl w-full bg-white shadow-2xl rounded-2xl border border-gray-200 p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left side: Certificate details */}
        <div className="md:col-span-2 space-y-3 text-gray-700 text-center md:text-left">
          <div className="flex flex-col items-center md:flex-row md:items-center gap-3 mb-6">
            <a target="_blank" href="https://finoqz.com" rel="noopener noreferrer">
            <Image src="/finoqz.svg" alt="FinoQz Logo" width={40} height={40} className="md:w-[50px] md:h-[50px]" /></a>
            <h1 className="text-2xl md:text-3xl font-bold text-[#253A7B]">FinoQz Pvt Ltd.</h1>
          </div>

          <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
            Internship Certificate Verification
          </h2>

          <div className="space-y-2 text-sm md:text-base">
            <p><span className="font-semibold">Name:</span> {certificateData.name}</p>
            <p><span className="font-semibold">Employee ID:</span> {certificateData.employeeId}</p>
            <p><span className="font-semibold">Certificate ID:</span> {certificateData.certificateId}</p>
            <p><span className="font-semibold">Role:</span> {certificateData.role}</p>
            <p><span className="font-semibold">Period:</span> {certificateData.period}</p>
            <p><span className="font-semibold">Issue Date:</span> {certificateData.issueDate}</p>
            <p>
              <span className="font-semibold">Status:</span>
              <span className="ml-2 px-2 md:px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium text-xs md:text-sm">
                {certificateData.status}
              </span>
            </p>
          </div>
        </div>

        {/* Right side: ID card style */}
        <div className="bg-[#253A7B] text-white rounded-xl shadow-lg p-4 md:p-6 flex flex-col items-center">
          {/* Company Logo */}
          <a target="_blank" href="https://finoqz.com" rel="noopener noreferrer">
          <Image src="/finoqz.svg" alt="Company Logo" width={50} height={50} className="mb-4 md:w-[60px] md:h-[60px]" />
            </a>
          {/* Employee Photo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-4 border-white mb-4">
            <Image src="/prakhar.png" alt="Employee Photo" width={128} height={128} />
          </div>

          {/* Employee Info */}
          <h3 className="text-base md:text-lg font-bold">{certificateData.name}</h3>
          <p className="text-xs md:text-sm">Employee ID: {certificateData.employeeId}</p>
          <p className="text-xs md:text-sm">{certificateData.role}</p>

          {/* Divider */}
          <div className="w-full border-t border-white my-3 md:my-4"></div>

          {/* Company Details */}
          <div className="text-xs md:text-sm space-y-1 text-center">
            <p>{certificateData.companyDetails.address}</p>
            <p>📞 {certificateData.companyDetails.mobile}</p>
            <p>✉️ {certificateData.companyDetails.email}</p>
            <p>🌐 {certificateData.companyDetails.website}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
