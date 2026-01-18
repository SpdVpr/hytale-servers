'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, Clock, User } from 'lucide-react';
import styles from './VoteHistory.module.css';

interface Vote {
    id: string;
    username: string;
    votedAt: string;
}

interface VoteHistoryProps {
    serverId: string;
    totalVotes: number;
}

export default function VoteHistory({ serverId, totalVotes }: VoteHistoryProps) {
    const [votes, setVotes] = useState<Vote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVotes = async () => {
            try {
                const response = await fetch(`/api/vote?serverId=${serverId}&limit=10`);
                const data = await response.json();

                if (data.success && data.votes) {
                    setVotes(data.votes);
                }
            } catch (error) {
                console.error('Error fetching vote history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVotes();
    }, [serverId]);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <ThumbsUp size={18} />
                    <h3>Recent Votes</h3>
                </div>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <ThumbsUp size={18} />
                <h3>Recent Votes</h3>
                <span className={styles.totalBadge}>{totalVotes} total</span>
            </div>

            {votes.length === 0 ? (
                <div className={styles.empty}>
                    <p>No votes yet. Be the first to vote!</p>
                </div>
            ) : (
                <ul className={styles.voteList}>
                    {votes.map((vote) => (
                        <li key={vote.id} className={styles.voteItem}>
                            <div className={styles.voterAvatar}>
                                <User size={14} />
                            </div>
                            <div className={styles.voteInfo}>
                                <span className={styles.voterName}>{vote.username}</span>
                                <span className={styles.voteTime}>
                                    <Clock size={12} />
                                    {formatTimeAgo(vote.votedAt)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
