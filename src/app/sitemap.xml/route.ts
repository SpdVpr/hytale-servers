import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORY_INFO, ServerCategory } from '@/lib/types';

const BASE_URL = 'https://www.hytaletop.fun';

function generateSitemapXML(urls: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: string;
    priority: number;
}>): string {
    const xmlUrls = urls.map(({ url, lastModified, changeFrequency, priority }) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${xmlUrls}
</urlset>`;
}

export async function GET() {
    try {
        // Static pages
        const staticPages = [
            {
                url: BASE_URL,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
            {
                url: `${BASE_URL}/servers`,
                lastModified: new Date(),
                changeFrequency: 'hourly',
                priority: 0.9,
            },
            {
                url: `${BASE_URL}/mods`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.85,
            },
            {
                url: `${BASE_URL}/top`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.8,
            },
            {
                url: `${BASE_URL}/how-to-join`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.8,
            },
            {
                url: `${BASE_URL}/submit`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            },
            {
                url: `${BASE_URL}/about`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            },
            {
                url: `${BASE_URL}/faq`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            },
        ];

        // Category pages
        const categoryPages = (Object.keys(CATEGORY_INFO) as ServerCategory[]).map(category => ({
            url: `${BASE_URL}/category/${category}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.85,
        }));

        // Dynamic server pages
        let serverPages: Array<{
            url: string;
            lastModified: Date;
            changeFrequency: string;
            priority: number;
        }> = [];

        try {
            const serversSnapshot = await getDocs(collection(db, 'servers'));

            serverPages = serversSnapshot.docs.map((doc) => {
                const data = doc.data();
                const slug = data.slug || doc.id;
                const updatedAt = data.updatedAt?.toDate?.() || new Date();

                return {
                    url: `${BASE_URL}/servers/${slug}`,
                    lastModified: updatedAt,
                    changeFrequency: 'daily',
                    priority: 0.7,
                };
            });
        } catch (error) {
            console.error('Error fetching servers for sitemap:', error);
        }

        const allUrls = [...staticPages, ...categoryPages, ...serverPages];
        const xmlContent = generateSitemapXML(allUrls);

        return new NextResponse(xmlContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}
