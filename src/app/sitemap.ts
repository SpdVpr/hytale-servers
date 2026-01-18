import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORY_INFO, ServerCategory } from '@/lib/types';

const BASE_URL = 'https://www.hytaletop.fun';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
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

    // Category pages - important for SEO
    const categoryPages: MetadataRoute.Sitemap = (Object.keys(CATEGORY_INFO) as ServerCategory[]).map(category => ({
        url: `${BASE_URL}/category/${category}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.85,
    }));

    // Dynamic server pages
    let serverPages: MetadataRoute.Sitemap = [];

    try {
        const serversSnapshot = await getDocs(collection(db, 'servers'));

        serverPages = serversSnapshot.docs.map((doc) => {
            const data = doc.data();
            const slug = data.slug || doc.id;
            const updatedAt = data.updatedAt?.toDate?.() || new Date();

            return {
                url: `${BASE_URL}/servers/${slug}`,
                lastModified: updatedAt,
                changeFrequency: 'daily' as const,
                priority: 0.7,
            };
        });
    } catch (error) {
        console.error('Error generating sitemap:', error);
    }

    return [...staticPages, ...categoryPages, ...serverPages];
}

