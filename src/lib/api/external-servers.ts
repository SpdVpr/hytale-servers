// ===================================
// External Server APIs Integration
// Import servers from community server lists
// ===================================

import { Server, ServerCategory } from '../types';

// ===================================
// Types for External APIs
// ===================================

interface ExternalServer {
    id?: string;
    name: string;
    ip: string;
    port: number;
    description?: string;
    players?: number;
    maxPlayers?: number;
    votes?: number;
    category?: string;
    country?: string;
    website?: string;
    discord?: string;
    banner?: string;
    online?: boolean;
}

interface HytaleServersNetResponse {
    object: string;
    servers?: Array<{
        id: string;
        name: string;
        address: string;
        port: number;
        motd?: string;
        players: number;
        maxplayers: number;
        votes: number;
        voters?: number;
        uptime?: number;
        country?: string;
        website?: string;
        discord?: string;
        banner?: string;
        online: boolean;
    }>;
    error?: string;
}

interface HytaleTop100Response {
    servers?: Array<{
        id: string;
        name: string;
        host: string;
        port: number;
        description?: string;
        players_online?: number;
        max_players?: number;
        votes?: number;
        rank?: number;
        country?: string;
        tags?: string[];
    }>;
    error?: string;
}

// ===================================
// API Clients
// ===================================

const API_TIMEOUT = 10000; // 10 seconds

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

// ===================================
// Hytale-Servers.net API
// Base URL: https://hytale-servers.net/api/
// ===================================

export async function fetchFromHytaleServersNet(apiKey?: string): Promise<ExternalServer[]> {
    try {
        const url = new URL('https://hytale-servers.net/api/');
        url.searchParams.set('object', 'servers');
        url.searchParams.set('element', 'list');
        if (apiKey) {
            url.searchParams.set('key', apiKey);
        }

        const response = await fetchWithTimeout(url.toString());

        if (!response.ok) {
            console.error(`Hytale-Servers.net API error: ${response.status}`);
            return [];
        }

        const data: HytaleServersNetResponse = await response.json();

        if (data.error || !data.servers) {
            console.error('Hytale-Servers.net API error:', data.error);
            return [];
        }

        return data.servers.map(server => ({
            id: server.id,
            name: server.name,
            ip: server.address,
            port: server.port || 25565,
            description: server.motd,
            players: server.players,
            maxPlayers: server.maxplayers,
            votes: server.votes,
            country: server.country,
            website: server.website,
            discord: server.discord,
            banner: server.banner,
            online: server.online,
        }));
    } catch (error) {
        console.error('Error fetching from Hytale-Servers.net:', error);
        return [];
    }
}

// ===================================
// HytaleTop100 API
// Base URL: https://hytaletop100.com/api/v1
// ===================================

export async function fetchFromHytaleTop100(): Promise<ExternalServer[]> {
    try {
        const response = await fetchWithTimeout('https://hytaletop100.com/api/v1/servers');

        if (!response.ok) {
            console.error(`HytaleTop100 API error: ${response.status}`);
            return [];
        }

        const data: HytaleTop100Response = await response.json();

        if (data.error || !data.servers) {
            console.error('HytaleTop100 API error:', data.error);
            return [];
        }

        return data.servers.map(server => ({
            id: server.id,
            name: server.name,
            ip: server.host,
            port: server.port || 25565,
            description: server.description,
            players: server.players_online,
            maxPlayers: server.max_players,
            votes: server.votes,
            country: server.country,
            category: server.tags?.[0],
        }));
    } catch (error) {
        console.error('Error fetching from HytaleTop100:', error);
        return [];
    }
}

// ===================================
// Hytale.game API
// Base URL: https://hytale.game/wp-json/hytale-api/v1
// ===================================

