'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUser, FiMail, FiPhone, FiEdit2, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { usersAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';

function ProfileContent() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await usersAPI.updateMe(formData);
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <LoadingSpinner />;

  const roleLabels: Record<string, string> = {
    renter: 'Renter',
    venue_owner: 'Venue Owner',
    service_provider: 'Service Provider',
    admin: 'Admin',
  };

  const quickLinks: Record<string, Array<{ label: string; href: string }>> = {
    renter: [
      { label: 'My Bookings', href: '/bookings' },
      { label: 'Browse Venues', href: '/venues' },
    ],
    venue_owner: [
      { label: 'My Venues', href: '/host/venues' },
      { label: 'Create Venue', href: '/host/venues/create' },
      { label: 'My Bookings', href: '/bookings' },
    ],
    service_provider: [
      { label: 'My Services', href: '/services/my' },
      { label: 'Create Service', href: '/services/create' },
    ],
  };

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {user.first_name} {user.last_name}
              </h1>
              <div className="flex items-center text-neutral-500 mt-1">
                <FiMail className="mr-2" size={14} />
                <span>{user.email}</span>
              </div>
              <span className="inline-block mt-2 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
                {roleLabels[user.role] || user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">Profile Details</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-outline flex items-center text-sm px-4 py-2">
                <FiEdit2 className="mr-2" size={14} /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="555-123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                    if (user) {
                      setFormData({
                        first_name: user.first_name || '',
                        last_name: user.last_name || '',
                        phone: user.phone || '',
                        bio: user.bio || '',
                      });
                    }
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-neutral-500">First Name</span>
                  <p className="font-medium text-neutral-900">{user.first_name}</p>
                </div>
                <div>
                  <span className="text-sm text-neutral-500">Last Name</span>
                  <p className="font-medium text-neutral-900">{user.last_name}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-neutral-500">Phone</span>
                <p className="font-medium text-neutral-900">{user.phone || 'Not set'}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">Bio</span>
                <p className="font-medium text-neutral-900">{user.bio || 'No bio yet'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(quickLinks[user.role] || []).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <span className="text-neutral-700 font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
