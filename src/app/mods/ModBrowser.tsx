'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

// ===================================
// Types
// ===================================

interface ModReference {
    id: number;
    name: string;
    slug: string;
    summary: string;
    thumbnailUrl: string | null;
    downloadCount: number;
    rating: number;
    authors: string[];
    categories: string[];
    websiteUrl: string | null;
    latestVersion?: string;
    isServerPack?: boolean;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    iconUrl?: string;
    isClass?: boolean;
    parentCategoryId?: number | null;
}

// ===================================
// SVG Icons for Categories
// ===================================

const CategoryIcons: Record<string, React.ReactNode> = {
    'quality-of-life': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    ),
    'utility': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    ),
    'miscellaneous': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
        </svg>
    ),
    'gameplay': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 12h4M8 10v4M15 11h2M15 13h2" />
        </svg>
    ),
    'blocks': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
    'food-farming': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
            <path d="M12 6v6l4 2" />
        </svg>
    ),
    'world-gen': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    ),
    'library': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    'mods': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3l-1.912 5.813a2 2 0 01-1.275 1.275L3 12l5.813 1.912a2 2 0 011.275 1.275L12 21l1.912-5.813a2 2 0 011.275-1.275L21 12l-5.813-1.912a2 2 0 01-1.275-1.275L12 3z" />
        </svg>
    ),
    'prefabs': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
        </svg>
    ),
    'worlds': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    ),
    'bootstrap': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <path d="M7.5 4.21l4.5 2.6 4.5-2.6M7.5 19.79V14.6L3 12M21 12l-4.5 2.6v5.19M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
        </svg>
    ),
    'default': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
    ),
};

function getCategoryIcon(slug: string): React.ReactNode {
    const normalizedSlug = slug.toLowerCase().replace(/[\/\\]/g, '-').replace(/\s+/g, '-');
    return CategoryIcons[normalizedSlug] || CategoryIcons['default'];
}

// Category-specific colors
const CATEGORY_COLORS: Record<string, string> = {
    'quality-of-life': '#fbbf24',
    'utility': '#60a5fa',
    'miscellaneous': '#a78bfa',
    'gameplay': '#f472b6',
    'blocks': '#fb923c',
    'food-farming': '#4ade80',
    'world-gen': '#22d3ee',
    'library': '#c084fc',
    'mods': '#a855f7',
    'prefabs': '#f97316',
    'worlds': '#06b6d4',
    'bootstrap': '#8b5cf6',
    'default': '#94a3b8',
};

function getCategoryColor(slug: string): string {
    const normalizedSlug = slug.toLowerCase().replace(/[\/\\]/g, '-').replace(/\s+/g, '-');
    return CATEGORY_COLORS[normalizedSlug] || CATEGORY_COLORS['default'];
}

// ===================================
// Utility Functions
// ===================================

function formatDownloads(count: number): string {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
}

function debounce<T extends (...args: Parameters<T>) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ===================================
// Component
// ===================================

