// ===================================
// Server Ping API Endpoint
// POST /api/ping - Ping all servers using multi-protocol approach
// GET /api/ping - Get current status from Firebase
// ===================================

import { NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { queryServer } from '@/lib/api/server-query';
import { recordUptimeCheck } from '@/lib/uptime';

const SERVERS_COLLECTION = 'servers';

export async function POST() {
    try {
        console.log('Starting multi-protocol server ping...');

        // Get all servers from Firebase
        const snapshot = await getDocs(collection(db, SERVERS_COLLECTION));

        if (snapshot.empty) {
            return NextResponse.json({
                success: false,
                error: 'No servers in database. Run seed first.',
            });
        }

        const servers = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
        })) as Array<{ id: string; name: string; ip: string; port: number }>;

        console.log(`Pinging ${servers.length} servers in parallel...`);

        // Ping all servers in parallel (batches of 8 for rate limiting)
        const BATCH_SIZE = 8;
        const results: Array<{ name: string; online: boolean; players: number }> = [];
        let online = 0;
        let totalPlayers = 0;

        for (let i = 0; i < servers.length; i += BATCH_SIZE) {
            const batch = servers.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.all(
                batch.map(async (server) => {
                    try {
                        const startTime = Date.now();
                        const queryResult = await queryServer(server.ip, server.port);
                        const latency = Date.now() - startTime;

                        // Update Firebase
                        await updateDoc(doc(db, SERVERS_COLLECTION, server.id), {
                            isOnline: queryResult.online,
                            currentPlayers: queryResult.players,
                            maxPlayers: queryResult.maxPlayers || 100,
                            version: queryResult.version || 'Hytale',
                            lastPinged: Timestamp.now(),
                            updatedAt: Timestamp.now(),
                        });

                        // Record uptime for history tracking
                        await recordUptimeCheck(
                            server.id,
                            queryResult.online,
                            queryResult.players,
                            latency
                        );

                        console.log(`${server.name}: ${queryResult.online ? 'ONLINE' : 'OFFLINE'} (${queryResult.players} players, ${latency}ms)`);

                        return {
                            name: server.name,
                            online: queryResult.online,
                            players: queryResult.players,
                        };
                    } catch (error) {
                        console.error(`Error pinging ${server.name}:`, error);
                        return {
                            name: server.name,
                            online: false,
                            players: 0,
                        };
                    }
                })
            );

            results.push(...batchResults);
            batchResults.forEach(r => {
                if (r.online) {
                    online++;
                    totalPlayers += r.players;
                }
            });
        }

        console.log(`Ping complete: ${online}/${servers.length} online, ${totalPlayers} players`);

        return NextResponse.json({
            success: true,
            message: `Pinged ${servers.length} servers`,
            summary: {
                total: servers.length,
                online,
                offline: servers.length - online,
                totalPlayers,
            },
            results,
        });

    } catch (error) {
        console.error('Error pinging servers:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const snapshot = await getDocs(collection(db, SERVERS_COLLECTION));

        const servers = snapshot.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                name: data.name,
                ip: data.ip,
                isOnline: data.isOnline,
                currentPlayers: data.currentPlayers,
                maxPlayers: data.maxPlayers,
                lastPinged: data.lastPinged?.toDate?.() || null,
            };
        });

        const onlineCount = servers.filter(s => s.isOnline).length;
        const totalPlayers = servers.reduce((sum, s) => sum + (s.currentPlayers || 0), 0);

        return NextResponse.json({
            success: true,
            summary: {
                total: servers.length,
                online: onlineCount,
                offline: servers.length - onlineCount,
                totalPlayers,
            },
            servers,
        });

    } catch (error) {
        console.error('Error getting status:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
