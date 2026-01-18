'use client';

import React from 'react';
import Image from 'next/image';
import styles from './ModList.module.css';

// ===================================
// Types
// ===================================

export interface ModReference {
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

interface ModListProps {
    mods: ModReference[];
    title?: string;
    showDetails?: boolean;
    maxVisible?: number;
    compact?: boolean;
}

interface ModBadgeProps {
    mod: ModReference;
    onClick?: () => void;
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

// ===================================
// ModBadge - Small Inline Badge
// ===================================

export function ModBadge({ mod, onClick }: ModBadgeProps) {
    const content = (
        <>
            {mod.thumbnailUrl ? (
                <Image
                    src={mod.thumbnailUrl}
                    alt={mod.name}
                    width={20}
                    height={20}
                    className={styles.badgeIcon}
                />
            ) : (
                <span className={styles.badgePlaceholder}>📦</span>
            )}
            <span className={styles.badgeName}>{mod.name}</span>
        </>
    );

    if (mod.websiteUrl) {
        return (
            <a
                href={mod.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.badge}
                onClick={onClick}
                title={mod.summary}
            >
                {content}
                <span className={styles.externalIcon}>↗</span>
            </a>
        );
    }

    return (
        <span className={styles.badge} title={mod.summary}>
            {content}
        </span>
    );
}

// ===================================
// ModCard - Detailed Card
// ===================================

function ModCard({ mod }: { mod: ModReference }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardThumbnail}>
                {mod.thumbnailUrl ? (
                    <Image
                        src={mod.thumbnailUrl}
                        alt={mod.name}
                        width={48}
                        height={48}
                        className={styles.cardImage}
                    />
                ) : (
                    <div className={styles.cardPlaceholder}>📦</div>
                )}
            </div>

            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <h4 className={styles.cardName}>{mod.name}</h4>
                    {mod.isServerPack && (
                        <span className={styles.serverPackTag}>Server Pack</span>
                    )}
                </div>

                <p className={styles.cardSummary}>{mod.summary}</p>

                <div className={styles.cardMeta}>
                    <span className={styles.cardDownloads}>
                        ⬇️ {formatDownloads(mod.downloadCount)}
                    </span>
                    {mod.authors.length > 0 && (
                        <span className={styles.cardAuthors}>
                            👤 {mod.authors.slice(0, 2).join(', ')}
                        </span>
                    )}
                    {mod.categories.length > 0 && (
                        <span className={styles.cardCategories}>
                            📁 {mod.categories[0]}
                        </span>
                    )}
                </div>
            </div>

            {mod.websiteUrl && (
                <a
                    href={mod.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.cardLink}
                    aria-label={`Zobrazit ${mod.name} na CurseForge`}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                </a>
            )}
        </div>
    );
}

// ===================================
// ModList - Main Component
// ===================================

export default function ModList({
    mods,
    title = 'Mody na serveru',
    showDetails = false,
    maxVisible = 10,
    compact = false,
}: ModListProps) {
    const [expanded, setExpanded] = React.useState(false);

    if (!mods || mods.length === 0) {
        return null;
    }

    const visibleMods = expanded ? mods : mods.slice(0, maxVisible);
    const hasMore = mods.length > maxVisible;

    return (
        <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
            {title && (
                <div className={styles.header}>
                    <h3 className={styles.title}>
                        <span className={styles.titleIcon}>🔧</span>
                        {title}
                    </h3>
                    <span className={styles.count}>{mods.length} modů</span>
                </div>
            )}

            {/* CurseForge Attribution */}
            <div className={styles.attribution}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Data z CurseForge
            </div>

            {showDetails ? (
                // Detailed card view
                <div className={styles.cardList}>
                    {visibleMods.map(mod => (
                        <ModCard key={mod.id} mod={mod} />
                    ))}
                </div>
            ) : (
                // Compact badge view
                <div className={styles.badgeList}>
                    {visibleMods.map(mod => (
                        <ModBadge key={mod.id} mod={mod} />
                    ))}
                </div>
            )}

            {hasMore && (
                <button
                    className={styles.showMore}
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? (
                        <>Zobrazit méně ↑</>
                    ) : (
                        <>Zobrazit všech {mods.length} modů ↓</>
                    )}
                </button>
            )}
        </div>
    );
}
