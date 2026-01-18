// ===================================
// Sync Status API Endpoint
// POST /api/sync-status - Sync server status from HytaleTop100 aggregator
// GET /api/sync-status - Check sync status
// ===================================

import { NextResponse } from 'next/server';
import { fetchHytaleTop100Status, syncStatusFromHytaleTop100 } from '@/lib/api/hytaletop100-status';

/**
 * POST - Sync status from HytaleTop100
 * This uses their whitelisted crawlers to get more reliable player counts
 */
export async function POST() {
    try {
        console.log('Starting aggregator sync from HytaleTop100...');

        const result = await syncStatusFromHytaleTop100();

        return NextResponse.json({
            success: true,
            message: 'Synced status from HytaleTop100',
            ...result,
        });
    } catch (error) {
        console.error('Error syncing status:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

/**
 * GET - Fetch raw status data from HytaleTop100 (for debugging)
 */
export async function GET() {
    try {
        const statuses = await fetchHytaleTop100Status();

        return NextResponse.json({
            success: true,
            count: statuses.length,
            servers: statuses,
        });
    } catch (error) {
        console.error('Error fetching status:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
