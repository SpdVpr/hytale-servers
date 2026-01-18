// ===================================
// MODS PAGE - Browse Hytale Mods
// SEO Optimized with Structured Data
// ===================================

import { Metadata } from 'next';
import ModBrowser from './ModBrowser';

export const metadata: Metadata = {
    title: 'Hytale Mods | Stáhnout Mody pro Hytale & Servery | HytaleTop',
    description: 'Prozkoumejte 100+ Hytale modů zdarma. Vyberte si z kategorií Magic, Technology, Adventure a dalších. Stáhněte mody z CurseForge a rozšiřte svůj Hytale zážitek.',
    keywords: [
        'hytale mody',
        'hytale mods',
        'hytale mod download',
        'stáhnout hytale mody',
        'hytale modding',
        'hytale server mody',
        'curseforge hytale',
        'hytale magic mody',
        'hytale technology mody',
        'nejlepší hytale mody',
        'hytale mod instalace',
        'hytale rozšíření',
    ],
    openGraph: {
        title: 'Hytale Mods | 100+ Modů Zdarma | HytaleTop',
        description: 'Kompletní přehled Hytale modů. Vyberte si z Magic, Technology, Adventure kategorií. Bezplatné stažení z CurseForge.',
        type: 'website',
        url: 'https://www.hytaletop.fun/mods',
        images: [
            {
                url: '/og-mods.png',
                width: 1200,
                height: 630,
                alt: 'Hytale Mods Browser',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Hytale Mods | 100+ Modů Zdarma',
        description: 'Kompletní přehled Hytale modů. Magic, Technology, Adventure a další kategorie.',
    },
    alternates: {
        canonical: 'https://www.hytaletop.fun/mods',
    },
    robots: {
        index: true,
        follow: true,
    },
};

// JSON-LD Structured Data
function generateStructuredData() {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Hytale Mods Directory',
        description: 'Browse and download Hytale mods from CurseForge. Find popular mods for Magic, Technology, Adventure and more.',
        url: 'https://www.hytaletop.fun/mods',
        mainEntity: {
            '@type': 'ItemList',
            name: 'Hytale Mods',
            description: 'Collection of Hytale game modifications',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Popular Mods',
                    url: 'https://www.hytaletop.fun/mods#popular',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Recent Mods',
                    url: 'https://www.hytaletop.fun/mods#recent',
                },
            ],
        },
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://www.hytaletop.fun',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Mods',
                    item: 'https://www.hytaletop.fun/mods',
                },
            ],
        },
        publisher: {
            '@type': 'Organization',
            name: 'HytaleTop.fun',
            url: 'https://www.hytaletop.fun',
        },
    };
}

export default function ModsPage() {
    return (
        <>
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateStructuredData()),
                }}
            />
            <ModBrowser />
        </>
    );
}
