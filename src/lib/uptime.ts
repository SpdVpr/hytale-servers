// ===================================
// Uptime History System
// Track and display server uptime over time
// ===================================

import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const UPTIME_COLLECTION = 'uptime_history';

export interface UptimeRecord {
    serverId: string;
    timestamp: Date;
    online: boolean;
    players: number;
    latency?: number;
}

export interface UptimeStats {
    serverId: string;
    uptimePercentage: number;
    avgPlayers: number;
    maxPlayers: number;
    totalChecks: number;
    onlineChecks: number;
    history: UptimeRecord[];
}

/**
 * Record a server's status for uptime tracking
 */
export async function recordUptimeCheck(
    serverId: string,
    online: boolean,
    players: number = 0,
    latency?: number
): Promise<void> {
    try {
        await addDoc(collection(db, UPTIME_COLLECTION), {
            serverId,
            timestamp: Timestamp.now(),
            online,
            players,
            latency: latency || null,
        });
    } catch (error) {
        console.error('Error recording uptime:', error);
    }
}

/**
 * Get uptime history for a server
 */
export async function getUptimeHistory(
    serverId: string,
    hours: number = 168 // 7 days default
): Promise<UptimeRecord[]> {
    try {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

        const q = query(
            collection(db, UPTIME_COLLECTION),
            where('serverId', '==', serverId),
            where('timestamp', '>=', Timestamp.fromDate(cutoff)),
            orderBy('timestamp', 'desc'),
            limit(500)
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                serverId: data.serverId,
                timestamp: data.timestamp.toDate(),
                online: data.online,
                players: data.players,
                latency: data.latency,
            };
        });
    } catch (error) {
        console.error('Error getting uptime history:', error);
        return [];
    }
}

/**
 * Calculate uptime statistics for a server
 */
export async function getUptimeStats(
    serverId: string,
    hours: number = 168
): Promise<UptimeStats> {
    const history = await getUptimeHistory(serverId, hours);

    const totalChecks = history.length;
    const onlineChecks = history.filter(r => r.online).length;
    const uptimePercentage = totalChecks > 0
        ? Math.round((onlineChecks / totalChecks) * 100 * 10) / 10
        : 0;

    const playerCounts = history.filter(r => r.online).map(r => r.players);
    const avgPlayers = playerCounts.length > 0
        ? Math.round(playerCounts.reduce((a, b) => a + b, 0) / playerCounts.length)
        : 0;
    const maxPlayers = playerCounts.length > 0
        ? Math.max(...playerCounts)
        : 0;

    return {
        serverId,
        uptimePercentage,
        avgPlayers,
        maxPlayers,
        totalChecks,
        onlineChecks,
        history: history.slice(0, 100), // Return last 100 for charts
    };
}

/**
 * Generate uptime data for chart display
 * Returns hourly aggregated data
 */
export function aggregateUptimeForChart(
    history: UptimeRecord[],
    hours: number = 24
): Array<{ hour: string; uptime: number; players: number }> {
    const now = new Date();
    const result: Array<{ hour: string; uptime: number; players: number }> = [];

    for (let i = hours - 1; i >= 0; i--) {
        const hourStart = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000);
        const hourEnd = new Date(now.getTime() - i * 60 * 60 * 1000);

        const hourRecords = history.filter(r =>
            r.timestamp >= hourStart && r.timestamp < hourEnd
        );

        const onlineCount = hourRecords.filter(r => r.online).length;
        const uptime = hourRecords.length > 0
            ? Math.round((onlineCount / hourRecords.length) * 100)
            : 0;

        const avgPlayers = hourRecords.length > 0
            ? Math.round(hourRecords.reduce((sum, r) => sum + r.players, 0) / hourRecords.length)
            : 0;

        result.push({
            hour: hourEnd.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }),
            uptime,
            players: avgPlayers,
        });
    }

    return result;
}
