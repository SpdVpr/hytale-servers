'use client';

import { useState, useCallback, useEffect } from 'react';
import { Activity, Loader2, MapPin, Zap, RefreshCw, Sparkles } from 'lucide-react';
import styles from './PingTest.module.css';

interface PingResult {
    serverLatency: number;
    userLatency: number;
    totalLatency: number;
    rating: {
        label: string;
        color: string;
        emoji: string;
        score: number;
    };
    userLocation?: {
        country: string;
        city?: string;
    };
    timestamp: number;
}

interface PingTestProps {
    serverId?: string;
    serverIp?: string;
    serverPort?: number;
    serverName?: string;
    onPingComplete?: (result: PingResult) => void;
    autoTest?: boolean;
    compact?: boolean;
}

export default function PingTest({
    serverId,
    serverIp,
    serverPort = 5520,
    serverName,
    onPingComplete,
    autoTest = false, // Only test when user clicks
    compact = false,
}: PingTestProps) {
    const [isPinging, setIsPinging] = useState(false);
    const [result, setResult] = useState<PingResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pulseAnimation, setPulseAnimation] = useState(false);

    const runPingTest = useCallback(async () => {
        if (isPinging) return;

        setIsPinging(true);
        setError(null);
        setPulseAnimation(true);

        try {
            // Step 1: Measure user's latency to our server
            const userPingStart = performance.now();
            const echoResponse = await fetch('/api/user-ping', {
                method: 'GET',
                cache: 'no-store',
            });
            const echoData = await echoResponse.json();
            const userLatency = Math.round((performance.now() - userPingStart) / 2);

            if (!echoData.success) {
                throw new Error('Failed to measure user latency');
            }

            // Step 2: Ping the game server through our API
            const pingResponse = await fetch('/api/user-ping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serverId,
                    ip: serverIp,
                    port: serverPort,
                }),
            });

            const pingData = await pingResponse.json();

            if (!pingData.success) {
                throw new Error(pingData.error || 'Failed to ping server');
            }

            const serverLatency = pingData.latency.serverLatency;
            const totalLatency = userLatency + serverLatency;
            const rating = getLatencyRating(totalLatency);

            const pingResult: PingResult = {
                serverLatency,
                userLatency,
                totalLatency,
                rating,
                userLocation: pingData.userLocation || echoData.location,
                timestamp: Date.now(),
            };

            setResult(pingResult);
            onPingComplete?.(pingResult);

        } catch (err) {
            console.error('Ping test error:', err);
            setError(err instanceof Error ? err.message : 'Ping test failed');
        } finally {
            setIsPinging(false);
            setTimeout(() => setPulseAnimation(false), 500);
        }
    }, [isPinging, serverId, serverIp, serverPort, onPingComplete]);

    useEffect(() => {
        if (autoTest && !result && !isPinging) {
            const timer = setTimeout(runPingTest, 300);
            return () => clearTimeout(timer);
        }
    }, [autoTest, result, isPinging, runPingTest]);

    if (compact) {
        return (
            <div className={styles.compactContainer}>
                {isPinging ? (
                    <div className={styles.compactPinging}>
                        <Loader2 className={styles.spinner} size={14} />
                        <span>Testing...</span>
                    </div>
                ) : result ? (
                    <button
                        className={styles.compactResult}
                        onClick={runPingTest}
                        title="Click to test again"
                        style={{ '--ping-color': result.rating.color } as React.CSSProperties}
                    >
                        <Zap size={14} />
                        <span className={styles.pingValue}>{result.totalLatency}ms</span>
                        <span className={styles.pingLabel}>{result.rating.label}</span>
                    </button>
                ) : (
                    <button
                        className={styles.compactButton}
                        onClick={runPingTest}
                        disabled={isPinging}
                    >
                        <Activity size={14} />
                        <span>Test Ping</span>
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${pulseAnimation ? styles.pulse : ''} ${result ? styles.hasResult : ''}`}>
            <div className={styles.uniqueBadge}>
                <Sparkles size={14} />
                <span>Exclusive Feature</span>
            </div>

            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <div className={styles.iconWrapper}>
                        <Zap className={styles.icon} size={24} />
                    </div>
                    <div className={styles.titleGroup}>
                        <h3 className={styles.title}>Your Ping to This Server</h3>
                        <p className={styles.subtitle}>Real-time latency from your location</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className={styles.error}>
                    <span>⚠️ {error}</span>
                    <button onClick={runPingTest} className={styles.retryButton}>
                        Retry
                    </button>
                </div>
            )}

            {isPinging ? (
                <div className={styles.pinging}>
                    <div className={styles.pingAnimation}>
                        <div className={styles.pingRing}></div>
                        <div className={styles.pingRing}></div>
                        <div className={styles.pingRing}></div>
                        <Loader2 className={styles.spinnerLarge} size={36} />
                    </div>
                    <p className={styles.pingText}>Measuring your connection...</p>
                </div>
            ) : result ? (
                <div className={styles.result}>
                    <div
                        className={styles.latencyDisplay}
                        style={{ '--ping-color': result.rating.color } as React.CSSProperties}
                    >
                        <div className={styles.latencyGlow}></div>
                        <span className={styles.latencyValue}>{result.totalLatency}</span>
                        <span className={styles.latencyUnit}>ms</span>
                    </div>

                    <div
                        className={styles.ratingBadge}
                        style={{
                            backgroundColor: `${result.rating.color}20`,
                            color: result.rating.color,
                            borderColor: `${result.rating.color}40`
                        }}
                    >
                        <span className={styles.ratingEmoji}>{result.rating.emoji}</span>
                        <span className={styles.ratingLabel}>{result.rating.label} Connection</span>
                    </div>

                    {result.userLocation && (
                        <div className={styles.locationBadge}>
                            <MapPin size={14} />
                            <span>
                                Tested from {result.userLocation.city && `${result.userLocation.city}, `}
                                {result.userLocation.country}
                            </span>
                        </div>
                    )}

                    <div className={styles.breakdown}>
                        <div className={styles.breakdownItem}>
                            <span className={styles.breakdownLabel}>You → CDN</span>
                            <span className={styles.breakdownValue}>{result.userLatency}ms</span>
                        </div>
                        <div className={styles.breakdownDivider}>+</div>
                        <div className={styles.breakdownItem}>
                            <span className={styles.breakdownLabel}>CDN → Server</span>
                            <span className={styles.breakdownValue}>{result.serverLatency}ms</span>
                        </div>
                    </div>

                    <button className={styles.retestButton} onClick={runPingTest}>
                        <RefreshCw size={16} />
                        Test Again
                    </button>
                </div>
            ) : (
                <div className={styles.initial}>
                    <button className={styles.startButton} onClick={runPingTest}>
                        <Activity size={24} />
                        <span>Test Your Ping</span>
                    </button>
                    <p className={styles.description}>
                        Click to measure your connection latency to this server
                    </p>
                </div>
            )}

            <p className={styles.note}>
                💡 <strong>Pro Tip:</strong> Lower ping means smoother gameplay
            </p>
        </div>
    );
}

function getLatencyRating(latency: number): {
    label: string;
    color: string;
    emoji: string;
    score: number;
} {
    if (latency < 50) {
        return { label: 'Excellent', color: '#22c55e', emoji: '🟢', score: 5 };
    } else if (latency < 80) {
        return { label: 'Great', color: '#84cc16', emoji: '🟢', score: 4 };
    } else if (latency < 120) {
        return { label: 'Good', color: '#eab308', emoji: '🟡', score: 3 };
    } else if (latency < 180) {
        return { label: 'Fair', color: '#f97316', emoji: '🟠', score: 2 };
    } else if (latency < 300) {
        return { label: 'Poor', color: '#ef4444', emoji: '🔴', score: 1 };
    } else {
        return { label: 'Bad', color: '#dc2626', emoji: '🔴', score: 0 };
    }
}
