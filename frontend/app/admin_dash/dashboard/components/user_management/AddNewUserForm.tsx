'use client';

import React, { useState } from 'react';
import axios from 'axios';
import apiAdmin from '@/lib/apiAdmin';

interface NewUserForm {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
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
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewUserForm({ ...newUserForm, [name]: value });
  };

  const handleReset = () => {
    setNewUserForm({
      fullName: '',
      email: '',
      mobile: '',
      password: '',
    });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    onStatusChange?.('Adding new user...');

    try {
      await apiAdmin.post('api/admin/panel/add-user', {
        fullName: newUserForm.fullName,
        email: newUserForm.email,
        mobile: newUserForm.mobile,
        password: newUserForm.password,
      }, {
        withCredentials: true,
      });

      onStatusChange?.('User added successfully!');
      handleReset();
      setTimeout(() => onSuccess?.(), 1500);
    } catch (err) {
      console.error('Error adding user:', err);
      let message = 'Failed to add user';

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) {
          message =
            (err.response?.data as { message?: string })?.message ||
            'Email or Mobile already registered';
        } else if (status === 401) {
          message = 'Unauthorized. Please login again.';
        }
      }

      setFormError(message);
      onStatusChange?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Add New User</h2>
        <p className="text-gray-500 text-sm mt-1">Create a new stakeholder or participant account manually</p>
      </div>

      <div className="mb-6 px-4 py-3 rounded-lg bg-blue-50/50 border border-blue-100 text-[#253A7B] text-xs font-semibold uppercase tracking-wider flex items-center gap-3">
        <span className="w-2 h-2 bg-[#253A7B] rounded-full animate-pulse" />
        Verification Required: Initial login requires email & mobile OTP verification.
      </div>

      {formError && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wide">
          Error: {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={newUserForm.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 outline-none focus:border-[#253A7B] transition-all"
              placeholder="E.g. Rahul Sharma"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={newUserForm.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 outline-none focus:border-[#253A7B] transition-all"
              placeholder="rahul@example.com"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobile"
              value={newUserForm.mobile}
              onChange={handleInputChange}
              required
              pattern="[6-9][0-9]{9}"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 outline-none focus:border-[#253A7B] transition-all"
              placeholder="10-digit number"
            />
          </div>

          {/* Initial Password */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
              Initial Password
            </label>
            <input
              type="password"
              name="password"
              value={newUserForm.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 outline-none focus:border-[#253A7B] transition-all"
              placeholder="Secure password"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center gap-3 pt-6 border-t border-gray-50 flex-wrap">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-2.5 bg-[#253A7B] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {isSubmitting ? 'Adding User...' : 'Create Account'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-white text-gray-500 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
}
