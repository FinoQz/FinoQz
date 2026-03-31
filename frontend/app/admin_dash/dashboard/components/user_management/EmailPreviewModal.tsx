"use client";

import React from "react";
import { X, Download } from "lucide-react";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  body: string;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  subject,
  body,
}: EmailPreviewModalProps) {
  if (!isOpen) return null;

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatEmailBody = (rawMessage = "") => {
    const safeMessage = escapeHtml(rawMessage).trim();
    if (!safeMessage) return "";

    // Split by double newlines to preserve paragraph structure
    const paragraphs = safeMessage
      .split(/\n\s*\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    return paragraphs
      .map(
        (paragraph) =>
          `<p style="font-size:16px;color:#444;line-height:1.8;margin:0 0 16px;text-align:left;font-family:'Segoe UI', Roboto, Arial, sans-serif;">${paragraph.replace(
            /\n/g,
            "<br/>"
          )}</p>`
      )
      .join("");
  };

  const formattedBody = formatEmailBody(body);

  const emailHtml = `
    <div style="background:#f4f6fb; padding:40px 0; font-family:'Segoe UI', Roboto, Arial, sans-serif;">
      <div style="
        max-width:600px;
        margin:0 auto;
        background:#ffffff;
        border-radius:12px;
        padding:30px 40px;
        box-shadow:0 4px 20px rgba(0,0,0,0.08);
        border:1px solid #e5e7eb;
      ">
        
        <!-- Logo with Text -->
        <div style="text-align:center; margin-bottom:30px;">
          <div style="display:inline-flex; align-items:center; gap:12px;">
            <img 
              src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" 
              alt="FinoQz Logo" 
              style="width:52px; height:52px;"
            />
            <span style="font-size:24px; font-weight:700; color:#253A7B; letter-spacing:-0.5px;">FinoQz</span>
          </div>
        </div>

        <!-- Header -->
        <h2 style="
          color:#253A7B;
          font-size:24px;
          margin:0 0 15px;
          text-align:center;
          font-weight:700;
        ">
          ${escapeHtml(subject)}
        </h2>

        <!-- Divider -->
        <div style="
          width:60px;
          height:4px;
          background:#253A7B;
          margin:10px auto 25px;
          border-radius:2px;
        "></div>

        <!-- Message Body -->
        <div style="margin-bottom:25px;">
          ${formattedBody}
        </div>

        <!-- Footer -->
        <div style="
          color:#555;
          font-size:14px;
          margin-top:30px;
          border-top:1px solid #e5e7eb;
          padding-top:20px;
          text-align:center;
        ">
          <p style="margin:0 0 6px;">Regards,</p>
          <p style="margin:0; color:#253A7B; font-weight:700;">FinoQz Team</p>
        </div>

      </div>

      <!-- Bottom Note -->
      <p style="
        text-align:center;
        font-size:12px;
        color:#888;
        margin-top:20px;
      ">
        © ${new Date().getFullYear()} FinoQz. All rights reserved.
      </p>
    </div>
  `;

  const downloadHtml = () => {
    const element = document.createElement("a");
    const file = new Blob([emailHtml], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = `email-preview-${Date.now()}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Email Preview
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadHtml}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
              title="Download HTML"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <div
            dangerouslySetInnerHTML={{ __html: emailHtml }}
            className="max-w-full"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-white rounded-b-2xl">
          <p className="text-sm text-gray-600">
            This is how your email will appear to recipients
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium text-sm"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
