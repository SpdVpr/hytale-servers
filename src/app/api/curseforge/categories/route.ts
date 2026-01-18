// ===================================
// CURSEFORGE API - Categories Endpoint
// Get available mod categories
// ===================================

import { NextResponse } from 'next/server';
import { getHytaleCategories, discoverGames } from '@/lib/api/curseforge';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // First try to get Hytale categories
        try {
            const categories = await getHytaleCategories();
            return NextResponse.json({
                success: true,
                categories: categories.map(c => ({
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    iconUrl: c.iconUrl,
                    isClass: c.isClass,
                    parentCategoryId: c.parentCategoryId,
                })),
            });
        } catch (hytaleError) {
            // If Hytale not found, return available games for discovery
            console.warn('Hytale categories not found, discovering games:', hytaleError);

            const { games, hytaleId } = await discoverGames();

            return NextResponse.json({
                success: false,
                error: 'Hytale game not found in CurseForge',
                hytaleId,
                availableGames: games.slice(0, 20).map(g => ({
                    id: g.id,
                    name: g.name,
                    slug: g.slug,
                })),
            });
        }
    } catch (error) {
        console.error('CurseForge categories error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch categories',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
