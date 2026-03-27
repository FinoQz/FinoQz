'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import * as sha1 from 'js-sha1';
import apiAdmin from '@/lib/apiAdmin';

interface Stat {
  value: string;
  label: string;
}

export default function HeroEditor() {
  const [heading, setHeading] = useState('');
  const [tagline, setTagline] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [stats, setStats] = useState<Stat[]>([
    { value: '', label: '' },
    { value: '', label: '' },
    { value: '', label: '' },
  ]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await apiAdmin.get('api/admin/landing');
        const data = res.data;
        const hero = data?.hero || {};
        setHeading(hero.heading || '');
        setTagline(hero.tagline || '');
        setButtonText(hero.buttonText || '');
        setButtonLink(hero.buttonLink || '');
        setImagePreview(hero.imageUrl || null);
        setStats(hero.stats || [
          { value: '', label: '' },
          { value: '', label: '' },
          { value: '', label: '' },
        ]);
      } catch (err) {
        console.error('Failed to load hero data', err);
        setSaveMessage('❌ Failed to load hero data');
      }
    };
    fetchHero();
  }, []);



  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const hash = sha1.sha1(arrayBuffer as ArrayBuffer);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const folder = 'finoqz/hero';
    const publicId = `${folder}/${hash}`;
    const existingUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;

    try {
      const check = await fetch(existingUrl, { method: 'HEAD' });
      if (check.ok) {
        setImagePreview(existingUrl);
        alert('✅ Image already exists on Cloudinary. Using existing image.');
        return;
      }
    } catch {
      console.warn('Image not found, uploading new one...');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append('public_id', publicId);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await res.json();
      setImagePreview(data.secure_url);
      alert('✅ Image uploaded to Cloudinary successfully!');
    } catch (err) {
      console.error('Cloudinary upload failed:', err);
      alert('❌ Image upload failed');
    }
  };



  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const handleStatChange = (index: number, key: 'value' | 'label', val: string) => {
    const updated = [...stats];
    updated[index][key] = val;
    setStats(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveMessage('');
    try {
      // Validate required fields
      if (!heading.trim() || !tagline.trim() || !buttonText.trim() || !buttonLink.trim()) {
        setSaveMessage('❌ Please fill in all required fields');
        return;
      }

      const hero = {
        heading: heading.trim(),
        tagline: tagline.trim(),
        buttonText: buttonText.trim(),
        buttonLink: buttonLink.trim(),
        imageUrl: imagePreview,
        stats: stats.filter(s => s.value.trim() && s.label.trim()),
      };

      const res = await apiAdmin.patch('api/admin/landing', { hero });

      if (res.status >= 200 && res.status < 300) {
        setSaveMessage('✅ Hero section updated successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('❌ Failed to save changes');
      }
    } catch (err) {
      console.error('Save error:', err);
      if (err instanceof Error && err.message.includes('401')) {
        setSaveMessage('❌ You are not authorized to edit landing content');
      } else {
        setSaveMessage('❌ Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Hero Section</h2>
          <p className="text-sm text-gray-500">Edit the landing page hero content and media</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-[var(--theme-primary)] text-white px-5 py-2 rounded-md hover:bg-[var(--theme-secondary)] transition text-sm disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveMessage && (
        <div className={`p-3 rounded-md text-sm ${
          saveMessage.includes('✅') 
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-5">
          <FormField label="Heading" value={heading} onChange={setHeading} />
          <FormField label="Tagline" value={tagline} onChange={setTagline} />
          <FormField label="Button Text" value={buttonText} onChange={setButtonText} />
          <FormField label="Button Link" value={buttonLink} onChange={setButtonLink} />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Hero Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[var(--theme-primary)] file:text-white hover:file:bg-[var(--theme-secondary)]"
            />
            {imagePreview && (
              <button
                onClick={handleRemoveImage}
                className="text-red-600 hover:text-red-700 transition p-1"
                title="Remove image"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="space-y-4 pt-4">
            <p className="text-sm font-medium text-gray-700">Stats</p>
            {stats.map((stat, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <FormField
                  label={`Stat ${i + 1} Value`}
                  value={stat.value}
                  onChange={(val) => handleStatChange(i, 'value', val)}
                />
                <FormField
                  label={`Stat ${i + 1} Label`}
                  value={stat.label}
                  onChange={(val) => handleStatChange(i, 'label', val)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50">
          <div className="aspect-video w-full bg-gray-100 relative">
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="Hero Preview"
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                  style={{ height: 'auto' }}
                  unoptimized
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No image selected
              </div>
            )}
          </div>
          <div className="p-6 space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>
            <p className="text-sm text-gray-600">{tagline}</p>
            <a
              href={buttonLink}
              className="inline-block mt-4 bg-[var(--theme-primary)] text-white px-4 py-2 rounded-md text-sm hover:bg-[var(--theme-secondary)] transition"
            >
              {buttonText}
            </a>
            <div className="flex flex-wrap gap-6 pt-6">
              {stats.map((stat, i) => (
                <div key={i} className="min-w-[80px]">
                  <p className="text-base md:text-2xl font-bold text-[var(--theme-primary)]">{stat.value}</p>
                  <p className="text-xs md:text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FormField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none"
      />
    </div>
  );
}
