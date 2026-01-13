import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/preview/', '/result/', '/upload/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/preview/', '/result/', '/upload/'],
            },
        ],
        sitemap: 'https://aurapalette.com.br/sitemap.xml',
    };
}
