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
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-[#253A7B] mb-6">Add New User</h2>

      <div className="mb-4 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm">
        Users created here can login only after verifying both email and mobile OTP.
      </div>

      {formError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-sm font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="mobile"
              value={newUserForm.mobile}
              onChange={handleInputChange}
              required
              pattern="[6-9][0-9]{9}"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              placeholder="10-digit mobile number"
            />
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

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 sm:flex-none px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] shadow-lg hover:shadow-xl transition-all duration-300 font-medium ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
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
