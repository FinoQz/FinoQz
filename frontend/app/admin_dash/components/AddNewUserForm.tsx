'use client';

import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import api from '@/lib/api';

interface NewUserForm {
  fullName: string;
  email: string;
  mobile: string;
  gender: string;
  address: string;
  role: string;
  password: string;
  profilePicture?: File | null;
}

interface AddNewUserFormProps {
  onSuccess?: () => void;
  onStatusChange?: (status: string) => void;
}

export default function AddNewUserForm({ onSuccess, onStatusChange }: AddNewUserFormProps) {
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    fullName: '',
    email: '',
    mobile: '',
    gender: '',
    address: '',
    role: 'user',
    password: '',
    profilePicture: null,
  });
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewUserForm({ ...newUserForm, profilePicture: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewUserForm({ ...newUserForm, [name]: value });
  };

  const handleRemoveImage = () => {
    setProfilePreview('');
    setNewUserForm({ ...newUserForm, profilePicture: null });
  };

  const handleReset = () => {
    setNewUserForm({
      fullName: '',
      email: '',
      mobile: '',
      gender: '',
      address: '',
      role: 'user',
      password: '',
      profilePicture: null,
    });
    setProfilePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  onStatusChange?.('Adding new user...');

  try {
    const formData = new FormData();
    formData.append('fullName', newUserForm.fullName);
    formData.append('email', newUserForm.email);
    formData.append('mobile', newUserForm.mobile);
    formData.append('gender', newUserForm.gender);
    formData.append('address', newUserForm.address);
    formData.append('role', newUserForm.role);
    formData.append('password', newUserForm.password);

    if (newUserForm.profilePicture) {
      formData.append('profilePicture', newUserForm.profilePicture);
    }

    await api.post('api/admin/panel/add-user', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    onStatusChange?.('User added successfully!');
    handleReset();

    setTimeout(() => {
      onSuccess?.();
    }, 1500);
  } catch (err: unknown) {
    console.error('Error adding user:', err);

    let message = 'Failed to add user';

    if (axios.isAxiosError(err)) {
      const status = err.response?.status;

      // ✅ Handle backend 409 Conflict (duplicate email/mobile)
      if (status === 409) {
        message = (err.response?.data as { message?: string } | undefined)?.message || 'Email or Mobile already registered';
      }
      // ✅ Handle unauthorized (JWT expired)
      else if (status === 401) {
        message = (err.response?.data as { message?: string } | undefined)?.message || 'Unauthorized. Please login again.';
        // Optionally: trigger logout or refresh token flow here
      }
    }

    onStatusChange?.(message);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-[#253A7B] mb-6">Add New User</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32">
            {profilePreview ? (
              <>
                <Image
                  src={profilePreview}
                  alt="Profile preview"
                  fill
                  sizes="(max-width: 640px) 6rem, 8rem"
                  className="rounded-full object-cover border-4 border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-[#253A7B] text-white rounded-full p-1 hover:bg-[#1a2a5e] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-gray-200">
                <Upload className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </div>
          <label className="cursor-pointer px-4 py-2 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition text-sm font-medium">
            Upload Profile Picture (Optional)
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={newUserForm.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={newUserForm.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              placeholder="Enter email address"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="mobile"
              value={newUserForm.mobile}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={newUserForm.gender}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={newUserForm.role}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
            >
              <option value="user">User</option>

            </select>
          </div>

          {/* Initial Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={newUserForm.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              placeholder="Minimum 6 characters"
            />
          </div>
        </div>

        {/* Address - Full Width */}


        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 sm:flex-none px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] shadow-lg hover:shadow-xl transition-all duration-300 font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {isSubmitting ? 'Adding...' : 'Add User'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
