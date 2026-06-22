import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthProvider';
import PayoutOnboardingBanner from '@/components/PayoutOnboardingBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://venueplus.vercel.app'),
  title: {
    default: 'VenuePlus - Event Venues & Services Marketplace',
    template: '%s | VenuePlus',
  },
  description: 'Book unique event spaces and essential services all in one place',
  applicationName: 'VenuePlus',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'VenuePlus',
    title: 'VenuePlus - Event Venues & Services Marketplace',
    description: 'Book unique event spaces and essential services all in one place',
    url: 'https://venueplus.vercel.app',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VenuePlus - Where Every Space Becomes an Event Venue',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VenuePlus - Event Venues & Services Marketplace',
    description: 'Book unique event spaces and essential services all in one place',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#007db1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
          <Navbar />
          <PayoutOnboardingBanner />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-neutral-900 text-white py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <Image
                      src="/venueplus-icon.png"
                      alt="VenuePlus"
                      width={40}
                      height={40}
                      className="h-10 w-10"
                    />
                    <span className="text-xl font-bold">VenuePlus</span>
                  </div>
                  <p className="text-neutral-400">
                    The easiest way to book unique spaces and essential services for your events.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">For Renters</h4>
                  <ul className="space-y-2 text-neutral-400">
                    <li><a href="/venues" className="hover:text-white">Browse Venues</a></li>
                    <li><a href="/services" className="hover:text-white">Find Services</a></li>
                    <li><a href="/bookings" className="hover:text-white">My Bookings</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">For Hosts</h4>
                  <ul className="space-y-2 text-neutral-400">
                    <li><a href="/host/venues" className="hover:text-white">List Your Space</a></li>
                    <li><a href="/services/create" className="hover:text-white">Offer Services</a></li>
                    <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Company</h4>
                  <ul className="space-y-2 text-neutral-400">
                    <li><a href="/about" className="hover:text-white">About</a></li>
                    <li><a href="/help" className="hover:text-white">Help Center</a></li>
                    <li><a href="/contact" className="hover:text-white">Contact</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
                <p>&copy; 2025 VenuePlus. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
