// ===================================
// Server Query System - Multi-Protocol
// Supports: HyQuery UDP, craftping (MC protocol), HTTP API, TCP fallback
// Hytale uses QUIC over UDP on port 5520 (not TCP like Minecraft)
// ===================================

import { ServerQueryResult } from '../types';

const QUERY_TIMEOUT = 5000;
const UDP_TIMEOUT = 3000;

// ===================================
// HyQuery UDP Protocol (PRIMARY for Hytale)
// Hytale servers respond to UDP packets on port 5520
// ===================================

/**
 * Query Hytale server using HyQuery UDP protocol
 * This is the native Hytale query protocol on port 5520
 * Returns real player counts and server info
 */
async function queryHytaleUDP(
    host: string,
    port: number = 5520
): Promise<ServerQueryResult | null> {
    // Only works on server-side (Node.js)
    if (typeof window !== 'undefined') return null;

    try {
        const dgram = await import('dgram');
        const dns = await import('dns').then(m => m.promises);

        // Resolve hostname to IP
        let ip = host;
        if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
            try {
                const addresses = await dns.resolve4(host);
                if (addresses.length > 0) {
                    ip = addresses[0];
                }
            } catch {
                // Use hostname directly if resolution fails
            }
        }

        return new Promise((resolve) => {
            const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
            let resolved = false;

            const cleanup = () => {
                if (!resolved) {
                    resolved = true;
                    try { socket.close(); } catch { /* ignore */ }
                }
            };

            // Set timeout
            const timeoutId = setTimeout(() => {
                cleanup();
                resolve(null);
            }, UDP_TIMEOUT);

            socket.on('error', () => {
                clearTimeout(timeoutId);
                cleanup();
                resolve(null);
            });

            socket.on('message', (msg: Buffer) => {
                clearTimeout(timeoutId);
                try {
                    // Check for HyQuery magic bytes response
                    if (msg.length > 7 && msg.toString('utf8', 0, 7) === 'HYQUERY') {
                        // JSON response after magic bytes
                        const jsonStr = msg.subarray(7).toString('utf8');
                        const data = JSON.parse(jsonStr);

                        // Validate player count (cap at 1000 to filter garbage data)
                        const playerCount = Math.min(data.players?.online ?? 0, 1000);
                        const maxPlayerCount = Math.min(data.players?.max ?? 20, 1000);

                        cleanup();
                        resolve({
                            online: true,
                            players: playerCount,
                            maxPlayers: maxPlayerCount,
                            motd: data.motd || data.description,
                            version: data.version || 'Hytale',
                        });
                        return;
                    }

                    // Check for legacy 0xFE 0x01 response format
                    if (msg.length > 2) {
                        // Try to parse as JSON after 2-byte prefix
                        try {
                            const jsonStr = msg.subarray(2).toString('utf8');
                            const data = JSON.parse(jsonStr);

                            // Validate player count (cap at 1000 to filter garbage data)
                            const playerCount = Math.min(data.players?.online ?? 0, 1000);
                            const maxPlayerCount = Math.min(data.players?.max ?? 20, 1000);

                            cleanup();
                            resolve({
                                online: true,
                                players: playerCount,
                                maxPlayers: maxPlayerCount,
                                motd: data.description || data.motd,
                                version: data.version || 'Hytale',
                            });
                            return;
                        } catch {
                            // Not JSON, fallback to basic online detection
                        }
                    }

                    // Any response = server is online, but don't trust weird player counts
                    cleanup();
                    resolve({
                        online: true,
                        players: 0,
                        maxPlayers: 20,
                        version: 'Hytale',
                    });
                } catch (e) {
                    cleanup();
                    resolve(null);
                }
            });

            // Send HyQuery packet (magic bytes + status request)
            // Format: HYQUERY\0 + 0xFE 0x01
            const queryPacket = Buffer.from('HYQUERY\x00\xFE\x01');

            socket.send(queryPacket, 0, queryPacket.length, port, ip, (err) => {
                if (err) {
                    clearTimeout(timeoutId);
                    cleanup();
                    resolve(null);
                    return;
                }

                // Also send legacy format as fallback
                const legacyPacket = Buffer.from([0xFE, 0x01]);
                socket.send(legacyPacket, 0, legacyPacket.length, port, ip, () => {
                    // Ignore errors on legacy packet
                });
            });
        });
    } catch (error) {
        console.error('UDP query error:', error);
        return null;
    }
}

