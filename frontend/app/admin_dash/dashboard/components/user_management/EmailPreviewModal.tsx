"use client";

import React from "react";
import { X, Download, ShieldCheck } from "lucide-react";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  body: string;
  heroImage?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  subject,
  body,
  heroImage,
  ctaText,
  ctaUrl,
}: EmailPreviewModalProps) {
  if (!isOpen) return null;

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  // Since body is now Rich Text (HTML), we don't escape it.
  const safeBody = body || "";
  
  const heroSection = heroImage ? `
    <div style="border-radius:12px 12px 0 0; overflow:hidden;">
      <img src="${heroImage}" alt="Banner" style="width:100%; display:block; height:auto;" />
    </div>
  ` : '';

  const ctaSection = (ctaText && ctaUrl) ? `
    <div style="text-align:center; margin:24px 0;">
      <a href="${ctaUrl}" target="_blank" style="
        background-color: #2563eb;
        color: #ffffff;
        padding: 14px 28px;
        text-decoration: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 15px;
        display: inline-block;
      ">
        ${escapeHtml(ctaText)}
      </a>
    </div>
  ` : '';

  const emailHtml = `
    <div style="background:#F9FAFB; padding:40px 0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="
        max-width:600px;
        margin:0 auto;
        background:#ffffff;
        border-radius:16px;
        padding:0;
        box-shadow:0 1px 3px rgba(0,0,0,0.05);
        border:1px solid #F3F4F6;
        overflow:hidden;
      ">
        
        ${heroSection}

        <div style="padding: 40px;">
          ${!heroImage ? `
          <div style="margin-bottom:30px;">
             <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" alt="Logo" style="width:28px;height:28px;vertical-align:middle;" />
             <span style="font-size:16px; font-weight:600; color:#111827; margin-left:8px; vertical-align:middle;">FinoQz</span>
          </div>
          ` : `
          <div style="margin-bottom:20px;">
             <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" alt="Logo" style="width:24px;height:24px;vertical-align:middle;" />
             <span style="font-size:14px; font-weight:600; color:#111827; margin-left:6px; vertical-align:middle;">FinoQz</span>
          </div>
          `}

          <h2 style="color:#111827; font-size:22px; font-weight:700; margin:0 0 20px; letter-spacing:-0.2px;">${escapeHtml(subject)}</h2>

          <div style="color:#374151; font-size:15px; line-height:1.6;">
            ${safeBody}
          </div>

          ${ctaSection}

          <div style="margin-top:40px; border-top:1px solid #F3F4F6; padding-top:24px; color:#6B7280; font-size:13px;">
            <p style="margin:0;">Best regards,</p>
            <p style="margin:4px 0 0; color:#111827; font-weight:600;">The FinoQz Team</p>
          </div>
        </div>

      </div>
      <p style="text-align:center; font-size:11px; color:#9CA3AF; margin-top:20px;">
        © ${new Date().getFullYear()} FinoQz. All rights reserved.
      </p>
    </div>
  `;

  const downloadHtml = () => {
    const element = document.createElement("a");
    const file = new Blob([emailHtml], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = `preview-${Date.now()}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Preview</h3>
            <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase mt-0.5">Verified Render</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadHtml} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-gray-50/10">
          <div
            dangerouslySetInnerHTML={{ __html: emailHtml }}
            className="max-w-full"
          />
        </div>

        <div className="flex items-center justify-between px-8 py-5 border-t border-gray-50 bg-white">
          <div className="flex items-center gap-2 text-[10px] font-medium text-emerald-600">
             <ShieldCheck className="w-3.5 h-3.5" /> Secure Template Matches Worker Logic
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl font-semibold text-[11px] hover:bg-black transition-all"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