export default function ModBrowser() {
    const [mods, setMods] = useState<ModReference[]>([]);
    const [popularMods, setPopularMods] = useState<ModReference[]>([]);
    const [recentMods, setRecentMods] = useState<ModReference[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'popular' | 'recent' | 'search'>('popular');
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [activeCategoryName, setActiveCategoryName] = useState<string>('');
    const [stats, setStats] = useState({ totalMods: 0, totalDownloads: 0 });

    // Load initial data
    useEffect(() => {
        async function loadData() {
            try {
                setIsLoading(true);

                // Load mods and categories in parallel
                const [modsResponse, categoriesResponse] = await Promise.all([
                    fetch('/api/curseforge/featured?type=all&limit=40'),
                    fetch('/api/curseforge/categories'),
                ]);

                const modsData = await modsResponse.json();
                const categoriesData = await categoriesResponse.json();

                if (modsData.success) {
                    setPopularMods(modsData.popular || []);
                    setRecentMods(modsData.recent || []);
                    setMods(modsData.popular || []);

                    // Calculate stats
                    const allMods = [...(modsData.popular || []), ...(modsData.recent || [])];
                    const totalDownloads = allMods.reduce((sum, mod) => sum + mod.downloadCount, 0);
                    setStats({
                        totalMods: allMods.length,
                        totalDownloads,
                    });
                } else {
                    setError(modsData.error || 'Failed to load mods');
                }

                if (categoriesData.success && categoriesData.categories) {
                    // Show subcategories (not classes) for better mod filtering
                    // These have actual mods assigned to them
                    const subCategories = categoriesData.categories
                        .filter((cat: Category) => cat.isClass !== true)
                        .slice(0, 8);
                    setCategories(subCategories);
                }
            } catch (err) {
                console.error('Failed to load data:', err);
                setError('Failed to load mods. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    // Search mods
    const searchMods = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setActiveTab('popular');
                setActiveCategory(null);
                setActiveCategoryName('');
                setMods(popularMods);
                return;
            }

            setIsSearching(true);
            setActiveTab('search');
            setActiveCategory(null);
            setActiveCategoryName('');

            try {
                const response = await fetch(
                    `/api/curseforge/search?q=${encodeURIComponent(query)}&limit=40`
                );
                const data = await response.json();

                if (data.success) {
                    setMods(data.mods || []);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                console.error('Search error:', err);
                setError('Search failed');
            } finally {
                setIsSearching(false);
            }
        }, 400),
        [popularMods]
    );

    // Handle search input
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        searchMods(query);
    };

    // Handle tab change
    const handleTabChange = (tab: 'popular' | 'recent') => {
        setActiveTab(tab);
        setActiveCategory(null);
        setActiveCategoryName('');
        setSearchQuery('');
        setMods(tab === 'popular' ? popularMods : recentMods);
    };

    // Handle category selection - filter locally by category name
    const handleCategorySelect = (category: Category) => {
        if (activeCategory === category.id) {
            // Deselect
            setActiveCategory(null);
            setActiveCategoryName('');
            setMods(popularMods);
            setActiveTab('popular');
            return;
        }

        setActiveCategory(category.id);
        setActiveCategoryName(category.name);
        setActiveTab('popular');
        setSearchQuery('');

        // Filter mods locally by category name (case-insensitive match)
        const categoryNameLower = category.name.toLowerCase();
        const filteredMods = popularMods.filter(mod =>
            mod.categories.some(cat =>
                cat.toLowerCase().includes(categoryNameLower) ||
                categoryNameLower.includes(cat.toLowerCase())
            )
        );

        // Also check in recent mods if not enough results
        if (filteredMods.length < 10) {
            const moreFilteredMods = recentMods.filter(mod =>
                mod.categories.some(cat =>
                    cat.toLowerCase().includes(categoryNameLower) ||
                    categoryNameLower.includes(cat.toLowerCase())
                ) && !filteredMods.some(f => f.id === mod.id)
            );
            filteredMods.push(...moreFilteredMods);
        }

        setMods(filteredMods);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setActiveCategory(null);
        setActiveCategoryName('');
        setMods(popularMods);
        setActiveTab('popular');
    };

    return (
        <main className={styles.page}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroIcon}>🔧</div>
                    <h1 className={styles.heroTitle}>Hytale Mods</h1>
                    <p className={styles.heroSubtitle}>
                        Prozkoumejte stovky modů pro Hytale. Najděte perfektní rozšíření pro váš server
                        nebo zážitek ze hry.
                    </p>

                    {/* Stats */}
                    {stats.totalMods > 0 && (
                        <div className={styles.statsRow}>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>{stats.totalMods}+</span>
                                <span className={styles.statLabel}>Modů</span>
                            </div>
                            <div className={styles.statDivider} />
                            <div className={styles.stat}>
                                <span className={styles.statValue}>{formatDownloads(stats.totalDownloads)}</span>
                                <span className={styles.statLabel}>Stažení</span>
                            </div>
                            <div className={styles.statDivider} />
                            <div className={styles.stat}>
                                <span className={styles.statValue}>{categories.length}</span>
                                <span className={styles.statLabel}>Kategorií</span>
                            </div>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Hledat mody podle názvu..."
                            aria-label="Vyhledat mody"
                        />
                        {isSearching && <div className={styles.searchSpinner} />}
                    </div>

                    {/* CurseForge Attribution */}
                    <div className={styles.attribution}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        Powered by CurseForge API
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            {categories.length > 0 && (
                <section className={styles.categoriesSection}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>📂</span>
                        Populární kategorie
                    </h2>
                    <div className={styles.categoriesGrid}>
                        {categories.map(category => {
                            const color = getCategoryColor(category.slug);
                            return (
                                <button
                                    key={category.id}
                                    className={`${styles.categoryCard} ${activeCategory === category.id ? styles.categoryActive : ''}`}
                                    onClick={() => handleCategorySelect(category)}
                                    style={{
                                        '--category-color': color,
                                    } as React.CSSProperties}
                                >
                                    <span className={styles.categoryIcon} style={{ color }}>
                                        {getCategoryIcon(category.slug)}
                                    </span>
                                    <span className={styles.categoryName}>{category.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Tabs */}
            <section className={styles.tabsSection}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'popular' && !searchQuery && !activeCategory ? styles.activeTab : ''}`}
                        onClick={() => handleTabChange('popular')}
                    >
                        🔥 Populární
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'recent' && !searchQuery ? styles.activeTab : ''}`}
                        onClick={() => handleTabChange('recent')}
                    >
                        🆕 Nejnovější
                    </button>
                </div>

                {/* Active filters indicator */}
                {(searchQuery || activeCategory) && (
                    <div className={styles.activeFilters}>
                        {searchQuery && (
                            <span className={styles.filterBadge}>
                                🔍 "{searchQuery}"
                                <button onClick={() => { setSearchQuery(''); setMods(popularMods); setActiveTab('popular'); }}>×</button>
                            </span>
                        )}
                        {activeCategory && (
                            <span className={styles.filterBadge}>
                                📁 {activeCategoryName}
                                <button onClick={clearFilters}>×</button>
                            </span>
                        )}
                    </div>
                )}
            </section>

            {/* Error */}
            {error && (
                <div className={styles.error}>
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className={styles.loading}>
                    <div className={styles.loadingSpinner} />
                    <p>Načítám mody z CurseForge...</p>
                </div>
            ) : (
                /* Mods Grid */
                <>
                    <section className={styles.modsGrid}>
                        {isSearching ? (
                            <div className={styles.searchingState}>
                                <div className={styles.loadingSpinner} />
                                <p>Hledám mody...</p>
                            </div>
                        ) : mods.length === 0 ? (
                            <div className={styles.noResults}>
                                <span className={styles.noResultsIcon}>📭</span>
                                <h3>Žádné mody nenalezeny</h3>
                                <p>
                                    {activeCategory
                                        ? `V kategorii "${activeCategoryName}" zatím nejsou žádné mody.`
                                        : searchQuery
                                            ? `Pro "${searchQuery}" nebyly nalezeny žádné výsledky.`
                                            : 'Zkuste jiné vyhledávání.'
                                    }
                                </p>
                                <button className={styles.clearSearch} onClick={clearFilters}>
                                    Zobrazit všechny mody
                                </button>
                            </div>
                        ) : (
                            mods.map(mod => (
                                <article key={mod.id} className={styles.modCard} itemScope itemType="https://schema.org/SoftwareApplication">
                                    <div className={styles.modThumbnail}>
                                        {mod.thumbnailUrl ? (
                                            <Image
                                                src={mod.thumbnailUrl}
                                                alt={`${mod.name} mod thumbnail`}
                                                width={80}
                                                height={80}
                                                className={styles.modImage}
                                            />
                                        ) : (
                                            <div className={styles.modPlaceholder}>📦</div>
                                        )}
                                        {mod.isServerPack && (
                                            <span className={styles.serverPackBadge}>Server Pack</span>
                                        )}
                                    </div>

                                    <div className={styles.modContent}>
                                        <h3 className={styles.modName} itemProp="name">{mod.name}</h3>

                                        <p className={styles.modSummary} itemProp="description">
                                            {mod.summary.length > 100
                                                ? mod.summary.substring(0, 100) + '...'
                                                : mod.summary}
                                        </p>

                                        <div className={styles.modMeta}>
                                            <span className={styles.modDownloads} title="Počet stažení">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 16l-6-6h4V4h4v6h4l-6 6zM20 18H4v2h16v-2z" />
                                                </svg>
                                                <span itemProp="downloadCount">{formatDownloads(mod.downloadCount)}</span>
                                            </span>
                                            {mod.authors.length > 0 && (
                                                <span className={styles.modAuthors} title="Autor">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                    </svg>
                                                    <span itemProp="author">{mod.authors[0]}</span>
                                                </span>
                                            )}
                                        </div>

                                        {mod.categories.length > 0 && (
                                            <div className={styles.modCategories}>
                                                {mod.categories.slice(0, 2).map((cat, i) => (
                                                    <span
                                                        key={i}
                                                        className={styles.categoryTag}
                                                        itemProp="applicationCategory"
                                                        style={{
                                                            borderColor: getCategoryColor(cat),
                                                            color: getCategoryColor(cat),
                                                        }}
                                                    >
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {mod.websiteUrl && (
                                        <a
                                            href={mod.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.modLink}
                                            itemProp="url"
                                        >
                                            <span>Stáhnout na CurseForge</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                <polyline points="15 3 21 3 21 9" />
                                                <line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                        </a>
                                    )}

                                    {/* Hidden structured data */}
                                    <meta itemProp="operatingSystem" content="Hytale" />
                                    <meta itemProp="applicationCategory" content="Game Mod" />
                                </article>
                            ))
                        )}
                    </section>

                    {/* Show More */}
                    {mods.length > 0 && !isSearching && (
                        <div className={styles.showMoreSection}>
                            <p className={styles.showMoreText}>
                                Zobrazeno {mods.length} modů. Hledáte konkrétní mod?
                            </p>
                            <a
                                href="https://www.curseforge.com/hytale/mods"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.showMoreLink}
                            >
                                Zobrazit všechny mody na CurseForge →
                            </a>
                        </div>
                    )}
                </>
            )}

            {/* Info Section */}
            <section className={styles.infoSection}>
                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>🎮</div>
                    <h2>Jak přidat mody na server</h2>
                    <p>
                        Při registraci serveru můžete označit mody, které používáte.
                        Hráči pak snáze najdou servery s jejich oblíbenými mody.
                    </p>
                    <Link href="/submit" className={styles.ctaButton}>
                        Přidat server s mody
                    </Link>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>🔍</div>
                    <h2>Hledáte modované servery?</h2>
                    <p>
                        Prohlédněte si naši sekci modovaných serverů a najděte
                        komunitu hráčů se stejnými zájmy.
                    </p>
                    <Link href="/category/modded" className={styles.ctaButton}>
                        Modované servery
                    </Link>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>📖</div>
                    <h2>Průvodce instalací modů</h2>
                    <p>
                        Nevíte, jak nainstalovat mody? Náš návod vám pomůže
                        krok za krokem.
                    </p>
                    <Link href="/how-to-join" className={styles.ctaButton}>
                        Zobrazit návod
                    </Link>
                </div>
            </section>

            {/* SEO FAQ Section */}
            <section className={styles.faqSection} itemScope itemType="https://schema.org/FAQPage">
                <h2 className={styles.faqTitle}>Časté dotazy o Hytale modech</h2>

                <div className={styles.faqItem} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                    <h3 itemProp="name">Co jsou Hytale mody?</h3>
                    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                        <p itemProp="text">
                            Hytale mody jsou rozšíření hry, která přidávají nový obsah, funkce nebo mění herní mechaniky.
                            Mody mohou přidávat nové předměty, bytosti, biomy, nebo dokonce zcela nové herní režimy.
                        </p>
                    </div>
                </div>

                <div className={styles.faqItem} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                    <h3 itemProp="name">Kde stáhnout Hytale mody?</h3>
                    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                        <p itemProp="text">
                            Nejbezpečnější zdroj pro stahování Hytale modů je CurseForge. Na této stránce nabízíme
                            přehled dostupných modů s přímými odkazy na jejich stažení z ověřeného zdroje.
                        </p>
                    </div>
                </div>

                <div className={styles.faqItem} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                    <h3 itemProp="name">Jsou Hytale mody zdarma?</h3>
                    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                        <p itemProp="text">
                            Ano, většina Hytale modů na CurseForge je zcela zdarma. Tvůrci modů je vytvářejí
                            pro komunitu a sdílejí je bezplatně.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
