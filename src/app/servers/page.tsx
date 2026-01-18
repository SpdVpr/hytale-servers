'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import ServerCard from '@/components/ServerCard';
import { Server, CATEGORY_INFO, ServerCategory, ServerFilters } from '@/lib/types';
import styles from './page.module.css';

export default function ServersPage() {
    const [allServers, setAllServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ServerFilters>({
        search: '',
        category: 'all',
        country: 'all',
        sortBy: 'votes',
        onlineOnly: false,
    });

    const [showFilters, setShowFilters] = useState(false);

    // Load servers from Firebase
    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await fetch('/api/servers');
                const data = await response.json();
                if (data.success && data.servers) {
                    setAllServers(data.servers);
                }
            } catch (error) {
                console.error('Error loading servers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServers();
    }, []);

    // Filter and sort servers
    const servers = allServers.filter(server => {
        // Search filter
        if (filters.search) {
            const q = filters.search.toLowerCase();
            const matches =
                server.name.toLowerCase().includes(q) ||
                server.description.toLowerCase().includes(q) ||
                server.tags.some(t => t.toLowerCase().includes(q));
            if (!matches) return false;
        }

        // Category filter
        if (filters.category && filters.category !== 'all') {
            if (server.category !== filters.category) return false;
        }

        // Online only filter
        if (filters.onlineOnly && !server.isOnline) {
            return false;
        }

        return true;
    }).sort((a, b) => {
        switch (filters.sortBy) {
            case 'votes': return b.votes - a.votes;
            case 'players': return b.currentPlayers - a.currentPlayers;
            case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'name': return a.name.localeCompare(b.name);
            default: return 0;
        }
    });

    const updateFilter = <K extends keyof ServerFilters>(
        key: K,
        value: ServerFilters[K]
    ) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: 'all',
            country: 'all',
            sortBy: 'votes',
            onlineOnly: false,
        });
    };

    const hasActiveFilters =
        filters.search ||
        filters.category !== 'all' ||
        filters.onlineOnly;

    return (
        <div className={styles.page}>
            <div className="container">
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Browse Hytale Servers</h1>
                    <p className={styles.subtitle}>
                        Find your perfect server from our curated list of {servers.length} active servers
                    </p>
                </div>

                {/* Search & Filters Bar */}
                <div className={styles.toolbar}>
                    {/* Search */}
                    <div className={styles.searchBox}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            className={`input ${styles.searchInput}`}
                            placeholder="Search servers by name, description, or tags..."
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                        />
                        {filters.search && (
                            <button
                                className={styles.clearSearch}
                                onClick={() => updateFilter('search', '')}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle (Mobile) */}
                    <button
                        className={`btn btn-ghost ${styles.filterToggle}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} />
                        Filters
                        {hasActiveFilters && <span className={styles.filterBadge} />}
                    </button>
                </div>

                {/* Filters Panel */}
                <div className={`${styles.filtersPanel} ${showFilters ? styles.filtersOpen : ''}`}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Category</label>
                        <select
                            className="select"
                            value={filters.category}
                            onChange={(e) => updateFilter('category', e.target.value as ServerCategory | 'all')}
                        >
                            <option value="all">All Categories</option>
                            {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                                <option key={key} value={key}>
                                    {info.icon} {info.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Sort By</label>
                        <select
                            className="select"
                            value={filters.sortBy}
                            onChange={(e) => updateFilter('sortBy', e.target.value as ServerFilters['sortBy'])}
                        >
                            <option value="votes">Most Votes</option>
                            <option value="players">Most Players</option>
                            <option value="newest">Newest</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>&nbsp;</label>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={filters.onlineOnly}
                                onChange={(e) => updateFilter('onlineOnly', e.target.checked)}
                            />
                            <span>Online Only</span>
                        </label>
                    </div>

                    {hasActiveFilters && (
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>&nbsp;</label>
                            <button className="btn btn-ghost" onClick={clearFilters}>
                                <X size={16} />
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Info */}
                <div className={styles.resultsInfo}>
                    <span>
                        Showing <strong>{servers.length}</strong> servers
                    </span>
                </div>

                {/* Server Grid */}
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Loading servers from database...</p>
                    </div>
                ) : servers.length > 0 ? (
                    <div className={styles.serverGrid}>
                        {servers.map((server, index) => (
                            <ServerCard
                                key={server.id}
                                server={server}
                                rank={filters.sortBy === 'votes' ? index + 1 : undefined}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.noResults}>
                        <h3>No servers found</h3>
                        <p>Try adjusting your filters or search terms</p>
                        <button className="btn btn-primary" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
