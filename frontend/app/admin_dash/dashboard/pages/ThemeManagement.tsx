'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import * as sha1 from 'js-sha1';
import { Trash2, Palette, Upload, Monitor, Eye, Save } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import { useTheme } from '@/context/ThemeProvider';

interface ThemeState {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  darkMode: boolean;
}

const defaultTheme: ThemeState = {
  logoUrl: '',
  primaryColor: '#253A7B',
  secondaryColor: '#1a2a5e',
  accentColor: '#3B82F6',
  backgroundColor: '#f9fafb',
  textColor: '#111827',
  darkMode: false,
};

function ColorField({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-16 rounded cursor-pointer border border-gray-300 p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none"
        />
      </div>
    </div>
  );
}

export default function ThemeManagement() {
  const [form, setForm] = useState<ThemeState>(defaultTheme);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const { refetch } = useTheme();

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await apiAdmin.get('api/theme');
        const data = res.data;
        setForm({
          logoUrl: data.logoUrl || '',
          primaryColor: data.primaryColor || defaultTheme.primaryColor,
          secondaryColor: data.secondaryColor || defaultTheme.secondaryColor,
          accentColor: data.accentColor || defaultTheme.accentColor,
          backgroundColor: data.backgroundColor || defaultTheme.backgroundColor,
          textColor: data.textColor || defaultTheme.textColor,
          darkMode: data.darkMode ?? false,
        });
      } catch (err) {
        console.error('Failed to load theme', err);
        setSaveMessage('❌ Failed to load theme settings');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchTheme();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hash = sha1.sha1(arrayBuffer as ArrayBuffer);
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const folder = 'finoqz/logo';
      const publicId = `${folder}/${hash}`;
      const existingUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;

      // Check if already uploaded
      try {
        const check = await fetch(existingUrl, { method: 'HEAD' });
        if (check.ok) {
          setForm((prev) => ({ ...prev, logoUrl: existingUrl }));
          return;
        }
      } catch {
        // Not found, proceed with upload
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      formData.append('public_id', publicId);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      setForm((prev) => ({ ...prev, logoUrl: data.secure_url }));
    } catch (err) {
      console.error('Logo upload failed:', err);
      setSaveMessage('❌ Logo upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setForm((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveMessage('');
    try {
      await apiAdmin.patch('api/theme', form);
      setSaveMessage('✅ Theme saved successfully! Changes are now live everywhere.');
      refetch();
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (err) {
      console.error('Theme save error:', err);
      setSaveMessage('❌ Failed to save theme. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Loading theme settings…</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-[var(--theme-primary)]" />
            Theme Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize your brand logo and color theme. Changes apply everywhere — landing page, admin panel, user dashboard, and email templates.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-[var(--theme-primary)] text-white px-5 py-2.5 rounded-lg hover:bg-[var(--theme-secondary)] transition text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving…' : 'Save Theme'}
        </button>
      </div>

      {/* Status message */}
      {saveMessage && (
        <div
          className={`p-3 rounded-lg text-sm ${
            saveMessage.includes('✅')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Settings */}
        <div className="space-y-8">
          {/* Logo Section */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-[var(--theme-primary)]" />
              <h2 className="text-lg font-semibold text-gray-900">Logo</h2>
            </div>
            <p className="text-sm text-gray-500">
              Upload your logo to replace the default logo across all platforms.
            </p>

            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={logoUploading}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[var(--theme-primary)] file:text-white hover:file:bg-[var(--theme-secondary)] disabled:opacity-50"
              />
              {logoUploading && (
                <p className="text-xs text-blue-600">Uploading logo…</p>
              )}
              {form.logoUrl && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Image
                    src={form.logoUrl}
                    alt="Current Logo"
                    width={48}
                    height={48}
                    className="rounded object-contain"
                    unoptimized
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 truncate">{form.logoUrl}</p>
                  </div>
                  <button
                    onClick={handleRemoveLogo}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Remove logo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Colors Section */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-[var(--theme-primary)]" />
              <h2 className="text-lg font-semibold text-gray-900">Colors</h2>
            </div>

            <ColorField
              label="Primary Color"
              value={form.primaryColor}
              onChange={(v) => setForm((p) => ({ ...p, primaryColor: v }))}
              description="Main brand color — used for buttons, headers, and key UI elements"
            />
            <ColorField
              label="Secondary Color"
              value={form.secondaryColor}
              onChange={(v) => setForm((p) => ({ ...p, secondaryColor: v }))}
              description="Secondary accent — used for hover states and supporting elements"
            />
            <ColorField
              label="Accent Color"
              value={form.accentColor}
              onChange={(v) => setForm((p) => ({ ...p, accentColor: v }))}
              description="Highlight color — used for links, badges, and call-to-action highlights"
            />
            <ColorField
              label="Background Color"
              value={form.backgroundColor}
              onChange={(v) => setForm((p) => ({ ...p, backgroundColor: v }))}
              description="Page background color"
            />
            <ColorField
              label="Text Color"
              value={form.textColor}
              onChange={(v) => setForm((p) => ({ ...p, textColor: v }))}
              description="Default body text color"
            />
          </section>

          {/* Display Mode */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="w-5 h-5 text-[var(--theme-primary)]" />
              <h2 className="text-lg font-semibold text-gray-900">Display Mode</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setForm((p) => ({ ...p, darkMode: false }))}
                className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition ${
                  !form.darkMode
                    ? 'border-[var(--theme-primary)] bg-blue-50 text-[var(--theme-primary)]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                ☀️ Light Mode
              </button>
              <button
                onClick={() => setForm((p) => ({ ...p, darkMode: true }))}
                className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition ${
                  form.darkMode
                    ? 'border-[var(--theme-primary)] bg-blue-50 text-[var(--theme-primary)]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                🌙 Dark Mode
              </button>
            </div>
          </section>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[var(--theme-primary)]" />
            <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
          </div>

          {/* Preview Card */}
          <div
            className="rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            style={{ backgroundColor: form.backgroundColor }}
          >
            {/* Preview Navbar */}
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{ backgroundColor: form.primaryColor }}
            >
              {form.logoUrl ? (
                <Image
                  src={form.logoUrl}
                  alt="Logo Preview"
                  width={32}
                  height={32}
                  className="rounded object-contain"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                  FQ
                </div>
              )}
              <span className="text-white font-semibold text-sm">FinoQz</span>
            </div>

            {/* Preview Content */}
            <div className="p-6 space-y-4">
              <h3
                className="text-xl font-bold"
                style={{ color: form.textColor }}
              >
                Welcome to FinoQz
              </h3>
              <p className="text-sm" style={{ color: form.textColor, opacity: 0.7 }}>
                Your financial intelligence platform for smarter quiz-based learning.
              </p>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  Get Started
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: form.accentColor }}
                >
                  Learn More
                </button>
              </div>

              {/* Preview Card */}
              <div
                className="rounded-lg p-4 border"
                style={{
                  borderColor: form.secondaryColor + '40',
                  backgroundColor: form.darkMode ? '#1f2937' : '#fff',
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: form.primaryColor }}
                >
                  Sample Quiz Card
                </p>
                <p className="text-xs mt-1" style={{ color: form.textColor, opacity: 0.6 }}>
                  Finance &amp; Economics · 10 Questions
                </p>
                <div
                  className="mt-2 text-xs inline-flex px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: form.accentColor + '20',
                    color: form.accentColor,
                  }}
                >
                  Free
                </div>
              </div>
            </div>
          </div>

          {/* Email preview strip */}
          <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Email Template Preview
              </p>
            </div>
            <div
              className="p-5 space-y-3"
              style={{ fontFamily: "'Segoe UI', Roboto, sans-serif" }}
            >
              <div className="flex items-center gap-3">
                {form.logoUrl ? (
                  <Image
                    src={form.logoUrl}
                    alt="Email Logo"
                    width={40}
                    height={40}
                    className="rounded object-contain"
                    unoptimized
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: form.primaryColor }}
                  >
                    FQ
                  </div>
                )}
                <span
                  className="text-base font-semibold"
                  style={{ color: form.primaryColor }}
                >
                  FinoQz
                </span>
              </div>
              <div
                className="rounded-lg p-3 text-center text-white text-lg font-bold tracking-widest"
                style={{ backgroundColor: form.primaryColor }}
              >
                4 8 2 1 9 3
              </div>
              <p className="text-xs text-gray-500 text-center">
                OTP valid for 5 minutes · Do not share
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
