// ===================================
// HYTALE SERVERS - Server Data
// Uses real scraped data from HytaleTop100
// ===================================

import { Server, ServerStats } from './types';
import { getHytaleTop100Seeds } from './api/hytaletop100-scraper';

// Generate IDs for scraped servers
function generateServerData(): Server[] {
    const scrapedServers = getHytaleTop100Seeds();
    return scrapedServers.map((s, index) => ({
        ...s,
        id: String(index + 1),
    })) as Server[];
}

// Cache the servers
let _cachedServers: Server[] | null = null;

export const MOCK_SERVERS: Server[] = (() => {
    if (!_cachedServers) {
        _cachedServers = generateServerData();
    }
    return _cachedServers;
})();

export const getServerStats = (): ServerStats => {
    const onlineServers = MOCK_SERVERS.filter(s => s.isOnline);
    return {
        totalServers: MOCK_SERVERS.length,
        totalPlayers: MOCK_SERVERS.reduce((sum, s) => sum + s.currentPlayers, 0),
        totalVotes: MOCK_SERVERS.reduce((sum, s) => sum + s.votes, 0),
        onlineServers: onlineServers.length,
    };
};

export const getTopServers = (limit: number = 5): Server[] => {
    return [...MOCK_SERVERS]
        .sort((a, b) => b.votes - a.votes)
        .slice(0, limit);
};

export const getFeaturedServers = (): Server[] => {
    return MOCK_SERVERS.filter(s => s.isFeatured && s.isOnline);
};

export const getServerById = (id: string): Server | undefined => {
    return MOCK_SERVERS.find(s => s.id === id);
};

export const searchServers = (
    query: string,
    category: string,
    sortBy: string,
    onlineOnly: boolean
): Server[] => {
    let filtered = [...MOCK_SERVERS];

    // Filter by search
    if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.tags.some(t => t.toLowerCase().includes(q))
        );
    }

    // Filter by category
    if (category && category !== 'all') {
        filtered = filtered.filter(s => s.category === category);
    }

    // Filter online only
    if (onlineOnly) {
        filtered = filtered.filter(s => s.isOnline);
    }

    // Sort
    switch (sortBy) {
        case 'votes':
            filtered.sort((a, b) => b.votes - a.votes);
            break;
        case 'players':
            filtered.sort((a, b) => b.currentPlayers - a.currentPlayers);
            break;
        case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    return filtered;
};
