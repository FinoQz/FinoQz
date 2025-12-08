'use client';

import React, { useState } from 'react';
import ProfileCard from '../components/profile/ProfileCard';
import PersonalInfoSection from '../components/profile/PersonalInfoSection';
import AccountDetailsSection from '../components/profile/AccountDetailsSection';
import ProfileActions from '../components/profile/ProfileActions';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import DeleteAccountModal from '../components/profile/DeleteAccountModal';
import Toast from '../components/profile/Toast';

export default function Profile() {
  // Initial User Data
  const initialUserData = {
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    city: 'Mumbai',
    country: 'India',
    dateOfBirth: '1995-05-15',
    gender: 'Male',
    bio: 'Passionate learner exploring the world of finance and investment. Love taking quizzes to test my knowledge!',
    profileImage: undefined
  };

  const [userData, setUserData] = useState(initialUserData);

  // Account Data (simplified)
  const [accountData] = useState({
    accountCreated: 'January 15, 2024',
    lastLogin: 'November 24, 2025, 10:30 AM'
  });

  // Preferences (future use)
  const [preferences, setPreferences] = useState({
    quizReminders: true,
    newQuizAlerts: true,
    certificateUpdates: false,
    darkMode: false,
    language: 'en'
  });

  // Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  // Form Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handlers
  const handlePersonalInfoChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePreferenceToggle = (field: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleLanguageChange = (value: string) => {
    setPreferences(prev => ({ ...prev, language: value }));
  };

  const handleImageUpload = (file: File) => {
    console.log('Image uploaded:', file.name);
    showToast('success', 'Profile image updated successfully!');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!userData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!userData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast('error', 'Please fix the errors before saving');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('success', 'Profile updated successfully!');
    }, 1500);
  };

  const handleCancel = () => {
    setUserData(initialUserData);
    showToast('warning', 'Changes cancelled');
  };

  const handleChangePassword = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    console.log('Password change requested:', data);
    showToast('success', 'Password updated successfully!');
  };

  const handleDeleteAccount = () => {
    console.log('Account deletion requested');
    showToast('success', 'Account deleted successfully');
  };

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ show: true, type, message });
  };

  const hideToast = () => {
    setToast({ show: false, type: 'success', message: '' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Side - Profile Card */}
        <div className="lg:col-span-1">
          <ProfileCard
            userData={userData}
            onImageUpload={handleImageUpload}
            onEditProfile={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            onChangePassword={() => setShowPasswordModal(true)}
          />
        </div>

        {/* Right Side - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <PersonalInfoSection
            formData={userData}
            onChange={handlePersonalInfoChange}
            errors={errors}
          />

          {/* Account Details */}
          <AccountDetailsSection accountData={accountData} />

          {/* Action Buttons */}
          <ProfileActions
            onSave={handleSave}
            onCancel={handleCancel}
            onDeleteAccount={() => setShowDeleteModal(true)}
            isSaving={isSaving}
          />
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