export async function fetchFromHytaleGame(): Promise<ExternalServer[]> {
    try {
        const response = await fetchWithTimeout('https://hytale.game/wp-json/hytale-api/v1/servers');

        if (!response.ok) {
            console.error(`Hytale.game API error: ${response.status}`);
            return [];
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map((server: Record<string, unknown>) => ({
            name: server.name as string || 'Unknown',
            ip: server.ip as string || server.address as string || '',
            port: (server.port as number) || 25565,
            description: server.description as string,
            players: server.players as number,
            maxPlayers: server.max_players as number,
            votes: server.votes as number,
            country: server.country as string,
            website: server.website as string,
            discord: server.discord as string,
            banner: server.banner as string,
            online: server.online as boolean ?? true,
        }));
    } catch (error) {
        console.error('Error fetching from Hytale.game:', error);
        return [];
    }
}

// ===================================
// Server-Hytale.com API
// Base URL: https://api.server-hytale.com/v1
// ===================================

export async function fetchFromServerHytale(): Promise<ExternalServer[]> {
    try {
        const response = await fetchWithTimeout('https://api.server-hytale.com/v1/servers');

        if (!response.ok) {
            console.error(`Server-Hytale.com API error: ${response.status}`);
            return [];
        }

        const data = await response.json();

        if (!Array.isArray(data?.servers)) {
            return [];
        }

        return data.servers.map((server: Record<string, unknown>) => ({
            id: server.id as string,
            name: server.name as string || 'Unknown',
            ip: server.ip as string || server.address as string || '',
            port: (server.port as number) || 25565,
            description: server.description as string,
            players: server.players as number,
            maxPlayers: server.max_players as number,
            votes: server.votes as number,
            country: server.country as string,
            website: server.website as string,
            discord: server.discord as string,
            online: server.online as boolean ?? true,
        }));
    } catch (error) {
        console.error('Error fetching from Server-Hytale.com:', error);
        return [];
    }
}

// ===================================
// Unified Import Function
// ===================================

function mapCategoryFromExternal(category?: string): ServerCategory {
    if (!category) return 'other';

    const categoryMap: Record<string, ServerCategory> = {
        'survival': 'survival',
        'pvp': 'pvp',
        'creative': 'creative',
        'minigames': 'minigames',
        'minigame': 'minigames',
        'roleplay': 'roleplay',
        'rp': 'roleplay',
        'adventure': 'adventure',
        'economy': 'economy',
        'skyblock': 'skyblock',
        'modded': 'modded',
        'mods': 'modded',
    };

    const lowerCategory = category.toLowerCase();
    return categoryMap[lowerCategory] || 'other';
}

function deduplicateServers(servers: ExternalServer[]): ExternalServer[] {
    const seen = new Map<string, ExternalServer>();

    for (const server of servers) {
        // Use IP:port as unique key
        const key = `${server.ip}:${server.port}`.toLowerCase();

        // Keep the one with more data/votes
        const existing = seen.get(key);
        if (!existing || (server.votes || 0) > (existing.votes || 0)) {
            seen.set(key, server);
        }
    }

    return Array.from(seen.values());
}

export function convertToServer(external: ExternalServer): Omit<Server, 'id'> {
    return {
        name: external.name || 'Unknown Server',
        ip: external.ip,
        port: external.port || 25565,
        description: external.description || 'No description provided.',
        shortDescription: (external.description || 'No description provided.').slice(0, 150),
        category: mapCategoryFromExternal(external.category),
        tags: [],
        isOnline: external.online ?? true,
        currentPlayers: external.players || 0,
        maxPlayers: external.maxPlayers || 100,
        uptime: 99,
        lastPinged: new Date(),
        votes: external.votes || 0,
        votesThisMonth: Math.floor((external.votes || 0) * 0.1), // Estimate
        website: external.website,
        discord: external.discord,
        country: external.country || 'US',
        language: ['en'],
        version: '1.0.0',
        banner: external.banner,
        isFeatured: false,
        isVerified: false,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

export async function importAllServers(): Promise<{
    total: number;
    sources: Record<string, number>;
    servers: Omit<Server, 'id'>[];
}> {
    console.log('Starting server import from all sources...');

    const sources: Record<string, number> = {};
    let allServers: ExternalServer[] = [];

    // Fetch from all sources in parallel
    const [
        hytaleServersNet,
        hytaleTop100,
        hytaleGame,
        serverHytale,
    ] = await Promise.all([
        fetchFromHytaleServersNet(),
        fetchFromHytaleTop100(),
        fetchFromHytaleGame(),
        fetchFromServerHytale(),
    ]);

    sources['hytale-servers.net'] = hytaleServersNet.length;
    sources['hytaletop100.com'] = hytaleTop100.length;
    sources['hytale.game'] = hytaleGame.length;
    sources['server-hytale.com'] = serverHytale.length;

    allServers = [
        ...hytaleServersNet,
        ...hytaleTop100,
        ...hytaleGame,
        ...serverHytale,
    ];

    console.log(`Fetched ${allServers.length} servers from all sources`);

    // Deduplicate
    const uniqueServers = deduplicateServers(allServers);
    console.log(`${uniqueServers.length} unique servers after deduplication`);

    // Convert to our format
    const convertedServers = uniqueServers
        .filter(s => s.ip && s.name)
        .map(convertToServer);

    return {
        total: convertedServers.length,
        sources,
        servers: convertedServers,
    };
}

// ===================================
// Vote Verification APIs
// ===================================

export async function verifyVoteHytaleGame(
    username: string,
    secretKey: string
): Promise<{ voted: boolean; claimable: number }> {
    try {
        const url = `https://hytale.game/wp-json/hytale-api/v1/check?username=${encodeURIComponent(username)}&secret_key=${encodeURIComponent(secretKey)}`;
        const response = await fetchWithTimeout(url);

        if (!response.ok) return { voted: false, claimable: 0 };

        const data = await response.json();
        return {
            voted: data.voted ?? false,
            claimable: data.claimable ?? 0,
        };
    } catch {
        return { voted: false, claimable: 0 };
    }
}

export async function verifyVoteHytaleTop100(
    serverId: string,
    accountId: string,
    apiKey: string
): Promise<{ votes: number; history: unknown[] }> {
    try {
        const url = `https://hytaletop100.com/api/v1/servers/${serverId}/votes/${accountId}`;
        const response = await fetchWithTimeout(url, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
        });

        if (!response.ok) return { votes: 0, history: [] };

        const data = await response.json();
        return {
            votes: data.votes ?? 0,
            history: data.history ?? [],
        };
    } catch {
        return { votes: 0, history: [] };
    }
}

export async function verifyVoteServerHytale(
    serverToken: string,
    ipAddress: string
): Promise<{ canVote: boolean }> {
    try {
        const url = `https://api.server-hytale.com/v1/votes/server/${serverToken}/${encodeURIComponent(ipAddress)}`;
        const response = await fetchWithTimeout(url);

        if (!response.ok) return { canVote: false };

        const data = await response.json();
        return { canVote: data.can_vote ?? false };
    } catch {
        return { canVote: false };
    }
}

export async function verifyVoteHytaleServersNet(
    apiKey: string,
    steamId: string
): Promise<{ voted: boolean; claimable: boolean }> {
    try {
        const url = `https://hytale-servers.net/api/?object=votes&element=claim&key=${encodeURIComponent(apiKey)}&steamid=${encodeURIComponent(steamId)}`;
        const response = await fetchWithTimeout(url);

        if (!response.ok) return { voted: false, claimable: false };

        const data = await response.json();
        return {
            voted: data.voted ?? false,
            claimable: data.claimable ?? false,
        };
    } catch {
        return { voted: false, claimable: false };
    }
}
