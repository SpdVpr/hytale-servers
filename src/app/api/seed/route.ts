// ===================================
// Database Seed API Endpoint
// POST /api/seed - Upload servers to Firebase Firestore
// ===================================

import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getHytaleTop100Seeds } from '@/lib/api/hytaletop100-scraper';
import scrapedServers from '@/lib/api/scraped-servers.json';

const SERVERS_COLLECTION = 'servers';

/**
 * Remove undefined values from object (Firebase doesn't accept undefined)
 */
function removeUndefined<T extends Record<string, unknown>>(obj: T): T {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result as T;
}

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const clearExisting = searchParams.get('clear') === 'true';

        console.log('Starting database seed...');

        // Optionally clear existing data
        if (clearExisting) {
            console.log('Clearing existing servers...');
            const existingDocs = await getDocs(collection(db, SERVERS_COLLECTION));
            const deletePromises = existingDocs.docs.map(d => deleteDoc(doc(db, SERVERS_COLLECTION, d.id)));
            await Promise.all(deletePromises);
            console.log(`Deleted ${existingDocs.size} existing servers`);
        }

        // Get scraped servers (prioritize freshly scraped data)
        const useScraped = searchParams.get('source') !== 'legacy';

        interface ScrapedServer {
            name: string;
            slug: string;
            ip: string;
            port: number;
            description: string;
            country: string;
            votes: number;
            discord: string | null;
            website: string | null;
            banner: string | null;
        }

        let serversToSeed: ScrapedServer[];

        if (useScraped && scrapedServers.length > 0) {
            console.log('Using scraped-servers.json (with banners)');
            serversToSeed = scrapedServers as ScrapedServer[];
        } else {
            console.log('Using hytaletop100-scraper.ts (legacy)');
            const legacyServers = getHytaleTop100Seeds();
            serversToSeed = legacyServers.map(s => ({
                name: s.name,
                slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                ip: s.ip,
                port: s.port,
                description: s.description,
                country: s.country || 'US',
                votes: s.votes || 0,
                discord: s.discord || null,
                website: s.website || null,
                banner: s.banner || null,
            }));
        }

        console.log(`Seeding ${serversToSeed.length} servers...`);

        // Upload to Firestore
        const results = [];
        for (const server of serversToSeed) {
            try {
                // Remove undefined values and convert dates
                const serverData = removeUndefined({
                    name: server.name,
                    slug: server.slug,
                    ip: server.ip,
                    port: server.port,
                    description: server.description,
                    shortDescription: server.description.substring(0, 150),
                    category: 'survival',
                    tags: [],
                    banner: server.banner,
                    isOnline: false,
                    currentPlayers: 0,
                    maxPlayers: 100,
                    uptime: 0,
                    lastPinged: Timestamp.fromDate(new Date(0)),
                    votes: 0, // Reset to 0 for fair voting
                    votesThisMonth: 0,
                    website: server.website,
                    discord: server.discord,
                    country: server.country,
                    language: ['en'],
                    version: 'Unknown',
                    isFeatured: server.votes > 150,
                    isVerified: server.discord !== null,
                    isPremium: false,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });

                const docRef = await addDoc(collection(db, SERVERS_COLLECTION), serverData);
                results.push({ name: server.name, id: docRef.id, success: true });
                console.log(`Added: ${server.name} (${docRef.id})`);
            } catch (error) {
                console.error(`Failed to add ${server.name}:`, error);
                results.push({ name: server.name, success: false, error: String(error) });
            }
        }

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        return NextResponse.json({
            success: true,
            message: `Seeded ${successful} servers (${failed} failed)`,
            total: serversToSeed.length,
            successful,
            failed,
            results,
        });
    } catch (error) {
        console.error('Error seeding database:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Get current count from Firestore
        const snapshot = await getDocs(collection(db, SERVERS_COLLECTION));

        return NextResponse.json({
            success: true,
            count: snapshot.size,
            message: `Database has ${snapshot.size} servers`,
        });
    } catch (error) {
        console.error('Error checking database:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        // Clear all servers
        const existingDocs = await getDocs(collection(db, SERVERS_COLLECTION));
        const deletePromises = existingDocs.docs.map(d => deleteDoc(doc(db, SERVERS_COLLECTION, d.id)));
        await Promise.all(deletePromises);

        return NextResponse.json({
            success: true,
            message: `Deleted ${existingDocs.size} servers`,
            deleted: existingDocs.size,
        });
    } catch (error) {
        console.error('Error clearing database:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