/**
 * Simple UDP ping to check if server responds on UDP
 * Returns true if any response received
 */
async function checkUDPPort(
    host: string,
    port: number = 5520
): Promise<boolean> {
    if (typeof window !== 'undefined') return false;

    try {
        const dgram = await import('dgram');
        const dns = await import('dns').then(m => m.promises);

        let ip = host;
        if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
            try {
                const addresses = await dns.resolve4(host);
                if (addresses.length > 0) ip = addresses[0];
            } catch { /* use hostname */ }
        }

        return new Promise((resolve) => {
            const socket = dgram.createSocket('udp4');
            let resolved = false;

            const cleanup = () => {
                if (!resolved) {
                    resolved = true;
                    try { socket.close(); } catch { /* ignore */ }
                }
            };

            const timeoutId = setTimeout(() => {
                cleanup();
                resolve(false);
            }, UDP_TIMEOUT);

            socket.on('message', () => {
                clearTimeout(timeoutId);
                cleanup();
                resolve(true);
            });

            socket.on('error', () => {
                clearTimeout(timeoutId);
                cleanup();
                resolve(false);
            });

            // Simple ping packet
            const ping = Buffer.from([0x01, 0x00]);
            socket.send(ping, 0, ping.length, port, ip, (err) => {
                if (err) {
                    clearTimeout(timeoutId);
                    cleanup();
                    resolve(false);
                }
            });
        });
    } catch {
        return false;
    }
}

// ===================================
// Minecraft-like Protocol Query (craftping)
// Hytale uses similar protocol on some servers
// ===================================

/**
 * Query server using Minecraft Server List Ping protocol
 * Many Hytale servers support this protocol
 */
async function queryMinecraftProtocol(
    host: string,
    port: number
): Promise<ServerQueryResult | null> {
    try {
        // Dynamic import to avoid issues in browser
        const { ping } = await import('craftping');

        const result = await Promise.race([
            ping(host, port),
            new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), QUERY_TIMEOUT)
            )
        ]);

        if (result) {
            return {
                online: true,
                players: result.players.online,
                maxPlayers: result.players.max,
                version: result.version.name || 'Hytale',
                motd: typeof result.motd === 'string' ? result.motd : result.motd?.text || '',
            };
        }
    } catch (error) {
        // Protocol not supported or server offline
    }

    return null;
}

// ===================================
// HTTP-based Query (Nitrado/WebServer plugin)
// ===================================

interface NitradoQueryResponse {
    server?: {
        name?: string;
        version?: string;
        protocol?: string;
        maxPlayers?: number;
    };
    universe?: {
        currentPlayers?: number;
        defaultWorld?: string;
    };
    players?: Array<{
        name: string;
        uuid: string;
        world: string;
    }>;
}

/**
 * Query server via HTTP API (for servers with Nitrado WebServer plugin)
 * Also tries to scrape HTML for player count
 */
