// ===================================
// Server Import API Endpoint
// POST /api/import - Import servers from external APIs / scraped data
// ===================================

import { NextResponse } from 'next/server';
import { getHytaleTop100Seeds } from '@/lib/api/hytaletop100-scraper';
import { importAllServers } from '@/lib/api/external-servers';

// Store imported servers in memory for now
// TODO: Replace with Firebase storage
let importedServers: Awaited<ReturnType<typeof getHytaleTop100Seeds>> = [];

export async function POST(request: Request) {
    try {
        // Optional: Add authentication check here
        const authHeader = request.headers.get('authorization');
        const expectedKey = process.env.IMPORT_API_KEY;

        if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('Starting server import...');

        // First, try to get scraped data from HytaleTop100
        const scrapedServers = getHytaleTop100Seeds();
        console.log(`Got ${scrapedServers.length} servers from HytaleTop100 scraper`);

        // Then try external APIs (these might fail or return empty)
        let externalResult = { total: 0, sources: {} as Record<string, number>, servers: [] as typeof scrapedServers };
        try {
            externalResult = await importAllServers();
            console.log(`Got ${externalResult.total} servers from external APIs`);
        } catch (error) {
            console.log('External API import failed, using scraped data only');
        }

        // Combine all servers, preferring scraped data
        const allServers = [...scrapedServers];

        // Add any external servers that aren't duplicates
        for (const external of externalResult.servers) {
            const exists = allServers.some(s =>
                s.ip.toLowerCase() === external.ip.toLowerCase() ||
                s.name.toLowerCase() === external.name.toLowerCase()
            );
            if (!exists) {
                allServers.push(external);
            }
        }

        // Store in memory
        importedServers = allServers;

        return NextResponse.json({
            success: true,
            message: `Successfully imported ${allServers.length} servers`,
            total: allServers.length,
            sources: {
                'hytaletop100.com (scraped)': scrapedServers.length,
                ...externalResult.sources,
            },
        });
    } catch (error) {
        console.error('Error importing servers:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to import servers' },
            { status: 500 }
        );
    }
}

export async function GET() {
    // If no imported servers, load from scraper
    if (importedServers.length === 0) {
        importedServers = getHytaleTop100Seeds();
    }

    return NextResponse.json({
        success: true,
        count: importedServers.length,
        servers: importedServers,
    });
}
