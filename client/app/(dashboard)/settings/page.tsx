'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Save, CheckCircle, AlertTriangle, Upload, Loader2, Pencil, X, Camera } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [profile, setProfile] = useState({ name: '', email: '', avatar: '' });
  const [editing, setEditing] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProfile(); }, []);

  const getToken = () => localStorage.getItem('token');

  const fetchProfile = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProfile({
          name: data.data.name || '',
          email: data.data.email || '',
          avatar: data.data.avatar || '',
        });
      }
    } catch (err) { console.error(err); }
    finally { setPageLoading(false); }
  };

  const showMessage = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 5000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
  };

  // ============ PHOTO UPLOAD ============
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showMessage('File size must be less than 2MB', true);
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      showMessage('Only image files are allowed', true);
      return;
    }

    setUploadingPhoto(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        const token = getToken();
        const res = await fetch(`${API_URL}/auth/avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ avatar: base64 }),
        });
        
        const data = await res.json();
        if (data.success) {
          setProfile(prev => ({ ...prev, avatar: base64 }));
          showMessage('Photo uploaded successfully!');
        } else {
          showMessage(data.error || 'Failed to upload', true);
        }
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showMessage('Failed to upload photo', true);
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const token = getToken();
      await fetch(`${API_URL}/auth/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar: '' }),
      });
      setProfile(prev => ({ ...prev, avatar: '' }));
      showMessage('Photo removed');
    } catch (err) {
      showMessage('Failed to remove photo', true);
    }
  };

  // ============ UPDATE PROFILE ============
  const handleUpdateProfile = async () => {
    if (!profile.name || !profile.email) {
      showMessage('Name and email are required', true);
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      showMessage('Profile updated!');
      setEditing(false);
    } catch (err: any) { showMessage(err.message, true); }
    finally { setLoading(false); }
  };

  // ============ UPDATE PASSWORD ============
  const handleUpdatePassword = async () => {
    if (!passwords.current) { showMessage('Current password is required', true); return; }
    if (passwords.new !== passwords.confirm) { showMessage('Passwords do not match', true); return; }
    if (passwords.new.length < 6) { showMessage('Min 6 characters required', true); return; }

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      showMessage('Password changed!');
      setPasswords({ current: '', new: '', confirm: '' });
      setShowPasswordForm(false);
    } catch (err: any) { showMessage(err.message, true); }
    finally { setLoading(false); }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-whatsapp-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your account</p>
      </div>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5" /> Profile
          </h2>
          <Button size="sm" variant={editing ? 'ghost' : 'outline'}
            icon={editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {/* Avatar Upload */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="relative group">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="w-20 h-20 bg-whatsapp-green/10 rounded-full flex items-center justify-center border-2 border-gray-200">
                <span className="text-2xl font-bold text-whatsapp-green">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              <Camera className="h-6 w-6 text-white" />
            </div>
            {uploadingPhoto && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            <Button variant="outline" size="sm" icon={<Upload className="h-4 w-4" />}
              onClick={() => fileInputRef.current?.click()}
              loading={uploadingPhoto}>
              Upload Photo
            </Button>
            {profile.avatar && (
              <button onClick={handleRemovePhoto} className="block text-xs text-red-500 mt-1 hover:underline">
                Remove photo
              </button>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">JPG or PNG. Max 2MB.</p>
          </div>
        </div>

        {editing ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              <Input label="Email Address" type="email" value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <div className="mt-4">
              <Button onClick={handleUpdateProfile} loading={loading} icon={<Save className="h-4 w-4" />}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div><p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Name</p><p className="text-gray-900 dark:text-white font-medium">{profile.name || 'Not set'}</p></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Email</p><p className="text-gray-900 dark:text-white font-medium">{profile.email || 'Not set'}</p></div>
          </div>
        )}
      </Card>

      {/* Password Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="h-5 w-5" /> Password
          </h2>
          <Button size="sm" variant={showPasswordForm ? 'ghost' : 'outline'}
            icon={showPasswordForm ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            onClick={() => setShowPasswordForm(!showPasswordForm)}>
            {showPasswordForm ? 'Cancel' : 'Change'}
          </Button>
        </div>

        {showPasswordForm ? (
          <div className="space-y-4 max-w-md">
            <Input label="Current Password" type="password" value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
            <Input label="New Password" type="password" value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
            <Input label="Confirm New Password" type="password" value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
            <Button onClick={handleUpdatePassword} loading={loading}>Update Password</Button>
          </div>
        ) : (
          <p className="text-gray-900 dark:text-white font-medium">â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢</p>
        )}
      </Card>
    </div>
  );
}