async function queryServerHTTP(
    host: string,
    httpPort: number = 8080
): Promise<ServerQueryResult | null> {
    // First try JSON API endpoints
    const jsonEndpoints = [
        `http://${host}:${httpPort}/Nitrado/Query`,
        `http://${host}:${httpPort}/api/status`,
        `http://${host}:${httpPort}/api/server`,
        `http://${host}:${httpPort}/status.json`,
        `http://${host}:${httpPort}/query`,
    ];

    for (const url of jsonEndpoints) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), QUERY_TIMEOUT);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, application/x.hytale.nitrado.query+json;version=1',
                    'User-Agent': 'HytaleServerList/1.0',
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const text = await response.text();
                // Try to parse as JSON
                try {
                    const data = JSON.parse(text);
                    const players = data.universe?.currentPlayers ||
                        data.players?.length ||
                        data.playerCount ||
                        data.currentPlayers ||
                        data.online ||
                        0;
                    const maxPlayers = data.server?.maxPlayers || data.maxPlayers || 100;

                    return {
                        online: true,
                        players: typeof players === 'number' ? players : 0,
                        maxPlayers,
                        version: data.server?.version || data.version || 'Hytale',
                        motd: data.server?.name || data.name,
                    };
                } catch {
                    // Not JSON, try to parse as HTML
                    const playerMatch = text.match(/(\d+)\s*(?:\/\s*(\d+))?\s*(?:players?|online|playing)/i);
                    if (playerMatch) {
                        return {
                            online: true,
                            players: parseInt(playerMatch[1]),
                            maxPlayers: playerMatch[2] ? parseInt(playerMatch[2]) : 100,
                            version: 'Hytale',
                        };
                    }
                }
            }
        } catch {
            continue;
        }
    }

    // Try root URL for HTML scraping
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), QUERY_TIMEOUT);

        const response = await fetch(`http://${host}:${httpPort}/`, {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const html = await response.text();

            // Look for player count patterns
            const patterns = [
                /(\d+)\s*(?:\/\s*(\d+))?\s*(?:players?|online|playing)/i,
                /(?:players?|online|playing)\s*[:\s]*(\d+)/i,
                /(\d+)\s*\/\s*(\d+)/,
            ];

            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match) {
                    return {
                        online: true,
                        players: parseInt(match[1]),
                        maxPlayers: match[2] ? parseInt(match[2]) : 100,
                        version: 'Hytale',
                    };
                }
            }

            // Server has web interface = it's online
            return {
                online: true,
                players: 0,
                maxPlayers: 100,
                version: 'Hytale',
            };
        }
    } catch {
        // Failed to reach server
    }

    return null;
}

// ===================================
// Check if server has web interface
// ===================================

async function checkServerWebsite(url: string): Promise<{ online: boolean; players?: number } | null> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), QUERY_TIMEOUT);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const html = await response.text();

            // Look for player count in the HTML
            const playerMatch = html.match(/(\d+)\s*(?:\/\s*\d+)?\s*(?:players?|online|playing)/i);
            const players = playerMatch ? parseInt(playerMatch[1]) : undefined;

            // Check for online/offline indicators
            const isOnline = !html.toLowerCase().includes('offline') &&
                !html.toLowerCase().includes('maintenance');

            return { online: isOnline, players };
        }
    } catch {
        // Website not accessible
    }

    return null;
}

// ===================================
// TCP Port Check (basic connectivity)
// ===================================

async function checkTCPPort(
    ip: string,
    port: number
): Promise<boolean> {
    if (typeof window !== 'undefined') return false;

    try {
        const net = await import('net');

        return new Promise((resolve) => {
            const socket = net.createConnection({ host: ip, port, timeout: QUERY_TIMEOUT });

            const timeout = setTimeout(() => {
                socket.destroy();
                resolve(false);
            }, QUERY_TIMEOUT);

            socket.on('connect', () => {
                clearTimeout(timeout);
                socket.destroy();
                resolve(true);
            });

            socket.on('error', () => {
                clearTimeout(timeout);
                socket.destroy();
                resolve(false);
            });

            socket.on('timeout', () => {
                clearTimeout(timeout);
                socket.destroy();
                resolve(false);
            });
        });
    } catch {
        return false;
    }
}

// ===================================
// DNS Resolution
// ===================================

async function resolveHostname(hostname: string): Promise<string> {
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        return hostname;
    }

    try {
        const dns = await import('dns').then(m => m.promises);
        const addresses = await dns.resolve4(hostname);
        if (addresses.length > 0) {
            return addresses[0];
        }
    } catch {
        // DNS resolution failed
    }

    return hostname;
}

// ===================================
// Server Database (known server info)
// ===================================

