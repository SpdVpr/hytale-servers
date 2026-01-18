'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Server, Plus, Settings, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Server as ServerType, CATEGORY_INFO } from '@/lib/types';
import styles from './page.module.css';

export default function MyServersPage() {
    const { user, loading: authLoading, signInWithGoogle } = useAuth();
    const [servers, setServers] = useState<ServerType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyServers = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/my-servers?userId=${user.uid}`);
                const data = await response.json();

                if (data.success) {
                    setServers(data.servers);
                }
            } catch (error) {
                console.error('Error fetching servers:', error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchMyServers();
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.loadingState}>
                        <Loader2 className={styles.spinner} size={32} />
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.loginPrompt}>
                        <div className={`glass-card ${styles.loginCard}`}>
                            <Server size={48} className={styles.loginIcon} />
                            <h1>Sign In to View Your Servers</h1>
                            <p>You need to sign in to see and manage your servers.</p>
                            <button
                                onClick={signInWithGoogle}
                                className={`btn btn-accent btn-lg ${styles.googleLoginButton}`}
                            >
                                <LogIn size={20} />
                                Sign In with Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>
                            <Server size={32} />
                            My Servers
                        </h1>
                        <p className={styles.subtitle}>
                            Manage your registered servers
                        </p>
                    </div>
                    <Link href="/submit" className="btn btn-accent">
                        <Plus size={18} />
                        Add New Server
                    </Link>
                </div>

                {servers.length === 0 ? (
                    <div className={`glass-card ${styles.emptyState}`}>
                        <Server size={64} className={styles.emptyIcon} />
                        <h2>No Servers Yet</h2>
                        <p>You haven&apos;t registered any servers. Add your first server to get started!</p>
                        <Link href="/submit" className="btn btn-accent btn-lg">
                            <Plus size={20} />
                            Add Your First Server
                        </Link>
                    </div>
                ) : (
                    <div className={styles.serverGrid}>
                        {servers.map((server) => {
                            const categoryInfo = CATEGORY_INFO[server.category] || CATEGORY_INFO.survival;
                            return (
                                <div key={server.id} className={`glass-card ${styles.serverCard}`}>
                                    <div className={styles.serverBanner}>
                                        {server.banner ? (
                                            <img src={server.banner} alt={server.name} />
                                        ) : (
                                            <div
                                                className={styles.bannerPlaceholder}
                                                style={{ background: `linear-gradient(135deg, ${categoryInfo.color}33, ${categoryInfo.color}66)` }}
                                            >
                                                <span>{categoryInfo.icon}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.serverInfo}>
                                        <h3>{server.name}</h3>
                                        <p className={styles.serverIp}>{server.ip}:{server.port}</p>
                                        <div className={styles.serverStats}>
                                            <span className={styles.categoryBadge} style={{ color: categoryInfo.color }}>
                                                {categoryInfo.icon} {categoryInfo.label}
                                            </span>
                                            <span className={styles.votes}>
                                                {server.votes} votes
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.serverActions}>
                                        <Link
                                            href={`/servers/${server.slug || server.id}`}
                                            className="btn btn-ghost"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/servers/${server.slug || server.id}`}
                                            className="btn btn-primary"
                                        >
                                            <Settings size={16} />
                                            Manage
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
