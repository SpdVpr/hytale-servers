// ===================================
// Discord API Endpoint
// GET /api/discord?invite=xxx - Get Discord server info
// ===================================

import { NextResponse } from 'next/server';
import { getDiscordFromInvite, extractDiscordInviteCode } from '@/lib/api/discord';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const invite = searchParams.get('invite');

    if (!invite) {
        return NextResponse.json(
            { success: false, error: 'Discord invite URL or code is required' },
            { status: 400 }
        );
    }

    const inviteCode = extractDiscordInviteCode(invite);

    if (!inviteCode) {
        return NextResponse.json(
            { success: false, error: 'Invalid Discord invite format' },
            { status: 400 }
        );
    }

    try {
        const info = await getDiscordFromInvite(inviteCode);

        if (!info) {
            return NextResponse.json(
                { success: false, error: 'Could not fetch Discord info' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: info,
        });
    } catch (error) {
        console.error('Discord API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch Discord data' },
            { status: 500 }
        );
    }
}