interface KnownServer {
    ip: string;
    port: number;
    httpPort?: number;
    website?: string;
    hasNitradoPlugin?: boolean;
}

const KNOWN_SERVERS: Record<string, KnownServer> = {
    'hytown': { ip: 'play.hytown.org', port: 5520, website: 'https://hytown.org' },
    'dogecraft': { ip: 'play.dogecraft.net', port: 5520, website: 'https://dogecraft.net' },
    'hyfable': { ip: 'play.hyfable.com', port: 5520, website: 'https://hyfable.com' },
    'hyperion': { ip: 'join.playhyp.com', port: 27000, website: 'https://playhyp.com' },
    'hysync': { ip: 'play.hysync.org', port: 15790, website: 'https://hysync.org' },
};

// ===================================
// Main Query Function
// ===================================

/**
 * Query a Hytale server for its status
 * Tries multiple protocols in order of reliability:
 * 1. HyQuery UDP (native Hytale protocol on port 5520)
 * 2. Minecraft Server List Ping (craftping)
 * 3. HTTP API (Nitrado/WebServer plugins)
 * 4. Website scraping
 * 5. TCP/UDP port checks
 */
export async function queryServer(
    ip: string,
    port: number = 5520
): Promise<ServerQueryResult> {
    // In browser, use API endpoint
    if (typeof window !== 'undefined') {
        return queryServerViaAPI(ip, port);
    }

    const resolvedIp = await resolveHostname(ip);
    console.log(`Querying ${ip} (${resolvedIp}):${port}...`);

    // ===================================
    // METHOD 0 (PRIMARY): HyQuery UDP Protocol
    // This is the native Hytale query protocol
    // ===================================
    const udpResult = await queryHytaleUDP(resolvedIp, port);
    if (udpResult) {
        console.log(`${ip}: HyQuery UDP - ONLINE (${udpResult.players} players)`);
        return udpResult;
    }

    // Also try UDP on port 5520 if different
    if (port !== 5520) {
        const udp5520 = await queryHytaleUDP(resolvedIp, 5520);
        if (udp5520) {
            console.log(`${ip}: HyQuery UDP on 5520 - ONLINE (${udp5520.players} players)`);
            return udp5520;
        }
    }

    // ===================================
    // METHOD 1 (FALLBACK): Minecraft-like Server List Ping
    // Some Hytale servers support this for compatibility
    // ===================================
    const mcResult = await queryMinecraftProtocol(resolvedIp, port);
    if (mcResult) {
        console.log(`${ip}: Minecraft protocol - ONLINE (${mcResult.players} players)`);
        return mcResult;
    }

    // Also try on port 25565 if different
    if (port !== 25565) {
        const mc25565 = await queryMinecraftProtocol(resolvedIp, 25565);
        if (mc25565) {
            console.log(`${ip}: Minecraft protocol on 25565 - ONLINE (${mc25565.players} players)`);
            return mc25565;
        }
    }

    // ===================================
    // METHOD 2: HTTP API (Nitrado/WebServer plugins)
    // ===================================
    const httpResult = await queryServerHTTP(resolvedIp);
    if (httpResult) {
        console.log(`${ip}: HTTP API - ONLINE (${httpResult.players} players)`);
        return httpResult;
    }

    // ===================================
    // METHOD 3: Check server website for status
    // ===================================
    const serverKey = Object.keys(KNOWN_SERVERS).find(k =>
        ip.toLowerCase().includes(k) ||
        KNOWN_SERVERS[k].ip.toLowerCase() === ip.toLowerCase()
    );

    if (serverKey && KNOWN_SERVERS[serverKey].website) {
        const websiteResult = await checkServerWebsite(KNOWN_SERVERS[serverKey].website!);
        if (websiteResult) {
            console.log(`${ip}: Website check - ${websiteResult.online ? 'ONLINE' : 'OFFLINE'}`);
            return {
                online: websiteResult.online,
                players: websiteResult.players || 0,
                maxPlayers: 100,
                version: 'Hytale',
            };
        }
    }

    // ===================================
    // METHOD 4: UDP Port Check (Hytale uses UDP, not TCP!)
    // ===================================
    const udpOpen = await checkUDPPort(resolvedIp, port);
    if (udpOpen) {
        console.log(`${ip}: UDP port responsive - marking as ONLINE`);
        return {
            online: true,
            players: 0,
            maxPlayers: 100,
            version: 'Hytale',
        };
    }

    // ===================================
    // METHOD 5: TCP Port Check (legacy fallback)
    // Note: May fail because Hytale uses UDP/QUIC
    // ===================================
    const tcpOpen = await checkTCPPort(resolvedIp, port);
    if (tcpOpen) {
        console.log(`${ip}: TCP port open - marking as ONLINE`);
        return {
            online: true,
            players: 0,
            maxPlayers: 100,
            version: 'Hytale',
        };
    }

    // ===================================
    // METHOD 6: Alternate ports scan
    // ===================================
    const alternatePorts = [8080, 5520, 25565, 27000, 15790];
    for (const altPort of alternatePorts) {
        if (altPort !== port) {
            // Try UDP first on alternate ports
            const altUdpResult = await queryHytaleUDP(resolvedIp, altPort);
            if (altUdpResult) {
                console.log(`${ip}: HyQuery UDP on port ${altPort} - ONLINE (${altUdpResult.players} players)`);
                return altUdpResult;
            }

            // Then try TCP
            const altTcpOpen = await checkTCPPort(resolvedIp, altPort);
            if (altTcpOpen) {
                console.log(`${ip}: Found open port ${altPort}`);

                // If port 8080 is open, try HTTP API for player count
                if (altPort === 8080) {
                    const httpResult = await queryServerHTTP(resolvedIp, 8080);
                    if (httpResult) {
                        console.log(`${ip}: HTTP API on 8080 - ${httpResult.players} players`);
                        return httpResult;
                    }
                }

                console.log(`${ip}: Port ${altPort} open - marking as ONLINE`);
                return {
                    online: true,
                    players: 0,
                    maxPlayers: 100,
                    version: 'Hytale',
                };
            }
        }
    }

    console.log(`${ip}: All methods failed - OFFLINE`);
    return { online: false, players: 0, maxPlayers: 0 };
}

