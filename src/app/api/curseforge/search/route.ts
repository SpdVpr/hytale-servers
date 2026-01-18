// ===================================
// CURSEFORGE API - Search Endpoint
// Provides mod search functionality for autocomplete and category filtering
// ===================================

import { NextRequest, NextResponse } from 'next/server';
import { searchMods, modToReference, getPopularMods } from '@/lib/api/curseforge';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || searchParams.get('query') || '';
        const categoryId = searchParams.get('categoryId');
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

        // If filtering by category
        if (categoryId) {
            const categoryIdNum = parseInt(categoryId);
            if (!isNaN(categoryIdNum)) {
                const result = await searchMods({
                    categoryId: categoryIdNum,
                    searchFilter: query || undefined,
                    pageSize: limit,
                    sortField: 'Popularity',
                    sortOrder: 'desc',
                });

                return NextResponse.json({
                    success: true,
                    mods: result.data.map(modToReference),
                    categoryId: categoryIdNum,
                    query: query || null,
                    count: result.data.length,
                    total: result.pagination.totalCount,
                });
            }
        }

        // If no query and no category, return popular mods
        if (!query.trim()) {
            const popularMods = await getPopularMods(limit);
            return NextResponse.json({
                success: true,
                mods: popularMods,
                query: '',
                source: 'popular',
            });
        }

        // Search for mods matching the query
        const result = await searchMods({
            searchFilter: query,
            pageSize: limit,
            sortField: 'Popularity',
            sortOrder: 'desc',
        });

        return NextResponse.json({
            success: true,
            mods: result.data.map(modToReference),
            query,
            count: result.data.length,
            total: result.pagination.totalCount,
        });
    } catch (error) {
        console.error('CurseForge search error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to search mods',
                details: errorMessage,
                mods: [],
            },
            { status: 500 }
        );
    }
}
