'use client';

import Link from 'next/link';

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-neutral-300 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-neutral-700 mb-2">{title}</h3>
      <p className="text-neutral-500 max-w-md mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
