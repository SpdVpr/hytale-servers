// ===================================
// CURSEFORGE API - Featured Mods Endpoint
// Get featured, popular and recently updated mods
// ===================================

import { NextRequest, NextResponse } from 'next/server';
import { getPopularMods, getRecentMods, modToReference, getFeaturedMods } from '@/lib/api/curseforge';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

        switch (type) {
            case 'popular': {
                const mods = await getPopularMods(limit);
                return NextResponse.json({
                    success: true,
                    type: 'popular',
                    mods,
                    count: mods.length,
                });
            }

            case 'recent': {
                const mods = await getRecentMods(limit);
                return NextResponse.json({
                    success: true,
                    type: 'recent',
                    mods,
                    count: mods.length,
                });
            }

            case 'featured': {
                try {
                    const featured = await getFeaturedMods();
                    return NextResponse.json({
                        success: true,
                        type: 'featured',
                        featured: featured.featured.map(modToReference),
                        popular: featured.popular.map(modToReference),
                        recentlyUpdated: featured.recentlyUpdated.map(modToReference),
                    });
                } catch (error) {
                    // Fallback to popular if featured fails
                    console.warn('Featured mods not available, falling back to popular:', error);
                    const mods = await getPopularMods(limit);
                    return NextResponse.json({
                        success: true,
                        type: 'popular_fallback',
                        mods,
                        count: mods.length,
                    });
                }
            }

            case 'all':
            default: {
                // Get all types in parallel
                const [popular, recent] = await Promise.all([
                    getPopularMods(Math.floor(limit / 2)),
                    getRecentMods(Math.floor(limit / 2)),
                ]);

                return NextResponse.json({
                    success: true,
                    type: 'all',
                    popular,
                    recent,
                    popularCount: popular.length,
                    recentCount: recent.length,
                });
            }
        }
    } catch (error) {
        console.error('CurseForge featured error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch featured mods',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
