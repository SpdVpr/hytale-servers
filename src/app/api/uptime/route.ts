// ===================================
// Uptime API Endpoint
// GET /api/uptime?serverId=xxx - Get uptime stats for a server
// ===================================

import { NextResponse } from 'next/server';
import { getUptimeStats, aggregateUptimeForChart } from '@/lib/uptime';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get('serverId');
    const hours = parseInt(searchParams.get('hours') || '168'); // Default 7 days

    if (!serverId) {
        return NextResponse.json(
            { success: false, error: 'Server ID is required' },
            { status: 400 }
        );
    }

    try {
        const stats = await getUptimeStats(serverId, hours);
        const chartData = aggregateUptimeForChart(stats.history, Math.min(hours, 24));

        return NextResponse.json({
            success: true,
            data: {
                uptimePercentage: stats.uptimePercentage,
                avgPlayers: stats.avgPlayers,
                maxPlayers: stats.maxPlayers,
                totalChecks: stats.totalChecks,
                onlineChecks: stats.onlineChecks,
                chartData,
            },
        });
    } catch (error) {
        console.error('Error fetching uptime:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch uptime data' },
            { status: 500 }
        );
    }
}
