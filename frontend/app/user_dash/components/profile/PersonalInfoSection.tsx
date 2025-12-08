'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Users, Pencil } from 'lucide-react';

interface PersonalInfoSectionProps {
  formData: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    dateOfBirth: string;
    gender: string;
    bio: string;
  };
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

export default function PersonalInfoSection({ formData, onChange, errors }: PersonalInfoSectionProps) {
  const [isEditingFullName, setIsEditingFullName] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <User className="w-5 h-5 text-[#253A7B]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
      </div>

      <div className="space-y-5">
        {/* Full Name with Pencil Edit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              readOnly={!isEditingFullName}
              className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl transition 
                ${isEditingFullName 
                  ? 'focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent' 
                  : 'bg-gray-50 text-gray-600 cursor-not-allowed'}
              `}
              placeholder="Enter full name"
            />
            <button
              type="button"
              onClick={() => setIsEditingFullName(!isEditingFullName)}
              className="absolute right-3 text-gray-400 hover:text-[#253A7B] transition"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </div>
          {errors?.fullName && (
            <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="your.email@example.com"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              placeholder="+91 98765 43210"
            />
          </div>
          {errors?.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Location Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.city}
                onChange={(e) => onChange('city', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                placeholder="Mumbai"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              value={formData.country}
              onChange={(e) => onChange('country', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition bg-white"
            >
              <option value="">Select Country</option>
              <option value="India">India</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>

        {/* DOB and Gender Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => onChange('dateOfBirth', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={formData.gender}
                onChange={(e) => onChange('gender', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition bg-white"
              >
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => onChange('bio', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition resize-none"
            placeholder="Tell us a little about yourself..."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {formData.bio.length}/500 characters
          </p>
        </div>
      </div>
    </div>
  );
}
