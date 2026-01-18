'use client';

import { useState, useEffect } from 'react';
import { Copy, Share2, Star, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import DiscordBadge from '@/components/DiscordBadge';
import UptimeChart from '@/components/UptimeChart';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import PingTest from '@/components/PingTest';
import { Review } from '@/lib/reviews';

// Dynamically import WorldPreview to avoid SSR issues with Three.js
const WorldPreview = dynamic(
    () => import('@/components/WorldPreview'),
    {
        ssr: false,
        loading: () => (
            <div className={styles.previewLoading}>
                <div className={styles.previewSpinner} />
                <span>Loading 3D Preview...</span>
            </div>
        ),
    }
);

interface IPBoxClientProps {
    ip: string;
    port: number;
}

export function IPBoxClient({ ip, port }: IPBoxClientProps) {
    // Only show port if it's not the default Hytale port (5520)
    const displayAddress = port === 5520 ? ip : `${ip}:${port}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(displayAddress);
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: 'Hytale Server',
                text: `Join this Hytale server: ${displayAddress}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            <div className={styles.ipHeader}>
                <span className={styles.ipLabel}>Server Address</span>
                <button
                    className={styles.shareButton}
                    onClick={handleShare}
                >
                    <Share2 size={16} />
                    Share
                </button>
            </div>
            <div className={styles.ipBox}>
                <code className={styles.ip}>{displayAddress}</code>
                <button
                    className={styles.copyButton}
                    onClick={handleCopy}
                >
                    <Copy size={16} />
                    Copy
                </button>
            </div>
        </>
    );
}

interface WorldPreviewWrapperProps {
    shareCode?: string;
}

export function WorldPreviewWrapper({ shareCode }: WorldPreviewWrapperProps) {
    return (
        <div className={`glass-card ${styles.previewCard}`}>
            <h2 className={styles.cardTitle}>🌍 3D World Preview</h2>
            <WorldPreview shareCode={shareCode} height={400} autoRotate={true} />
        </div>
    );
}

// ===================================
// Discord Badge Wrapper
// ===================================

interface DiscordBadgeWrapperProps {
    discordUrl?: string;
}

export function DiscordBadgeWrapper({ discordUrl }: DiscordBadgeWrapperProps) {
    if (!discordUrl) return null;

    return (
        <div className={styles.discordSection}>
            <DiscordBadge inviteUrl={discordUrl} showMemberCount={true} />
        </div>
    );
}

// ===================================
// Ping Test Wrapper
// ===================================

interface PingTestWrapperProps {
    serverId: string;
    serverIp: string;
    serverPort: number;
    serverName: string;
}

export function PingTestWrapper({ serverId, serverIp, serverPort, serverName }: PingTestWrapperProps) {
    return (
        <div className={styles.pingSection}>
            <PingTest
                serverId={serverId}
                serverIp={serverIp}
                serverPort={serverPort}
                serverName={serverName}
                autoTest={false}
            />
        </div>
    );
}

// ===================================
// Uptime Chart Wrapper
// ===================================

interface UptimeChartWrapperProps {
    serverId: string;
}

export function UptimeChartWrapper({ serverId }: UptimeChartWrapperProps) {
    const [chartData, setChartData] = useState<Array<{ hour: string; uptime: number; players: number }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUptime = async () => {
            try {
                const response = await fetch(`/api/uptime?serverId=${serverId}&hours=24`);
                const data = await response.json();

                if (data.success && data.data?.chartData) {
                    setChartData(data.data.chartData);
                } else {
                    // Generate mock data for demo
                    setChartData(generateMockUptimeData());
                }
            } catch {
                setChartData(generateMockUptimeData());
            } finally {
                setLoading(false);
            }
        };

        fetchUptime();
    }, [serverId]);

    if (loading) {
        return (
            <div className={`glass-card ${styles.uptimeSection}`}>
                <div className={styles.loadingState}>Loading uptime data...</div>
            </div>
        );
    }

    return (
        <div className={styles.uptimeSection}>
            <UptimeChart data={chartData} showPlayers={false} />
        </div>
    );
}

function generateMockUptimeData() {
    const data = [];
    for (let i = 0; i < 24; i++) {
        data.push({
            hour: `${i.toString().padStart(2, '0')}:00`,
            uptime: 85 + Math.floor(Math.random() * 15),
            players: Math.floor(Math.random() * 50),
        });
    }
    return data;
}

