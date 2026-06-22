'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for debugging; wire to telemetry later.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <p className="text-5xl font-bold text-primary-600">Oops</p>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Something went wrong</h1>
        <p className="mt-2 text-neutral-600">
          An unexpected error occurred. You can try again, or head back home.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-outline">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
