'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FiUser, FiMail, FiLock, FiPhone, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'renter',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      value: 'renter',
      title: 'Renter',
      description: 'Book venues and services for events',
      icon: '🎉',
    },
    {
      value: 'venue_owner',
      title: 'Venue Owner',
      description: 'List and rent out your space',
      icon: '🏢',
    },
    {
      value: 'service_provider',
      title: 'Service Provider',
      description: 'Offer services like cleaning, catering, DJ',
      icon: '🛠️',
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role: string) => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authAPI.register(registerData);
      const { access_token, user } = response.data;
      
      setAuth(user, access_token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">V+</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              VenuePlus
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-neutral-900">Create your account</h2>
          <p className="mt-2 text-neutral-600">Join VenuePlus today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                step >= 1 ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-600'
              }`}>
                {step > 1 ? <FiCheckCircle /> : '1'}
              </div>
              <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary-500' : 'bg-neutral-200'}`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                step >= 2 ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-600'
              }`}>
                2
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <div>
              <h3 className="text-xl font-semibold text-center mb-6">Choose your role</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    className="card p-6 text-center hover:scale-105 hover:border-2 hover:border-primary-500 transition-all cursor-pointer"
                  >
                    <div className="text-5xl mb-3">{role.icon}</div>
                    <h4 className="font-semibold text-lg mb-2">{role.title}</h4>
                    <p className="text-sm text-neutral-600">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-neutral-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="John"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-neutral-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone (optional)
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Creating account...' : 'Sign up'}
                </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
