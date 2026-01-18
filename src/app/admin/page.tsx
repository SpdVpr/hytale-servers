'use client';

import { useState, useEffect } from 'react';
import {
    Download, RefreshCw, Database, CheckCircle,
    AlertCircle, Server, ExternalLink, Upload, Trash2, Wifi, WifiOff, Cloud
} from 'lucide-react';
import styles from './page.module.css';

interface ApiResult {
    success: boolean;
    message?: string;
    total?: number;
    sources?: Record<string, number>;
    error?: string;
    successful?: number;
    failed?: number;
    count?: number;
    deleted?: number;
    summary?: {
        total: number;
        online: number;
        offline: number;
        totalPlayers: number;
    };
}

export default function AdminPage() {
    const [isImporting, setIsImporting] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [isPinging, setIsPinging] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [result, setResult] = useState<ApiResult | null>(null);
    const [dbStatus, setDbStatus] = useState<ApiResult | null>(null);
    const [pingStatus, setPingStatus] = useState<ApiResult | null>(null);

    const handleImport = async () => {
        setIsImporting(true);
        setResult(null);

        try {
            const response = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ success: false, error: 'Failed to import. Please try again.' });
            console.error('Import error:', error);
        } finally {
            setIsImporting(false);
        }
    };

    const handleSeedDatabase = async () => {
        setIsSeeding(true);
        setResult(null);

        try {
            const response = await fetch('/api/seed?clear=true', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            setResult(data);
            checkDbStatus();
        } catch (error) {
            setResult({ success: false, error: 'Failed to seed database. Check Firebase config.' });
            console.error('Seed error:', error);
        } finally {
            setIsSeeding(false);
        }
    };

    const handleClearDatabase = async () => {
        if (!confirm('Are you sure you want to delete all servers from the database?')) {
            return;
        }

        setIsClearing(true);
        setResult(null);

        try {
            const response = await fetch('/api/seed', { method: 'DELETE' });
            const data = await response.json();
            setResult(data);
            checkDbStatus();
        } catch (error) {
            setResult({ success: false, error: 'Failed to clear database.' });
            console.error('Clear error:', error);
        } finally {
            setIsClearing(false);
        }
    };

    const handlePingServers = async () => {
        setIsPinging(true);
        setResult(null);

        try {
            const response = await fetch('/api/ping', { method: 'POST' });
            const data = await response.json();
            setResult(data);
            setPingStatus(data);
        } catch (error) {
            setResult({ success: false, error: 'Failed to ping servers.' });
            console.error('Ping error:', error);
        } finally {
            setIsPinging(false);
        }
    };

    const handleSyncAggregator = async () => {
        setIsSyncing(true);
        setResult(null);

        try {
            const response = await fetch('/api/sync-status', { method: 'POST' });
            const data = await response.json();
            setResult(data);
            checkPingStatus();
        } catch (error) {
            setResult({ success: false, error: 'Failed to sync from aggregator.' });
            console.error('Sync error:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const checkDbStatus = async () => {
        try {
            const response = await fetch('/api/seed');
            const data = await response.json();
            setDbStatus(data);
        } catch (error) {
            console.error('DB status error:', error);
        }
    };

    const checkPingStatus = async () => {
        try {
            const response = await fetch('/api/ping');
            const data = await response.json();
            setPingStatus(data);
        } catch (error) {
            console.error('Ping status error:', error);
        }
    };

    // Check status on load
    useEffect(() => {
        checkDbStatus();
        checkPingStatus();
    }, []);

    return (
        <div className={styles.page}>
            <div className="container">
                <header className={styles.header}>
                    <h1 className={styles.title}>Admin Dashboard</h1>
                    <p className={styles.subtitle}>
                        Manage servers, import data, and monitor statistics
                    </p>
                </header>

                {/* Live Status Summary */}
                {pingStatus?.summary && (
                    <section className={`glass-card ${styles.section}`}>
                        <div className={styles.sectionHeader}>
                            <Wifi size={24} />
                            <h2>Live Server Status</h2>
                        </div>
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{pingStatus.summary.total}</span>
                                <span className={styles.statLabel}>Total Servers</span>
                            </div>
                            <div className={`${styles.statCard} ${styles.statOnline}`}>
                                <span className={styles.statValue}>{pingStatus.summary.online}</span>
                                <span className={styles.statLabel}>Online</span>
                            </div>
                            <div className={`${styles.statCard} ${styles.statOffline}`}>
                                <span className={styles.statValue}>{pingStatus.summary.offline}</span>
                                <span className={styles.statLabel}>Offline</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{pingStatus.summary.totalPlayers}</span>
                                <span className={styles.statLabel}>Players Online</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* Database Management */}
                <section className={`glass-card ${styles.section}`}>
                    <div className={styles.sectionHeader}>
                        <Database size={24} />
                        <h2>Firebase Database</h2>
                        {dbStatus?.success && (
                            <span className={styles.dbCount}>
                                {dbStatus.count} servers
                            </span>
                        )}
                    </div>

                    <div className={styles.buttonRow}>
                        <button
                            className={`btn btn-primary ${styles.importButton}`}
                            onClick={handleSeedDatabase}
                            disabled={isSeeding}
                        >
                            {isSeeding ? (
                                <>
                                    <RefreshCw className={styles.spinning} size={18} />
                                    Seeding...
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    Seed Database (24 servers)
                                </>
                            )}
                        </button>

                        <button
                            className={`btn ${styles.pingButton}`}
                            onClick={handlePingServers}
                            disabled={isPinging}
                        >
                            {isPinging ? (
                                <>
                                    <RefreshCw className={styles.spinning} size={18} />
                                    Pinging...
                                </>
                            ) : (
                                <>
                                    <Wifi size={18} />
                                    Ping All Servers (UDP)
                                </>
                            )}
                        </button>

                        <button
                            className={`btn ${styles.syncButton}`}
                            onClick={handleSyncAggregator}
                            disabled={isSyncing}
                        >
                            {isSyncing ? (
                                <>
                                    <RefreshCw className={styles.spinning} size={18} />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <Cloud size={18} />
                                    Sync from Aggregator
                                </>
                            )}
                        </button>

                        <button
                            className={`btn ${styles.clearButton}`}
                            onClick={handleClearDatabase}
                            disabled={isClearing}
                        >
                            {isClearing ? (
                                <>
                                    <RefreshCw className={styles.spinning} size={18} />
                                    Clearing...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={18} />
                                    Clear Database
                                </>
                            )}
                        </button>

                        <button
                            className={`btn ${styles.refreshButton}`}
                            onClick={() => { checkDbStatus(); checkPingStatus(); }}
                        >
                            <RefreshCw size={18} />
                            Refresh
                        </button>
                    </div>

                    {/* Result Display */}
                    {result && (
                        <div className={`${styles.result} ${result.success ? styles.success : styles.error}`}>
                            {result.success ? (
                                <>
                                    <CheckCircle size={20} />
                                    <div>
                                        <strong>{result.message}</strong>
                                        {result.successful !== undefined && (
                                            <p>Successful: {result.successful}, Failed: {result.failed}</p>
                                        )}
                                        {result.summary && (
                                            <p>Online: {result.summary.online}/{result.summary.total}, Players: {result.summary.totalPlayers}</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={20} />
                                    <span>{result.error}</span>
                                </>
                            )}
                        </div>
                    )}
                </section>

                {/* Import from External APIs */}
                <section className={`glass-card ${styles.section}`}>
                    <div className={styles.sectionHeader}>
                        <Download size={24} />
                        <h2>Import from APIs</h2>
                    </div>

                    <p className={styles.description}>
                        Fetch servers from external server lists:
                    </p>

                    <ul className={styles.sourceList}>
                        <li>
                            <ExternalLink size={16} />
                            <span>hytaletop100.com (scraped ✅)</span>
                        </li>
                        <li>
                            <ExternalLink size={16} />
                            <span>hytale-servers.net (API)</span>
                        </li>
                    </ul>

                    <button
                        className={`btn btn-secondary ${styles.importButton}`}
                        onClick={handleImport}
                        disabled={isImporting}
                    >
                        {isImporting ? (
                            <>
                                <RefreshCw className={styles.spinning} size={18} />
                                Importing...
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                Import from APIs
                            </>
                        )}
                    </button>
                </section>

                {/* Quick Actions */}
                <section className={`glass-card ${styles.section}`}>
                    <div className={styles.sectionHeader}>
                        <Server size={24} />
                        <h2>Quick Actions</h2>
                    </div>

                    <div className={styles.quickActions}>
                        <a href="/servers" className={styles.quickAction}>
                            <span>📋</span>
                            <span>View All Servers</span>
                        </a>
                        <a href="/top" className={styles.quickAction}>
                            <span>🏆</span>
                            <span>Top 100</span>
                        </a>
                        <a href="/submit" className={styles.quickAction}>
                            <span>➕</span>
                            <span>Add Server</span>
                        </a>
                        <a href="/" className={styles.quickAction}>
                            <span>🏠</span>
                            <span>Homepage</span>
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}
