'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Users } from 'lucide-react';
import styles from './DiscordBadge.module.css';

interface DiscordBadgeProps {
    inviteUrl?: string;
    showMemberCount?: boolean;
    compact?: boolean;
}

interface DiscordInfo {
    name?: string;
    onlineMembers: number;
    available: boolean;
}

export default function DiscordBadge({
    inviteUrl,
    showMemberCount = true,
    compact = false
}: DiscordBadgeProps) {
    const [discordInfo, setDiscordInfo] = useState<DiscordInfo | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!inviteUrl || !showMemberCount) return;

        const fetchDiscordInfo = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/discord?invite=${encodeURIComponent(inviteUrl)}`);
                const data = await response.json();

                if (data.success) {
                    setDiscordInfo(data.data);
                }
            } catch (error) {
                console.error('Error fetching Discord info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscordInfo();
    }, [inviteUrl, showMemberCount]);

    if (!inviteUrl) {
        return null;
    }

    const handleClick = () => {
        window.open(inviteUrl, '_blank', 'noopener,noreferrer');
    };

    if (compact) {
        return (
            <button className={styles.compactBadge} onClick={handleClick}>
                <MessageCircle size={16} />
                {discordInfo?.available && discordInfo.onlineMembers > 0 && (
                    <span className={styles.memberCount}>
                        {discordInfo.onlineMembers.toLocaleString()}
                    </span>
                )}
            </button>
        );
    }

    return (
        <button className={styles.badge} onClick={handleClick}>
            <div className={styles.icon}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
            </div>
            <div className={styles.content}>
                <span className={styles.label}>Join Discord</span>
                {loading ? (
                    <span className={styles.loading}>Loading...</span>
                ) : discordInfo?.available ? (
                    <span className={styles.members}>
                        <Users size={12} />
                        <span className={styles.onlineCount}>{discordInfo.onlineMembers.toLocaleString()}</span>
                        online
                    </span>
                ) : (
                    <span className={styles.members}>Community Server</span>
                )}
            </div>
        </button>
    );
}
