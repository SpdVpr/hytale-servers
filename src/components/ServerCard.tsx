'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThumbsUp, ExternalLink, Star, CheckCircle, MessageCircle } from 'lucide-react';
import { Server, CATEGORY_INFO } from '@/lib/types';
import PingTest from './PingTest';
import styles from './ServerCard.module.css';

interface ServerCardProps {
    server: Server;
    rank?: number;
}

interface DiscordInfo {
    onlineMembers: number;
    available: boolean;
}

export default function ServerCard({ server, rank }: ServerCardProps) {
    const categoryInfo = CATEGORY_INFO[server.category];
    const [discordInfo, setDiscordInfo] = useState<DiscordInfo | null>(null);

    // Fetch Discord member count if server has discord link
    useEffect(() => {
        if (!server.discord) return;

        const fetchDiscord = async () => {
            try {
                const response = await fetch(`/api/discord?invite=${encodeURIComponent(server.discord!)}`);
                const data = await response.json();
                if (data.success && data.data) {
                    setDiscordInfo(data.data);
                }
            } catch (error) {
                // Ignore errors
            }
        };

        fetchDiscord();
    }, [server.discord]);

    const formatPlayers = (count: number): string => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    return (
        <article className={`glass-card ${styles.card} ${server.isFeatured ? styles.featured : ''}`}>
            {/* Rank Badge */}
            {rank && (
                <div className={styles.rankBadge}>
                    #{rank}
                </div>
            )}

            {/* Banner/Header */}
            <div className={styles.header}>
                <Link href={`/servers/${server.slug || server.id}`} className={styles.bannerLink}>
                    {server.banner ? (
                        <div className={styles.banner}>
                            <img
                                src={server.banner}
                                alt={`${server.name} banner`}
                                className={styles.bannerImage}
                                loading="lazy"
                                decoding="async"
                                width={400}
                                height={133}
                            />
                        </div>
                    ) : (
                        <div
                            className={styles.bannerPlaceholder}
                            style={{
                                background: `linear-gradient(135deg, ${categoryInfo.color}22, ${categoryInfo.color}44)`
                            }}
                        >
                            <span className={styles.categoryEmoji}>{categoryInfo.icon}</span>
                        </div>
                    )}
                </Link>

                {/* Featured/Verified Badges */}
                <div className={styles.badges}>
                    {server.isFeatured && (
                        <span className="badge badge-featured">
                            <Star size={12} />
                            Featured
                        </span>
                    )}
                    {server.isVerified && (
                        <span className="badge badge-verified">
                            <CheckCircle size={12} />
                            Verified
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Title & Category */}
                <div className={styles.titleRow}>
                    <Link href={`/servers/${server.slug || server.id}`} className={styles.title}>
                        {server.name}
                    </Link>
                    <span
                        className={styles.categoryTag}
                        style={{
                            background: `${categoryInfo.color}22`,
                            color: categoryInfo.color
                        }}
                    >
                        {categoryInfo.icon} {categoryInfo.label}
                    </span>
                </div>

                {/* Description */}
                <p className={styles.description}>
                    {server.shortDescription}
                </p>

                {/* IP Address */}
                <div className={styles.ipBox}>
                    <code className={styles.ip}>
                        {server.port === 5520 ? server.ip : `${server.ip}:${server.port}`}
                    </code>
                    <button
                        className={styles.copyButton}
                        onClick={() => navigator.clipboard.writeText(
                            server.port === 5520 ? server.ip : `${server.ip}:${server.port}`
                        )}
                        title="Copy IP"
                    >
                        Copy
                    </button>
                </div>

                {/* Stats Row */}
                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <Star size={16} className={styles.starIcon} />
                        <span className={styles.statValue}>
                            {server.averageRating ? server.averageRating.toFixed(1) : '—'}
                        </span>
                        <span className={styles.statLabel}>
                            {server.totalReviews ? `(${server.totalReviews})` : 'rating'}
                        </span>
                    </div>
                    <div className={styles.stat}>
                        <ThumbsUp size={16} />
                        <span className={styles.statValue}>
                            {formatPlayers(server.votes)}
                        </span>
                        <span className={styles.statLabel}>votes</span>
                    </div>
                    {discordInfo && discordInfo.available && discordInfo.onlineMembers > 0 && (
                        <div className={`${styles.stat} ${styles.discordStat}`}>
                            <MessageCircle size={16} />
                            <span className={styles.statValue}>
                                {formatPlayers(discordInfo.onlineMembers)}
                            </span>
                            <span className={styles.statLabel}>discord</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <Link href={`/servers/${server.slug || server.id}`} className="btn btn-primary">
                        View Server
                    </Link>

                    {/* 🎯 Compact Ping Test - Click to test */}
                    <PingTest
                        serverId={server.id}
                        serverIp={server.ip}
                        serverPort={server.port}
                        serverName={server.name}
                        compact={true}
                    />

                    {server.website && (
                        <a
                            href={server.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost"
                        >
                            <ExternalLink size={16} />
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
