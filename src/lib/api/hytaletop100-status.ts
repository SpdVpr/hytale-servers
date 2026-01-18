// ===================================
// HytaleTop100 Live Status Scraper
// Gets real-time server status from HytaleTop100
// ===================================

import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const SERVERS_COLLECTION = 'servers';

interface ServerStatus {
    name: string;
    ip: string;
    isOnline: boolean;
    currentPlayers: number;
    maxPlayers: number;
    votes: number;
}

/**
 * Fetch server statuses from HytaleTop100 HTML
 * They update their data hourly with live pings
 */
export async function fetchHytaleTop100Status(): Promise<ServerStatus[]> {
    try {
        console.log('Fetching status from HytaleTop100...');

        const response = await fetch('https://hytaletop100.com/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch HytaleTop100:', response.status);
            return [];
        }

        const html = await response.text();

        // Parse server data from HTML
        const servers = parseServersFromHTML(html);
        console.log(`Parsed ${servers.length} servers from HytaleTop100`);

        return servers;
    } catch (error) {
        console.error('Error fetching HytaleTop100:', error);
        return [];
    }
}

/**
 * Parse server information from HytaleTop100 HTML
 * Dynamically extracts all server data from the page
 */
function parseServersFromHTML(html: string): ServerStatus[] {
    const servers: ServerStatus[] = [];

    // Try to find JSON-LD or inline data first
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (jsonLdMatch) {
        try {
            const data = JSON.parse(jsonLdMatch[1]);
            console.log('Found JSON-LD data');
        } catch { }
    }

    // Pattern to find server blocks - look for IP addresses and hostnames
    // Common formats: play.servername.com, servername.net, 123.45.67.89
    const ipHostnamePattern = /(?:play\.|join\.|mc\.)?([a-z0-9-]+\.(?:com|net|org|xyz|de|pl|pt|gg|io)(?::\d+)?)/gi;
    const numericIpPattern = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d+))?/g;

    // Find all potential server IPs in the HTML
    const foundServers = new Set<string>();

    let match;
    while ((match = ipHostnamePattern.exec(html)) !== null) {
        foundServers.add(match[0].toLowerCase());
    }
    while ((match = numericIpPattern.exec(html)) !== null) {
        foundServers.add(match[1]);
    }

    console.log(`Found ${foundServers.size} potential servers in HTML`);

    // For each found server, try to extract status and player count
    for (const serverIp of foundServers) {
        // Skip common non-game domains
        if (serverIp.includes('google') ||
            serverIp.includes('facebook') ||
            serverIp.includes('twitter') ||
            serverIp.includes('discord') ||
            serverIp.includes('cloudflare')) {
            continue;
        }

        // Extract context around the server IP (1000 chars before and after)
        const context = extractContext(html, serverIp, 1000);
        if (!context) continue;

        // Try to find server name near the IP
        const nameMatch = context.match(/<h\d[^>]*>([^<]+)<\/h\d>|class="[^"]*name[^"]*"[^>]*>([^<]+)</i);
        const serverName = nameMatch ? (nameMatch[1] || nameMatch[2])?.trim() : serverIp;

        // Try to find player count
        const playerPatterns = [
            /(\d+)\s*\/\s*(\d+)\s*(?:players?|online)?/i,  // "45/100 players"
            /(\d+)\s+(?:players?|online|playing)/i,        // "45 players"
            /players?[:\s]+(\d+)/i,                         // "Players: 45"
            /online[:\s]+(\d+)/i,                           // "Online: 45"
        ];

        let currentPlayers = 0;
        let maxPlayers = 100;

        for (const pattern of playerPatterns) {
            const playerMatch = context.match(pattern);
            if (playerMatch) {
                currentPlayers = parseInt(playerMatch[1]) || 0;
                if (playerMatch[2]) {
                    maxPlayers = parseInt(playerMatch[2]) || 100;
                }
                break;
            }
        }

        // Determine online status
        const lowerContext = context.toLowerCase();
        const hasOnlineIndicator = lowerContext.includes('online') ||
            lowerContext.includes('✓') ||
            lowerContext.includes('status-online') ||
            currentPlayers > 0;
        const hasOfflineIndicator = lowerContext.includes('offline') ||
            lowerContext.includes('maintenance') ||
            lowerContext.includes('status-offline');

        const isOnline = hasOnlineIndicator && !hasOfflineIndicator;

        servers.push({
            name: serverName || serverIp,
            ip: serverIp,
            isOnline,
            currentPlayers,
            maxPlayers,
            votes: 0,
        });
    }

    return servers;
}

/**
 * Extract context around a search term
 */
function extractContext(html: string, term: string, contextLength: number): string | null {
    const index = html.indexOf(term);
    if (index === -1) return null;

    const start = Math.max(0, index - contextLength);
    const end = Math.min(html.length, index + term.length + contextLength);

    return html.substring(start, end);
}

/**
 * Update Firebase with status from HytaleTop100
 */
export async function syncStatusFromHytaleTop100(): Promise<{
    total: number;
    updated: number;
    online: number;
}> {
    const statuses = await fetchHytaleTop100Status();

    if (statuses.length === 0) {
        console.log('No status data from HytaleTop100');
        return { total: 0, updated: 0, online: 0 };
    }

    // Get all servers from Firebase
    const snapshot = await getDocs(collection(db, SERVERS_COLLECTION));

    let updated = 0;
    let online = 0;

    for (const serverDoc of snapshot.docs) {
        const data = serverDoc.data();

        // Find matching status
        const status = statuses.find(s =>
            s.name.toLowerCase() === data.name?.toLowerCase() ||
            s.ip.toLowerCase() === data.ip?.toLowerCase()
        );

        if (status) {
            await updateDoc(doc(db, SERVERS_COLLECTION, serverDoc.id), {
                isOnline: status.isOnline,
                currentPlayers: status.currentPlayers,
                maxPlayers: status.maxPlayers,
                lastPinged: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            updated++;
            if (status.isOnline) online++;

            console.log(`Updated ${data.name}: ${status.isOnline ? 'ONLINE' : 'OFFLINE'} (${status.currentPlayers} players)`);
        }
    }

    return {
        total: snapshot.size,
        updated,
        online,
    };
}