/**
 * Query server via API endpoint (for browser usage)
 */
async function queryServerViaAPI(
    ip: string,
    port: number
): Promise<ServerQueryResult> {
    try {
        const response = await fetch(`/api/query?ip=${encodeURIComponent(ip)}&port=${port}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            return { online: false, players: 0, maxPlayers: 0 };
        }

        const data = await response.json();
        return {
            online: data.online ?? false,
            players: data.players ?? 0,
            maxPlayers: data.maxPlayers ?? 0,
            motd: data.motd,
            version: data.version,
        };
    } catch (error) {
        console.error(`Error querying server ${ip}:${port}:`, error);
        return { online: false, players: 0, maxPlayers: 0 };
    }
}

// ===================================
// Batch Query Functions
// ===================================

export interface BatchQueryResult {
    ip: string;
    port: number;
    result: ServerQueryResult;
}

export async function queryServersInBatch(
    servers: Array<{ ip: string; port: number }>,
    concurrency: number = 5
): Promise<BatchQueryResult[]> {
    const results: BatchQueryResult[] = [];

    for (let i = 0; i < servers.length; i += concurrency) {
        const chunk = servers.slice(i, i + concurrency);
        const chunkResults = await Promise.all(
            chunk.map(async (server) => ({
                ip: server.ip,
                port: server.port,
                result: await queryServer(server.ip, server.port),
            }))
        );
        results.push(...chunkResults);
    }

    return results;
}

// ===================================
// Uptime Calculation
// ===================================

interface UptimeRecord {
    timestamp: Date;
    online: boolean;
}

export function calculateUptime(records: UptimeRecord[]): number {
    if (records.length === 0) return 0;
    const onlineCount = records.filter(r => r.online).length;
    return Math.round((onlineCount / records.length) * 100 * 10) / 10;
}
