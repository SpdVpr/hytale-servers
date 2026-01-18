// ===================================
// User Ping API - Measures latency from user's browser
// GET /api/user-ping - Simple echo for round-trip measurement
// POST /api/user-ping - Ping specific server and return combined latency
// ===================================

import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SERVERS_COLLECTION = 'servers';

export async function GET(request: NextRequest) {
    const timestamp = Date.now();

    const cfCountry = request.headers.get('cf-ipcountry');
    const vercelCountry = request.headers.get('x-vercel-ip-country');
    const vercelCity = request.headers.get('x-vercel-ip-city');
    const vercelRegion = request.headers.get('x-vercel-ip-country-region');

    return NextResponse.json({
        success: true,
        timestamp,
        echo: true,
        location: {
            country: cfCountry || vercelCountry || 'unknown',
            city: vercelCity ? decodeURIComponent(vercelCity) : undefined,
            region: vercelRegion || undefined,
        }
    }, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Access-Control-Allow-Origin': '*',
        }
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { serverId, ip, port } = body;

        let serverIp = ip;
        let serverPort = port || 5520;
        let serverName = 'Unknown Server';

        if (serverId) {
            const serverDoc = await getDoc(doc(db, SERVERS_COLLECTION, serverId));
            if (!serverDoc.exists()) {
                return NextResponse.json({
                    success: false,
                    error: 'Server not found'
                }, { status: 404 });
            }

            const data = serverDoc.data();
            serverIp = data.ip;
            serverPort = data.port || 5520;
            serverName = data.name;
        }

        if (!serverIp) {
            return NextResponse.json({
                success: false,
                error: 'No server IP provided'
            }, { status: 400 });
        }

        const pingStart = Date.now();
        const serverLatency = await measureServerLatency(serverIp, serverPort);
        const pingEnd = Date.now();

        const cfCountry = request.headers.get('cf-ipcountry');
        const vercelCountry = request.headers.get('x-vercel-ip-country');
        const vercelCity = request.headers.get('x-vercel-ip-city');

        return NextResponse.json({
            success: true,
            serverId,
            serverName,
            serverIp,
            serverPort,
            latency: {
                serverLatency: serverLatency,
                measurementTime: pingEnd - pingStart,
                timestamp: Date.now(),
            },
            userLocation: {
                country: cfCountry || vercelCountry || 'unknown',
                city: vercelCity ? decodeURIComponent(vercelCity) : undefined,
            },
            rating: getLatencyRating(serverLatency),
        });

    } catch (error) {
        console.error('User ping error:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}

async function measureServerLatency(ip: string, port: number): Promise<number> {
    const tcpLatency = await measureTCPLatency(ip, port);
    if (tcpLatency !== null) {
        return tcpLatency;
    }

    const udpLatency = await measureUDPLatency(ip, port);
    if (udpLatency !== null) {
        return udpLatency;
    }

    const dnsLatency = await measureDNSLatency(ip);
    return dnsLatency;
}

async function measureTCPLatency(ip: string, port: number): Promise<number | null> {
    if (typeof window !== 'undefined') return null;

    try {
        const net = await import('net');

        return new Promise((resolve) => {
            const start = Date.now();
            const socket = net.createConnection({ host: ip, port, timeout: 3000 });

            const timeout = setTimeout(() => {
                socket.destroy();
                resolve(null);
            }, 3000);

            socket.on('connect', () => {
                const latency = Date.now() - start;
                clearTimeout(timeout);
                socket.destroy();
                resolve(latency);
            });

            socket.on('error', () => {
                clearTimeout(timeout);
                socket.destroy();
                resolve(null);
            });

            socket.on('timeout', () => {
                clearTimeout(timeout);
                socket.destroy();
                resolve(null);
            });
        });
    } catch {
        return null;
    }
}

async function measureUDPLatency(ip: string, port: number): Promise<number | null> {
    if (typeof window !== 'undefined') return null;

    try {
        const dgram = await import('dgram');
        const dns = await import('dns').then(m => m.promises);

        let resolvedIp = ip;
        if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
            try {
                const addresses = await dns.resolve4(ip);
                if (addresses.length > 0) resolvedIp = addresses[0];
            } catch { /* use hostname */ }
        }

        return new Promise((resolve) => {
            const socket = dgram.createSocket('udp4');
            const start = Date.now();
            let resolved = false;

            const cleanup = () => {
                if (!resolved) {
                    resolved = true;
                    try { socket.close(); } catch { /* ignore */ }
                }
            };

            const timeoutId = setTimeout(() => {
                cleanup();
                resolve(null);
            }, 2000);

            socket.on('message', () => {
                const latency = Date.now() - start;
                clearTimeout(timeoutId);
                cleanup();
                resolve(latency);
            });

            socket.on('error', () => {
                clearTimeout(timeoutId);
                cleanup();
                resolve(null);
            });

            const ping = Buffer.from('HYQUERY\x00\xFE\x01');
            socket.send(ping, 0, ping.length, port, resolvedIp, (err) => {
                if (err) {
                    clearTimeout(timeoutId);
                    cleanup();
                    resolve(null);
                }
            });
        });
    } catch {
        return null;
    }
}

async function measureDNSLatency(hostname: string): Promise<number> {
    if (typeof window !== 'undefined') return 999;

    try {
        const dns = await import('dns').then(m => m.promises);
        const start = Date.now();

        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
            return 50;
        }

        await dns.resolve4(hostname);
        const latency = Date.now() - start;

        return Math.max(latency * 3, 30);
    } catch {
        return 999;
    }
}

function getLatencyRating(latency: number): {
    label: string;
    color: string;
    emoji: string;
    score: number;
} {
    if (latency < 30) {
        return { label: 'Excellent', color: '#22c55e', emoji: '🟢', score: 5 };
    } else if (latency < 60) {
        return { label: 'Great', color: '#84cc16', emoji: '🟢', score: 4 };
    } else if (latency < 100) {
        return { label: 'Good', color: '#eab308', emoji: '🟡', score: 3 };
    } else if (latency < 150) {
        return { label: 'Fair', color: '#f97316', emoji: '🟠', score: 2 };
    } else if (latency < 250) {
        return { label: 'Poor', color: '#ef4444', emoji: '🔴', score: 1 };
    } else {
        return { label: 'Bad', color: '#dc2626', emoji: '🔴', score: 0 };
    }
}
