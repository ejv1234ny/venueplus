'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V+</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              VenuePlus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/venues" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              Venues
            </Link>
            <Link href="/services" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              Services
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/bookings" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
                  My Bookings
                </Link>
                {user?.role === 'venue_owner' && (
                  <Link href="/host/venues" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
                    My Venues
                  </Link>
                )}
                {user?.role === 'service_provider' && (
                  <Link href="/services/my" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
                    My Services
                  </Link>
                )}
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiUser className="mr-2" /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                      >
                        <FiLogOut className="mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200">
            <div className="flex flex-col space-y-4">
              <Link href="/venues" className="text-neutral-700 hover:text-primary-600 font-medium">
                Venues
              </Link>
              <Link href="/services" className="text-neutral-700 hover:text-primary-600 font-medium">
                Services
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link href="/bookings" className="text-neutral-700 hover:text-primary-600 font-medium">
                    My Bookings
                  </Link>
                  {user?.role === 'venue_owner' && (
                    <Link href="/host/venues" className="text-neutral-700 hover:text-primary-600 font-medium">
                      My Venues
                    </Link>
                  )}
                  {user?.role === 'service_provider' && (
                    <Link href="/services/my" className="text-neutral-700 hover:text-primary-600 font-medium">
                      My Services
                    </Link>
                  )}
                  <Link href="/profile" className="text-neutral-700 hover:text-primary-600 font-medium">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="text-left text-neutral-700 hover:text-primary-600 font-medium">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-neutral-700 hover:text-primary-600 font-medium">
                    Log in
                  </Link>
                  <Link href="/register" className="btn-primary text-center">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
