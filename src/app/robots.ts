import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/my-servers',
                    '/profile',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/api/',
                    '/my-servers',
                    '/profile',
                ],
            },
        ],
        sitemap: 'https://www.hytaletop.fun/sitemap.xml',
        host: 'https://www.hytaletop.fun',
    };
}
