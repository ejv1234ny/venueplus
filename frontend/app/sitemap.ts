import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://venueplus.com';
  return [
    { url: `${base}/`,                   priority: 1.0 },
    { url: `${base}/search`,             priority: 0.9 },
    { url: `${base}/austin`,             priority: 0.9 },
    { url: `${base}/list-your-venue`,    priority: 0.8 },
    { url: `${base}/become-a-provider`,  priority: 0.8 },
    { url: `${base}/register`,           priority: 0.7 },
    { url: `${base}/login`,              priority: 0.5 },
    { url: `${base}/legal/terms`,        priority: 0.3 },
    { url: `${base}/legal/privacy`,      priority: 0.3 },
  ];
}
