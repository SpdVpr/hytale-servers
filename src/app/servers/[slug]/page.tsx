'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ThumbsUp, Globe,
    ExternalLink, Star, CheckCircle,
    ArrowLeft
} from 'lucide-react';
import { Server, CATEGORY_INFO } from '@/lib/types';
import VoteButton from '@/components/VoteButton';
import VoteHistory from '@/components/VoteHistory';
import ServerOwnerActions from '@/components/ServerOwnerActions';
import {
    IPBoxClient,
    DiscordBadgeWrapper,
    PingTestWrapper,
    ReviewsSection
} from './ClientComponents';
import styles from './page.module.css';

interface ServerPageProps {
    params: Promise<{ slug: string }>;
}

export default function ServerPage({ params }: ServerPageProps) {
    const [server, setServer] = useState<Server | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [slug, setSlug] = useState<string>('');

    useEffect(() => {
        const loadServer = async () => {
            try {
                const resolvedParams = await params;
                setSlug(resolvedParams.slug);

                const response = await fetch(`/api/servers/${resolvedParams.slug}`);
                const data = await response.json();

                if (data.success && data.server) {
                    setServer(data.server);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Error loading server:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        loadServer();
    }, [params]);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Loading server details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !server) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <Link href="/servers" className={styles.backLink}>
                        <ArrowLeft size={18} />
                        Back to Servers
                    </Link>
                    <div className={styles.errorState}>
                        <h1>Server Not Found</h1>
                        <p>The server you&apos;re looking for doesn&apos;t exist.</p>
                        <Link href="/servers" className="btn btn-primary">
                            Browse Servers
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const categoryInfo = CATEGORY_INFO[server.category] || CATEGORY_INFO.survival;

    return (
        <div className={styles.page}>
            <div className="container">
                {/* Back Link */}
                <Link href="/servers" className={styles.backLink}>
                    <ArrowLeft size={18} />
                    Back to Servers
                </Link>

                {/* Owner Actions - Edit/Delete */}
                <ServerOwnerActions
                    server={server}
                    onServerUpdated={(updated) => setServer(updated)}
                />

                {/* Header Section */}
                <header className={styles.header}>
                    {/* Banner */}
                    <div className={styles.bannerWrapper}>
                        {server.banner ? (
                            <div
                                className={styles.banner}
                                style={{ backgroundImage: `url(${server.banner})` }}
                            />
                        ) : (
                            <div
                                className={styles.bannerPlaceholder}
                                style={{
                                    background: `linear-gradient(135deg, ${categoryInfo.color}22, ${categoryInfo.color}44)`
                                }}
                            >
                                <span className={styles.bannerEmoji}>{categoryInfo.icon}</span>
                            </div>
                        )}
                        <div className={styles.bannerOverlay} />

                        {/* Badges */}
                        <div className={styles.badgesRow}>
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

                    {/* Title & Meta */}
                    <div className={styles.titleSection}>
                        <div className={styles.titleRow}>
                            <h1 className={styles.title}>{server.name}</h1>
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
                    </div>
                </header>

                {/* Content Grid */}
                <div className={styles.contentGrid}>
                    {/* Left Column - Main Content */}
                    <main className={styles.mainContent}>
                        {/* IP Box */}
                        <div className={`glass-card ${styles.ipCard}`}>
                            <IPBoxClient ip={server.ip} port={server.port} />
                        </div>

                        {/* Description */}
                        <div className={`glass-card ${styles.descCard}`}>
                            <h2 className={styles.cardTitle}>About</h2>
                            <p className={styles.description}>{server.description}</p>

                            {/* Tags */}
                            {server.tags && server.tags.length > 0 && (
                                <div className={styles.tagsContainer}>
                                    {server.tags.map((tag) => (
                                        <Link
                                            key={tag}
                                            href={`/servers?search=${tag}`}
                                            className={styles.tag}
                                        >
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reviews Section - Right after description */}
                        <ReviewsSection serverId={server.id} serverName={server.name} />
                    </main>

                    {/* Right Column - Actions */}
                    <aside className={styles.sidebar}>
                        {/* Vote Card */}
                        <div className={`glass-card ${styles.voteCard}`}>
                            <div className={styles.voteCount}>
                                <ThumbsUp className={styles.voteIcon} size={28} />
                                <span className={styles.voteNumber}>
                                    {server.votes.toLocaleString()}
                                </span>
                                <span className={styles.voteLabel}>Total Votes</span>
                            </div>
                            <VoteButton
                                serverId={server.id}
                                initialVotes={server.votes}
                                onVoteSuccess={(newCount) => {
                                    // Update local state immediately
                                    setServer(prev => prev ? { ...prev, votes: newCount, votesThisMonth: prev.votesThisMonth + 1 } : null);
                                }}
                            />
                            <p className={styles.voteHint}>
                                +{server.votesThisMonth.toLocaleString()} this month
                            </p>
                        </div>

                        {/* 🎯 Real-Time Ping Test - Unique Feature! */}
                        <PingTestWrapper
                            serverId={server.id}
                            serverIp={server.ip}
                            serverPort={server.port}
                            serverName={server.name}
                        />

                        {/* Discord Badge with Member Count */}
                        <DiscordBadgeWrapper discordUrl={server.discord} />

                        {/* Links Card */}
                        <div className={`glass-card ${styles.linksCard}`}>
                            <h3 className={styles.cardTitle}>Links</h3>

                            {server.website && (
                                <a
                                    href={server.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.linkButton}
                                >
                                    <Globe size={18} />
                                    Website
                                    <ExternalLink size={14} />
                                </a>
                            )}

                            {server.discord && (
                                <a
                                    href={server.discord}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.linkButton}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                    </svg>
                                    Discord
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>

                        {/* Vote History */}
                        <VoteHistory serverId={server.id} totalVotes={server.votes} />
                    </aside>
                </div>
            </div>
        </div>
    );
}
