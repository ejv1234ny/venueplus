'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/';
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    `font-medium transition-colors ${
      isActive(href) ? 'text-primary-600' : 'text-neutral-700 hover:text-primary-600'
    }`;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="VenuePlus home">
            <Image
              src="/venueplus-logo-transparent.png"
              alt="VenuePlus"
              width={176}
              height={48}
              priority
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/venues" className={linkClass('/venues')} aria-current={isActive('/venues') ? 'page' : undefined}>
              Venues
            </Link>
            <Link href="/services" className={linkClass('/services')} aria-current={isActive('/services') ? 'page' : undefined}>
              Services
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/bookings" className={linkClass('/bookings')} aria-current={isActive('/bookings') ? 'page' : undefined}>
                  My Bookings
                </Link>
                {user?.role === 'venue_owner' && (
                  <Link href="/host/venues" className={linkClass('/host/venues')} aria-current={isActive('/host/venues') ? 'page' : undefined}>
                    My Venues
                  </Link>
                )}
                {user?.role === 'service_provider' && (
                  <Link href="/services/my" className={linkClass('/services/my')} aria-current={isActive('/services/my') ? 'page' : undefined}>
                    My Services
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
                    aria-label="Account menu"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50" role="menu">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                        onClick={() => setUserMenuOpen(false)}
                        role="menuitem"
                      >
                        <FiUser className="mr-2" /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                        role="menuitem"
                      >
                        <FiLogOut className="mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className={linkClass('/login')} aria-current={isActive('/login') ? 'page' : undefined}>
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
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-neutral-200">
            <div className="flex flex-col space-y-4">
              <Link href="/venues" className={linkClass('/venues')} onClick={() => setMobileMenuOpen(false)}>
                Venues
              </Link>
              <Link href="/services" className={linkClass('/services')} onClick={() => setMobileMenuOpen(false)}>
                Services
              </Link>

              {isAuthenticated ? (
                <>
                  <Link href="/bookings" className={linkClass('/bookings')} onClick={() => setMobileMenuOpen(false)}>
                    My Bookings
                  </Link>
                  {user?.role === 'venue_owner' && (
                    <Link href="/host/venues" className={linkClass('/host/venues')} onClick={() => setMobileMenuOpen(false)}>
                      My Venues
                    </Link>
                  )}
                  {user?.role === 'service_provider' && (
                    <Link href="/services/my" className={linkClass('/services/my')} onClick={() => setMobileMenuOpen(false)}>
                      My Services
                    </Link>
                  )}
                  <Link href="/profile" className={linkClass('/profile')} onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="text-left text-neutral-700 hover:text-primary-600 font-medium">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={linkClass('/login')} onClick={() => setMobileMenuOpen(false)}>
                    Log in
                  </Link>
                  <Link href="/register" className="btn-primary text-center" onClick={() => setMobileMenuOpen(false)}>
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
