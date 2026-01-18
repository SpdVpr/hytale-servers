'use client';

import React from 'react';
import { Server } from '@/lib/types';
import { Globe, Check, X } from 'lucide-react';
import styles from './ServerComparison.module.css';

interface ServerComparisonProps {
    servers: Server[];
    onClose: () => void;
}

export default function ServerComparison({ servers, onClose }: ServerComparisonProps) {
    if (servers.length < 2) {
        return (
            <div className={styles.empty}>
                <p>Select at least 2 servers to compare</p>
            </div>
        );
    }

    const compareValue = (a: unknown, b: unknown): 'better' | 'worse' | 'equal' => {
        if (typeof a === 'number' && typeof b === 'number') {
            if (a > b) return 'better';
            if (a < b) return 'worse';
            return 'equal';
        }
        return 'equal';
    };

    const features = [
        { key: 'uptime', label: 'Uptime', suffix: '%', higher: true },
        { key: 'votes', label: 'Votes', suffix: '', higher: true },
        { key: 'maxPlayers', label: 'Max Players', suffix: '', higher: true },
        { key: 'averageRating', label: 'Rating', suffix: '⭐', higher: true },
    ];

    const booleanFeatures = [
        { key: 'isFeatured', label: 'Featured' },
        { key: 'isVerified', label: 'Verified' },
        { key: 'website', label: 'Has Website' },
        { key: 'discord', label: 'Has Discord' },
    ];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Server Comparison</h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div className={styles.grid} style={{ gridTemplateColumns: `200px repeat(${servers.length}, 1fr)` }}>
                    {/* Header row with server names */}
                    <div className={styles.labelCell}></div>
                    {servers.map(server => (
                        <div key={server.id} className={styles.serverHeader}>
                            <div className={styles.serverLogo}>
                                {server.logo ? (
                                    <img src={server.logo} alt={server.name} />
                                ) : (
                                    <div className={styles.logoPlaceholder}>{server.name[0]}</div>
                                )}
                            </div>
                            <h3>{server.name}</h3>
                        </div>
                    ))}

                    {/* Category */}
                    <div className={styles.labelCell}>Category</div>
                    {servers.map(server => (
                        <div key={server.id} className={styles.valueCell}>
                            <span className={styles.tag}>{server.category}</span>
                        </div>
                    ))}

                    {/* Country */}
                    <div className={styles.labelCell}>Country</div>
                    {servers.map(server => (
                        <div key={server.id} className={styles.valueCell}>
                            <Globe size={16} />
                            {server.country}
                        </div>
                    ))}

                    {/* Numeric features */}
                    {features.map(feature => (
                        <React.Fragment key={feature.key}>
                            <div key={feature.key} className={styles.labelCell}>{feature.label}</div>
                            {servers.map((server, idx) => {
                                const value = ((server as unknown) as Record<string, number>)[feature.key] || 0;
                                const otherValues = servers
                                    .filter((_, i) => i !== idx)
                                    .map(s => ((s as unknown) as Record<string, number>)[feature.key] || 0);
                                const isBest = feature.higher
                                    ? otherValues.every(v => value >= v)
                                    : otherValues.every(v => value <= v);

                                return (
                                    <div
                                        key={`${server.id}-${feature.key}`}
                                        className={`${styles.valueCell} ${isBest ? styles.best : ''}`}
                                    >
                                        {value}{feature.suffix}
                                        {isBest && <span className={styles.bestBadge}>Best</span>}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}

                    {/* Boolean features */}
                    {booleanFeatures.map(feature => (
                        <React.Fragment key={feature.key}>
                            <div key={feature.key} className={styles.labelCell}>{feature.label}</div>
                            {servers.map(server => {
                                const hasFeature = !!((server as unknown) as Record<string, unknown>)[feature.key];
                                return (
                                    <div
                                        key={`${server.id}-${feature.key}`}
                                        className={`${styles.valueCell} ${hasFeature ? styles.hasFeature : styles.noFeature}`}
                                    >
                                        {hasFeature ? <Check size={18} /> : <X size={18} />}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}

                    {/* Tags */}
                    <div className={styles.labelCell}>Tags</div>
                    {servers.map(server => (
                        <div key={`${server.id}-tags`} className={styles.valueCell}>
                            <div className={styles.tagList}>
                                {server.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* IP Address */}
                    <div className={styles.labelCell}>IP Address</div>
                    {servers.map(server => (
                        <div key={`${server.id}-ip`} className={styles.valueCell}>
                            <code>{server.port === 5520 ? server.ip : `${server.ip}:${server.port}`}</code>
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    <button className="btn btn-primary" onClick={onClose}>
                        Close Comparison
                    </button>
                </div>
            </div>
        </div>
    );
}
