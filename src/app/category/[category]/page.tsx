import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Home, ChevronRight, ArrowRight } from 'lucide-react';
import { ServerCategory, CATEGORY_INFO } from '@/lib/types';
import { getServersByCategory, getCategoryStats } from '@/lib/server-fetcher';
import ServerCard from '@/components/ServerCard';
import styles from './page.module.css';

interface CategoryPageProps {
    params: Promise<{ category: string }>;
}

// SEO-optimized category descriptions
const CATEGORY_SEO: Record<ServerCategory, { title: string; description: string; keywords: string[] }> = {
    survival: {
        title: 'Hytale Survival Servers 2026 - Best PvE & Survival Servers',
        description: 'Browse the best Hytale survival servers with PvE gameplay, resource gathering, base building & exploration. Find servers with active communities and real-time player counts.',
        keywords: ['hytale survival servers', 'hytale pve', 'hytale survival multiplayer', 'hytale base building'],
    },
    pvp: {
        title: 'Hytale PvP Servers 2026 - Best Combat & Faction Servers',
        description: 'Find the best Hytale PvP servers for combat, faction wars, arena battles & competitive gameplay. Real-time status, player counts & community reviews.',
        keywords: ['hytale pvp servers', 'hytale combat', 'hytale faction servers', 'hytale arena'],
    },
    minigames: {
        title: 'Hytale Minigames Servers 2026 - SkyWars, BedWars & More',
        description: 'Discover the best Hytale minigames servers featuring SkyWars, BedWars, parkour, hide and seek & more.',
        keywords: ['hytale minigames', 'hytale skywars', 'hytale bedwars', 'hytale parkour'],
    },
    roleplay: {
        title: 'Hytale Roleplay Servers 2026 - Best RP & Story Servers',
        description: 'Join immersive Hytale roleplay servers with jobs, economy, storytelling & character development.',
        keywords: ['hytale roleplay servers', 'hytale rp', 'hytale rp servers', 'hytale story servers'],
    },
    creative: {
        title: 'Hytale Creative Servers 2026 - Building & Creation Servers',
        description: 'Explore Hytale creative servers for unlimited building, artistic creation & collaborative projects.',
        keywords: ['hytale creative servers', 'hytale building', 'hytale creative mode'],
    },
    economy: {
        title: 'Hytale Economy Servers 2026 - Trading & Commerce Servers',
        description: 'Trade, shop & build wealth on Hytale economy servers with player-run markets and auctions.',
        keywords: ['hytale economy servers', 'hytale trading', 'hytale shops'],
    },
    adventure: {
        title: 'Hytale Adventure Servers 2026 - Quests & Dungeon Servers',
        description: 'Embark on epic adventures in Hytale adventure servers with quests, dungeons & boss fights.',
        keywords: ['hytale adventure servers', 'hytale quests', 'hytale dungeons'],
    },
    skyblock: {
        title: 'Hytale Skyblock Servers 2026 - Best Island Survival Servers',
        description: 'Start from nothing on Hytale skyblock servers. Expand your island and complete challenges.',
        keywords: ['hytale skyblock', 'hytale island servers', 'hytale skyblock servers'],
    },
    modded: {
        title: 'Hytale Modded Servers 2026 - Custom Mods & Plugins',
        description: 'Experience Hytale with mods! Browse modded servers featuring custom plugins and new items.',
        keywords: ['hytale modded servers', 'hytale mods', 'hytale plugins'],
    },
    other: {
        title: 'Hytale Servers 2026 - Unique & Miscellaneous Servers',
        description: 'Discover unique Hytale servers that don\'t fit standard categories.',
        keywords: ['hytale servers', 'hytale unique servers'],
    },
};

function isValidCategory(category: string): category is ServerCategory {
    return Object.keys(CATEGORY_INFO).includes(category);
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { category } = await params;

    if (!isValidCategory(category)) {
        return { title: 'Category Not Found' };
    }

    const seo = CATEGORY_SEO[category];
    return {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        openGraph: {
            title: seo.title,
            description: seo.description,
            url: `https://www.hytaletop.fun/category/${category}`,
        },
        alternates: {
            canonical: `https://www.hytaletop.fun/category/${category}`,
        },
    };
}

export async function generateStaticParams() {
    return Object.keys(CATEGORY_INFO).map((category) => ({ category }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category } = await params;

    if (!isValidCategory(category)) {
        notFound();
    }

    const servers = await getServersByCategory(category);
    const categoryStats = await getCategoryStats();
    const categoryInfo = CATEGORY_INFO[category];
    const seo = CATEGORY_SEO[category];

    const otherCategories = (Object.entries(CATEGORY_INFO) as [ServerCategory, typeof CATEGORY_INFO[ServerCategory]][])
        .filter(([key]) => key !== category)
        .slice(0, 6);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                'name': `${categoryInfo.label} Hytale Servers`,
                'description': seo.description,
                'url': `https://www.hytaletop.fun/category/${category}`,
            },
            {
                '@type': 'ItemList',
                'name': `Best Hytale ${categoryInfo.label} Servers`,
                'numberOfItems': servers.length,
                'itemListElement': servers.slice(0, 10).map((server, index) => ({
                    '@type': 'ListItem',
                    'position': index + 1,
                    'item': {
                        '@type': 'GameServer',
                        'name': server.name,
                        'url': `https://www.hytaletop.fun/servers/${server.slug}`,
                    },
                })),
            },
            {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.hytaletop.fun' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Servers', 'item': 'https://www.hytaletop.fun/servers' },
                    { '@type': 'ListItem', 'position': 3, 'name': `${categoryInfo.label} Servers`, 'item': `https://www.hytaletop.fun/category/${category}` },
                ],
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className={styles.page}>
                <div className="container">
                    <nav className={styles.breadcrumb}>
                        <Link href="/"><Home size={14} /> Home</Link>
                        <ChevronRight size={14} />
                        <Link href="/servers">Servers</Link>
                        <ChevronRight size={14} />
                        <span>{categoryInfo.label}</span>
                    </nav>

                    <header className={styles.hero}>
                        <div className={styles.heroBadge} style={{ background: `${categoryInfo.color}22`, color: categoryInfo.color }}>
                            {categoryInfo.icon} {categoryInfo.label} Servers
                        </div>
                        <h1>Best Hytale <span style={{ color: categoryInfo.color }}>{categoryInfo.label}</span> Servers</h1>
                        <p>{seo.description}</p>
                        <div className={styles.stats}>
                            <div><strong>{servers.length}</strong> servers</div>
                            <div><strong>{servers.reduce((sum, s) => sum + s.currentPlayers, 0)}</strong> players online</div>
                        </div>
                    </header>

                    {servers.length > 0 ? (
                        <div className={styles.serverGrid}>
                            {servers.map((server, index) => (
                                <ServerCard key={server.id} server={server} rank={index + 1} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <span>{categoryInfo.icon}</span>
                            <h2>No {categoryInfo.label} servers yet</h2>
                            <Link href="/submit" className="btn btn-primary">Add Your Server</Link>
                        </div>
                    )}

                    <section className={styles.otherCategories}>
                        <h2>Browse Other Categories</h2>
                        <div className={styles.categoryGrid}>
                            {otherCategories.map(([key, info]) => (
                                <Link key={key} href={`/category/${key}`} className={styles.categoryCard}>
                                    <span>{info.icon}</span>
                                    <div>
                                        <h3>{info.label}</h3>
                                        <span>{categoryStats[key]} servers</span>
                                    </div>
                                    <ArrowRight size={16} />
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
