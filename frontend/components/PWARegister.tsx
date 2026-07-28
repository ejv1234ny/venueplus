'use client';

import { useEffect } from 'react';

/** Registers the service worker so the app is installable (Add to Home Screen /
 *  Chrome install prompt). No-op in dev / unsupported browsers. */
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);
  return null;
}
