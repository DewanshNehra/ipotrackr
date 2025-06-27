import { MetadataRoute } from 'next';
import { fetchIPOData } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ipotrackr.davincin.eu.org';
  const ipoData = await fetchIPOData();
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Dynamic IPO pages (if you add individual IPO pages later)
  const ipoPages = ipoData.map(ipo => ({
    url: `${baseUrl}/ipo/${ipo.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...ipoPages];
}
