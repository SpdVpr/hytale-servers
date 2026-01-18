// ===================================
// CURSEFORGE API - Mod Detail Endpoint
// Get detailed information about a specific mod
// ===================================

import { NextRequest, NextResponse } from 'next/server';
import { getMod, getModDescription, modToReference } from '@/lib/api/curseforge';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ modId: string }> }
) {
    try {
        const { modId } = await params;
        const modIdNum = parseInt(modId);

        if (isNaN(modIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid mod ID' },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(request.url);
        const includeDescription = searchParams.get('description') === 'true';

        // Get mod details
        const mod = await getMod(modIdNum);
        const reference = modToReference(mod);

        // Optionally include full HTML description
        let description: string | null = null;
        if (includeDescription) {
            description = await getModDescription(modIdNum);
        }

        return NextResponse.json({
            success: true,
            mod: reference,
            fullMod: mod,
            description,
        });
    } catch (error) {
        console.error('CurseForge mod detail error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch mod details',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
