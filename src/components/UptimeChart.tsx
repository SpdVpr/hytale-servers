'use client';

import { useMemo } from 'react';
import styles from './UptimeChart.module.css';

interface UptimeChartProps {
    data: Array<{ hour: string; uptime: number; players: number }>;
    showPlayers?: boolean;
}

export default function UptimeChart({ data, showPlayers = false }: UptimeChartProps) {
    const maxUptime = 100;
    const maxPlayers = useMemo(() => Math.max(...data.map(d => d.players), 10), [data]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h4>Uptime History (24h)</h4>
                <div className={styles.legend}>
                    <span className={styles.legendItem}>
                        <span className={styles.uptimeDot}></span>
                        Uptime
                    </span>
                    {showPlayers && (
                        <span className={styles.legendItem}>
                            <span className={styles.playersDot}></span>
                            Players
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.chart}>
                <div className={styles.yAxis}>
                    <span>100%</span>
                    <span>50%</span>
                    <span>0%</span>
                </div>

                <div className={styles.bars}>
                    {data.map((hour, idx) => (
                        <div key={idx} className={styles.barWrapper}>
                            <div className={styles.barContainer}>
                                {/* Uptime bar */}
                                <div
                                    className={`${styles.bar} ${styles.uptimeBar}`}
                                    style={{ height: `${hour.uptime}%` }}
                                    title={`${hour.uptime}% uptime`}
                                >
                                    <span className={styles.tooltip}>{hour.uptime}%</span>
                                </div>

                                {/* Players bar (overlay) */}
                                {showPlayers && (
                                    <div
                                        className={`${styles.bar} ${styles.playersBar}`}
                                        style={{ height: `${(hour.players / maxPlayers) * 100}%` }}
                                        title={`${hour.players} players`}
                                    >
                                        <span className={styles.tooltip}>{hour.players}</span>
                                    </div>
                                )}
                            </div>
                            <span className={styles.xLabel}>{hour.hour}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>
                        {Math.round(data.reduce((sum, d) => sum + d.uptime, 0) / data.length)}%
                    </span>
                    <span className={styles.statLabel}>Avg Uptime</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>
                        {Math.max(...data.map(d => d.uptime))}%
                    </span>
                    <span className={styles.statLabel}>Peak Uptime</span>
                </div>
                {showPlayers && (
                    <div className={styles.stat}>
                        <span className={styles.statValue}>
                            {Math.max(...data.map(d => d.players))}
                        </span>
                        <span className={styles.statLabel}>Peak Players</span>
                    </div>
                )}
            </div>
        </div>
    );
}
