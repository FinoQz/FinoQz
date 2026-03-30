'use client';

import React, { useState } from 'react';
import { Camera, Edit, Mail, Phone, MapPin, Key } from 'lucide-react';

interface ProfileCardProps {
  userData: {
    fullName: string;
    email: string;
    phone: string;
    city?: string;
    country?: string;
    profileImage?: string;
  };
  onImageUpload: (file: File) => void;
  onEditProfile: () => void;
  onChangePassword: () => void;
}

export default function ProfileCard({ 
  userData, 
  onImageUpload, 
  onEditProfile, 
  onChangePassword 
}: ProfileCardProps) {
  const [imagePreview, setImagePreview] = useState<string | undefined>(userData.profileImage);
  const [isHovering, setIsHovering] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };

  const getInitials = () => {
    if (!userData.fullName) return 'U';
    const parts = userData.fullName.trim().split(' ');
    const initials = parts.map(p => p[0]).join('');
    return initials.toUpperCase() || 'U';
  };

  const location = userData.city && userData.country
    ? `${userData.city}, ${userData.country}`
    : userData.city || userData.country || 'Location not set';

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
      <div className="flex flex-col items-center">
        {/* Profile Image */}
        <div 
          className="relative mb-4 group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#253A7B] to-[#1a2a5e] flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-100 shadow-md">
              {getInitials()}
            </div>
          )}
          
          {/* Camera Icon Overlay */}
          <label 
            htmlFor="profile-image-upload"
            className={`absolute bottom-0 right-0 p-2.5 bg-white rounded-full shadow-lg cursor-pointer transition-all ${
              isHovering ? 'scale-110 shadow-xl' : ''
            } hover:bg-gray-50`}
          >
            <Camera className="w-5 h-5 text-[#253A7B]" />
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        {/* User Info */}
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{userData.fullName}</h2>
        
        {/* Edit Profile Button */}
        <button 
          onClick={onEditProfile}
          className="w-full px-4 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Contact Info */}
      <div className="mt-6 pt-6 border-t-2 border-gray-100 space-y-4">
        <div className="flex items-center gap-3 text-sm group hover:bg-gray-50 p-2 rounded-lg transition">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Mail className="w-4 h-4 text-[#253A7B]" />
          </div>
          <span className="text-gray-700">{userData.email}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm group hover:bg-gray-50 p-2 rounded-lg transition">
          <div className="p-2 bg-green-50 rounded-lg">
            <Phone className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-gray-700">{userData.phone}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm group hover:bg-gray-50 p-2 rounded-lg transition">
          <div className="p-2 bg-orange-50 rounded-lg">
            <MapPin className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-gray-700">{location}</span>
        </div>
      </div>

      {/* Change Password Button */}
      <div className="mt-6 pt-6 border-t-2 border-gray-100">
        <button 
          onClick={onChangePassword}
          className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium flex items-center justify-center gap-2"
        >
          <Key className="w-4 h-4" />
          Change Password
        </button>
      </div>
    </div>
  );
}
