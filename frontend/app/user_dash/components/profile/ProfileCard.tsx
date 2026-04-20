'use client';

import React from 'react';
import { Camera, Edit, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface ProfileCardProps {
  userData: {
    fullName: string;
    email: string;
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        <div className="relative group mb-4">
          <div className="w-32 h-32 rounded-3xl bg-gray-50 border-4 border-white shadow-lg overflow-hidden relative group">
            {userData.profileImage ? (
              <Image
                src={userData.profileImage}
                alt={userData.fullName}
                width={128}
                height={128}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#253A7B] to-[#1a2a5e] flex items-center justify-center text-white text-4xl font-bold">
                {userData.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            
            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 leading-tight">{userData.fullName}</h2>
        <p className="text-sm text-gray-500 mt-1 font-medium italic">{userData.email}</p>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-gray-50">
        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</p>
          <p className="text-sm font-bold text-[#253A7B]">Student</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level</p>
          <p className="text-sm font-bold text-gray-700">Beginner</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3 mt-8">
        <button
          onClick={onEditProfile}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#253A7B] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#1a2a5e] transition-all shadow-md active:scale-95"
        >
          <Edit className="w-4 h-4" />
          Update Details
        </button>
        <button
          onClick={onChangePassword}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}
