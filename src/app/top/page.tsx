'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import ServerCard from '@/components/ServerCard';
import { Server } from '@/lib/types';
import styles from './page.module.css';

export default function TopPage() {
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await fetch('/api/servers?sortBy=votes&pageSize=100');
                const data = await response.json();
                if (data.success && data.servers) {
                    setServers(data.servers);
                }
            } catch (error) {
                console.error('Error loading servers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServers();
    }, []);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.header}>
                        <div className={styles.headerIcon}>
                            <Trophy size={48} />
                        </div>
                        <h1 className={styles.title}>Top 100 Hytale Servers</h1>
                        <p className={styles.subtitle}>Loading rankings...</p>
                    </div>
                    <div className={styles.loadingSpinner}>
                        <div className={styles.spinner}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerIcon}>
                        <Trophy size={48} />
                    </div>
                    <h1 className={styles.title}>Top 100 Hytale Servers</h1>
                    <p className={styles.subtitle}>
                        The most popular servers ranked by community votes
                    </p>
                </div>

                {/* Top 3 Podium */}
                <div className={styles.podium}>
                    {servers.slice(0, 3).map((server, index) => (
                        <div
                            key={server.id}
                            className={`${styles.podiumCard} ${styles[`rank${index + 1}`]}`}
                        >
                            <div className={styles.podiumRank}>
                                {index === 0 ? <Trophy size={32} /> :
                                    index === 1 ? <Medal size={32} /> :
                                        <Award size={32} />}
                                <span>#{index + 1}</span>
                            </div>
                            <h3 className={styles.podiumName}>{server.name}</h3>
                            <p className={styles.podiumVotes}>
                                {server.votes.toLocaleString()} votes
                            </p>
                            <p className={styles.podiumPlayers}>
                                {server.currentPlayers.toLocaleString()} players online
                            </p>
                        </div>
                    ))}
                </div>

                {/* Full Ranking */}
                <div className={styles.ranking}>
                    <h2 className={styles.sectionTitle}>Full Rankings</h2>
                    <div className={styles.serverGrid}>
                        {servers.map((server, index) => (
                            <ServerCard
                                key={server.id}
                                server={server}
                                rank={index + 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
