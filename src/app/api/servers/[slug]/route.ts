import { NextResponse } from 'next/server';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SERVERS_COLLECTION = 'servers';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    if (!slug) {
        return NextResponse.json(
            { success: false, error: 'Server slug is required' },
            { status: 400 }
        );
    }

    try {
        // Get all servers and find by slug or ID
        const snapshot = await getDocs(collection(db, SERVERS_COLLECTION));

        let serverDoc: Record<string, unknown> & { id: string } | null = null;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const docSlug = (data.slug as string) || (data.name as string)?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

            // Match by slug or by document ID
            if (docSlug === slug || doc.id === slug) {
                serverDoc = { id: doc.id, ...data };
                break;
            }
        }

        if (!serverDoc) {
            return NextResponse.json(
                { success: false, error: 'Server not found' },
                { status: 404 }
            );
        }

        // Generate slug if not present
        const serverSlug = (serverDoc.slug as string) || (serverDoc.name as string)?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || serverDoc.id;

        const server = {
            id: serverDoc.id,
            slug: serverSlug,
            name: (serverDoc.name as string) || '',
            ip: (serverDoc.ip as string) || '',
            port: (serverDoc.port as number) || 5520,
            description: (serverDoc.description as string) || '',
            shortDescription: (serverDoc.shortDescription as string) || (serverDoc.description as string)?.slice(0, 150) || '',
            category: (serverDoc.category as string) || 'survival',
            tags: (serverDoc.tags as string[]) || [],
            isOnline: (serverDoc.isOnline as boolean) || false,
            currentPlayers: (serverDoc.currentPlayers as number) || 0,
            maxPlayers: (serverDoc.maxPlayers as number) || 100,
            uptime: (serverDoc.uptime as number) || 0,
            votes: (serverDoc.votes as number) || 0,
            votesThisMonth: (serverDoc.votesThisMonth as number) || 0,
            website: (serverDoc.website as string) || null,
            discord: (serverDoc.discord as string) || null,
            banner: (serverDoc.banner as string) || null,
            gallery: (serverDoc.gallery as string[]) || [],
            country: (serverDoc.country as string) || 'US',
            language: (serverDoc.language as string[]) || ['en'],
            version: (serverDoc.version as string) || 'Unknown',
            isFeatured: (serverDoc.isFeatured as boolean) || false,
            isVerified: (serverDoc.isVerified as boolean) || false,
            isPremium: (serverDoc.isPremium as boolean) || false,
            // Owner info for edit/delete permissions
            ownerId: (serverDoc.ownerId as string) || null,
            ownerEmail: (serverDoc.ownerEmail as string) || null,
            createdAt: (serverDoc.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
            updatedAt: (serverDoc.updatedAt as { toDate?: () => Date })?.toDate?.() || new Date(),
        };

        return NextResponse.json({
            success: true,
            server,
        });
    } catch (error) {
        console.error('Error fetching server:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch server' },
            { status: 500 }
        );
    }
}
