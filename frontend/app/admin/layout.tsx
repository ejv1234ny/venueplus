'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/agents', label: 'Agents' },
  { href: '/admin/runs', label: 'Runs' },
  { href: '/admin/escalations', label: 'Escalations' },
  { href: '/admin/marketplace', label: 'Marketplace' },
  { href: '/admin/payments', label: 'Payments' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-sm text-neutral-500">VenuePlus · Admin</p>
          <h1 className="text-3xl font-bold">Mission Control</h1>
          <nav className="mt-4 flex flex-wrap gap-1 border-b border-neutral-200">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-2 text-sm font-medium rounded-t-md -mb-px border-b-2 transition-colors ${
                  isActive(n.href)
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        {children}
      </div>
    </AdminGuard>
  );
}
