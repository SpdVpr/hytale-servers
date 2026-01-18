// ===================================
// Server Query API Endpoint
// GET /api/query?ip=xxx&port=xxx
// ===================================

import { NextResponse } from 'next/server';
import { queryServer } from '@/lib/api/server-query';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const ip = searchParams.get('ip');
    const port = parseInt(searchParams.get('port') || '5520');

    if (!ip) {
        return NextResponse.json(
            { success: false, error: 'IP address is required' },
            { status: 400 }
        );
    }

    // Validate IP format (basic check)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+$/;

    if (!ipRegex.test(ip)) {
        return NextResponse.json(
            { success: false, error: 'Invalid IP address or hostname' },
            { status: 400 }
        );
    }

    try {
        const result = await queryServer(ip, port);

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('Error querying server:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to query server' },
            { status: 500 }
        );
    }
}
