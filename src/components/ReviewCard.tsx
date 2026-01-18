'use client';

import { useState } from 'react';
import { Review } from '@/lib/reviews';
import { Star, ThumbsUp, ThumbsDown, CheckCircle, Clock, Trash2 } from 'lucide-react';
import styles from './ReviewCard.module.css';

interface ReviewCardProps {
    review: Review;
    currentUserId?: string;
    onHelpful?: (reviewId: string, helpful: boolean) => void;
    onDelete?: (reviewId: string) => void;
}

export default function ReviewCard({ review, currentUserId, onHelpful, onDelete }: ReviewCardProps) {
    const [hasVoted, setHasVoted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = currentUserId && review.userId === currentUserId;

    const handleVote = (helpful: boolean) => {
        if (hasVoted) return;
        setHasVoted(true);
        onHelpful?.(review.id, helpful);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        setIsDeleting(true);
        onDelete?.(review.id);
    };

    const formatDate = (date: Date | string | undefined | null) => {
        if (!date) return 'Unknown date';
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }).format(dateObj);
        } catch {
            return 'Unknown date';
        }
    };

    // Safe username accessor
    const getInitial = () => {
        if (!review.username || review.username.length === 0) return '?';
        return review.username[0].toUpperCase();
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.user}>
                    {review.userAvatar ? (
                        <img src={review.userAvatar} alt={review.username || 'User'} className={styles.avatar} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {getInitial()}
                        </div>
                    )}
                    <div className={styles.userInfo}>
                        <span className={styles.username}>
                            {review.username || 'Anonymous'}
                            {review.verified && (
                                <CheckCircle size={14} className={styles.verifiedBadge} />
                            )}
                        </span>
                        {review.playtime && (
                            <span className={styles.playtime}>
                                <Clock size={12} />
                                {review.playtime}
                            </span>
                        )}
                    </div>
                </div>
                <div className={styles.rating}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star
                            key={star}
                            size={16}
                            className={star <= review.rating ? styles.starFilled : styles.starEmpty}
                        />
                    ))}
                </div>
            </div>

            <h4 className={styles.title}>{review.title}</h4>
            <p className={styles.content}>{review.content}</p>

            {(review.pros.length > 0 || review.cons.length > 0) && (
                <div className={styles.prosConsGrid}>
                    {review.pros.length > 0 && (
                        <div className={styles.pros}>
                            <h5>👍 Pros</h5>
                            <ul>
                                {review.pros.map((pro, idx) => (
                                    <li key={idx}>{pro}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {review.cons.length > 0 && (
                        <div className={styles.cons}>
                            <h5>👎 Cons</h5>
                            <ul>
                                {review.cons.map((con, idx) => (
                                    <li key={idx}>{con}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.footer}>
                <span className={styles.date}>{formatDate(review.createdAt)}</span>
                <div className={styles.footerActions}>
                    <div className={styles.helpfulButtons}>
                        <span className={styles.helpfulLabel}>Was this helpful?</span>
                        <button
                            className={`${styles.helpfulBtn} ${hasVoted ? styles.disabled : ''}`}
                            onClick={() => handleVote(true)}
                            disabled={hasVoted}
                        >
                            <ThumbsUp size={14} />
                            {review.helpful}
                        </button>
                        <button
                            className={`${styles.helpfulBtn} ${hasVoted ? styles.disabled : ''}`}
                            onClick={() => handleVote(false)}
                            disabled={hasVoted}
                        >
                            <ThumbsDown size={14} />
                            {review.notHelpful}
                        </button>
                    </div>

                    {isOwner && (
                        <button
                            className={styles.deleteBtn}
                            onClick={handleDelete}
                            disabled={isDeleting}
                            title="Delete review"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
