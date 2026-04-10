'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface Banner {
  _id: string;
  imageUrl: string;
  isActive: boolean;
}

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await apiAdmin.get('/api/banners/all');
      setBanners(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch banners', err);
      setError('Failed to fetch banners.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
      const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error('Cloudinary environment variables missing');
      }

      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', UPLOAD_PRESET);
      form.append('folder', 'finoqz-banners');

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: form,
      });

      const data = await response.json();
      
      if (response.ok && data.secure_url) {
        // Immediately save the new banner to the backend
        await apiAdmin.post('/api/banners', {
          title: `Banner ${new Date().getTime()}`,
          imageUrl: data.secure_url,
          isActive: true
        });
        await fetchBanners(); // refresh the list
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please check your Cloudinary configuration.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await apiAdmin.put(`/api/banners/${banner._id}`, { isActive: !banner.isActive });
      fetchBanners();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await apiAdmin.delete(`/api/banners/${id}`);
      fetchBanners();
    } catch (err) {
      alert('Failed to delete banner');
    }
  };

  if (loading && banners.length === 0) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Dashboard Banners</h1>
        <p className="text-sm text-gray-500 mt-2">
          Upload images here to display them on the users dashboard carousel. Banners marked as Active will be visible immediately.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Upload New Banner Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Upload New Banner</h2>
          <p className="text-sm text-gray-500 mt-1">Select an image from your computer.</p>
        </div>
        
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
            className="w-full md:w-auto text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 outline-none file:cursor-pointer p-1 border border-gray-200 rounded-xl bg-white disabled:opacity-50"
          />
          {uploadingImage && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center gap-2 rounded-xl text-blue-600 font-medium text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
            </div>
          )}
        </div>
      </div>

      {/* List of Banners */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-900 mb-4 px-1">Managed Banners</h3>
        
        {banners.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <p className="text-gray-500">No banners uploaded yet. Upload one above!</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-6">
              
              {/* Image Preview */}
              <div className="w-full sm:w-64 aspect-[21/9] bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                <img src={banner.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
              </div>

              {/* Controls */}
              <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={banner.isActive}
                      onChange={() => handleToggleActive(banner)}
                    />
                    <div className={`block w-12 h-6 rounded-full transition-colors duration-300 ${banner.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${banner.isActive ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <div className="ml-3 text-sm font-semibold text-gray-700">
                    {banner.isActive ? 'Active (Visible)' : 'Inactive (Hidden)'}
                  </div>
                </label>

                <button 
                  onClick={() => handleDelete(banner._id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