// ===================================
// Reviews Section
// ===================================

interface ReviewsSectionProps {
    serverId: string;
    serverName: string;
}

export function ReviewsSection({ serverId, serverName }: ReviewsSectionProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`/api/reviews?serverId=${serverId}&limit=5`);
                const data = await response.json();

                if (data.success) {
                    setReviews(data.data.reviews || []);
                    setStats(data.data.stats || { totalReviews: 0, averageRating: 0 });
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [serverId]);

    const handleSubmitReview = async (reviewData: {
        rating: number;
        title: string;
        content: string;
        pros: string[];
        cons: string[];
        playtime: string;
        userId?: string;
        username?: string;
    }) => {
        try {
            // Save to Firebase via API
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serverId,
                    ...reviewData,
                }),
            });

            const data = await response.json();

            if (data.success && data.review) {
                // Use the returned review from API
                const newReview: Review = {
                    id: data.review.id,
                    serverId,
                    userId: reviewData.userId || 'guest',
                    username: reviewData.username || 'Guest User',
                    rating: reviewData.rating,
                    title: reviewData.title,
                    content: reviewData.content,
                    pros: reviewData.pros,
                    cons: reviewData.cons,
                    playtime: reviewData.playtime,
                    verified: false,
                    helpful: 0,
                    notHelpful: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Add to beginning of reviews list
                const updatedReviews = [newReview, ...reviews];
                setReviews(updatedReviews);

                // Recalculate stats
                const newTotal = stats.totalReviews + 1;
                const newAverage = newTotal === 1
                    ? reviewData.rating
                    : ((stats.averageRating * stats.totalReviews) + reviewData.rating) / newTotal;

                setStats({
                    totalReviews: newTotal,
                    averageRating: Math.round(newAverage * 10) / 10,
                });
            } else {
                console.error('Failed to save review:', data.error);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    const handleMarkHelpful = async (reviewId: string, helpful: boolean) => {
        try {
            // Update local state immediately for better UX
            setReviews(prevReviews =>
                prevReviews.map(review => {
                    if (review.id === reviewId) {
                        return {
                            ...review,
                            helpful: helpful ? review.helpful + 1 : review.helpful,
                            notHelpful: helpful ? review.notHelpful : review.notHelpful + 1,
                        };
                    }
                    return review;
                })
            );

            // Send to API
            await fetch('/api/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, helpful }),
            });
        } catch (error) {
            console.error('Error marking review:', error);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        try {
            const response = await fetch('/api/reviews', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId }),
            });

            const data = await response.json();

            if (data.success) {
                // Remove from local state
                const deletedReview = reviews.find(r => r.id === reviewId);
                setReviews(reviews.filter(r => r.id !== reviewId));

                // Update stats
                if (deletedReview) {
                    const newTotal = Math.max(0, stats.totalReviews - 1);
                    setStats({
                        totalReviews: newTotal,
                        averageRating: newTotal === 0 ? 0 : stats.averageRating,
                    });
                }
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    return (
        <div className={`glass-card ${styles.reviewsSection}`}>
            <div className={styles.reviewsHeader}>
                <div className={styles.reviewsTitle}>
                    <MessageSquare size={24} />
                    <h2>Community Reviews</h2>
                    {stats.totalReviews > 0 && (
                        <span className={styles.reviewsCount}>
                            ({stats.totalReviews})
                        </span>
                    )}
                </div>

                {stats.averageRating > 0 && (
                    <div className={styles.averageRating}>
                        <Star size={20} className={styles.starIcon} />
                        <span>{stats.averageRating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            <button
                className={`btn btn-primary ${styles.writeReviewBtn}`}
                onClick={() => setShowForm(true)}
            >
                Write a Review
            </button>

            {loading ? (
                <div className={styles.loadingState}>Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className={styles.noReviews}>
                    <p>No reviews yet. Be the first to review this server!</p>
                </div>
            ) : (
                <div className={styles.reviewsList}>
                    {reviews.map(review => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            currentUserId={user?.uid}
                            onHelpful={handleMarkHelpful}
                            onDelete={handleDeleteReview}
                        />
                    ))}
                </div>
            )}

            {showForm && (
                <ReviewForm
                    serverId={serverId}
                    serverName={serverName}
                    onSubmit={handleSubmitReview}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
}
