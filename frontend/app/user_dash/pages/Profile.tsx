'use client';

import React, { useEffect, useState } from 'react';
import apiUser from '@/lib/apiUser';
import ProfileCard from '../components/profile/ProfileCard';
import PersonalInfoSection from '../components/profile/PersonalInfoSection';
import AccountDetailsSection from '../components/profile/AccountDetailsSection';
import ProfileActions from '../components/profile/ProfileActions';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import DeleteAccountModal from '../components/profile/DeleteAccountModal';
import Toast from '../components/profile/Toast';

export default function Profile() {
  interface UserData {
    fullName: string;
    email: string;
    phone: string;
    mobile: string;
    city?: string;
    country?: string;
    profileImage?: string;
    createdAt: string;
    lastLoginAt?: string;
    dateOfBirth: string;
    gender: string;
    bio: string;
    // Add other fields as needed
    [key: string]: unknown;
  }

  const [userData, setUserData] = useState<UserData | null>({
    fullName: '',
    email: '',
    phone: '',
    mobile: '',
    city: '',
    country: '',
    profileImage: '',
    createdAt: '',
    lastLoginAt: '',
    dateOfBirth: '',
    gender: '',
    bio: '',
  });
  const [accountData, setAccountData] = useState<{ accountCreated: string; lastLogin: string }>({
    accountCreated: '',
    lastLogin: ''
  });

  const [preferences, setPreferences] = useState({
    quizReminders: true,
    newQuizAlerts: true,
    certificateUpdates: false,
    darkMode: false,
    language: 'en'
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Fetch user profile on mount
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await apiUser.get('api/user/profile/me'); // ✅ No headers needed

      if (res.status === 200 && res.data.user) {
        const user = res.data.user;
        setUserData((prev) => ({
          ...prev,
          ...user,
          phone: user.phone ?? user.mobile ?? '',
          dateOfBirth: user.dateOfBirth ?? '',
          gender: user.gender ?? '',
          bio: user.bio ?? '',
        }));
        setAccountData({
          accountCreated: new Date(user.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          lastLogin: user.lastLoginAt
            ? new Date(user.lastLoginAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
            : 'N/A',
        });
      }
    } catch (err) {
      console.error('❌ Failed to fetch profile:', err);
      showToast('error', 'Failed to load profile');
    }
  };

  fetchProfile();
}, []);


  const handlePersonalInfoChange = (field: string, value: string) => {
    setUserData((prev: UserData | null) => prev ? { ...prev, [field]: value } : prev);
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

  const handleImageUpload = async (file: File) => {
  try {
    const uploadRes = await uploadToCloud(file);
    const imageUrl = uploadRes.secure_url;

    const res = await apiUser.post('api/user/profile/me/profile-image', { url: imageUrl });

    if (res.status === 200) {
      setUserData((prev: UserData | null) =>
        prev ? { ...prev, profileImage: res.data.profileImage } : prev
      );
      showToast('success', 'Profile image updated successfully!');
    }
  } catch (err) {
    console.error('❌ Image upload failed:', err);
    showToast('error', 'Image upload failed');
  }
};


  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!userData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!userData?.mobile?.trim()) {
      newErrors.mobile = 'Phone number is required';
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
  try {
    const res = await apiUser.patch('api/user/profile/me', userData);

    if (res.status === 200) {
      setUserData(res.data.user);
      showToast('success', 'Profile updated successfully!');
    } else {
      showToast('error', 'Failed to update profile');
    }
  } catch (err) {
    console.error('❌ Error saving profile:', err);
    showToast('error', 'Something went wrong');
  } finally {
    setIsSaving(false);
  }
};


  const handleCancel = () => {
    window.location.reload(); // reload to refetch original data
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

  if (!userData) {
    return <div className="p-6 text-gray-600">Loading profile...</div>;
  }

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
          <PersonalInfoSection
            formData={{
              ...userData,
              city: userData.city ?? '',
              country: userData.country ?? ''
            }}
            onChange={handlePersonalInfoChange}
            errors={errors}
          />

          <AccountDetailsSection accountData={accountData} />

          <ProfileActions
            onSave={handleSave}
            onCancel={handleCancel}
            onDeleteAccount={() => setShowDeleteModal(true)}
            isSaving={isSaving}
          />
        </div>
      </div>

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
async function uploadToCloud(file: File): Promise<{ secure_url: string }> {
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!UPLOAD_PRESET) {
    throw new Error('Missing Cloudinary upload preset');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error('No secure_url returned from upload');
  }

  return { secure_url: data.secure_url };
}


