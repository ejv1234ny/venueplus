import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <Image
          src="/venueplus-icon.png"
          alt="VenuePlus"
          width={64}
          height={64}
          className="mx-auto mb-6 h-16 w-16"
        />
        <p className="text-6xl font-bold text-primary-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Page not found</h1>
        <p className="mt-2 text-neutral-600">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Back home
          </Link>
          <Link href="/venues" className="btn-outline">
            Browse venues
          </Link>
        </div>
      </div>
    </div>
  );
}
