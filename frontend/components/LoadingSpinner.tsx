'use client';

export default function LoadingSpinner({ size = 'md', message }: { size?: 'sm' | 'md' | 'lg'; message?: string }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizeClasses[size]} border-4 border-neutral-200 border-t-primary-500 rounded-full animate-spin`}
      />
      {message && <p className="mt-4 text-neutral-600">{message}</p>}
    </div>
  );
}
