// ===================================
// Server Data Fetching Utility (SSR)
// ===================================

import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Server, ServerCategory, CATEGORY_INFO } from '@/lib/types';

const SERVERS_COLLECTION = 'servers';

// Helper to convert Firestore data to Server type
function normalizeServer(doc: { id: string; data: () => Record<string, unknown> }): Server {
    const data = doc.data();
    const serverSlug = (data.slug as string) || (data.name as string)?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || doc.id;

    return {
        id: doc.id,
        slug: serverSlug,
        name: (data.name as string) || '',
        ip: (data.ip as string) || '',
        port: (data.port as number) || 5520,
        description: (data.description as string) || '',
        shortDescription: (data.shortDescription as string) || (data.description as string)?.slice(0, 150) || '',
        category: (data.category as ServerCategory) || 'survival',
        tags: (data.tags as string[]) || [],
        isOnline: (data.isOnline as boolean) || false,
        currentPlayers: (data.currentPlayers as number) || 0,
        maxPlayers: (data.maxPlayers as number) || 100,
        uptime: (data.uptime as number) || 0,
        lastPinged: (data.lastPinged as { toDate?: () => Date })?.toDate?.() || new Date(),
        votes: (data.votes as number) || 0,
        votesThisMonth: (data.votesThisMonth as number) || 0,
        website: (data.website as string) || undefined,
        discord: (data.discord as string) || undefined,
        banner: (data.banner as string) || undefined,
        gallery: (data.gallery as string[]) || [],
        logo: (data.logo as string) || undefined,
        country: (data.country as string) || 'US',
        language: (data.language as string[]) || ['en'],
        version: (data.version as string) || 'Unknown',
        isFeatured: (data.isFeatured as boolean) || false,
        isVerified: (data.isVerified as boolean) || false,
        isPremium: (data.isPremium as boolean) || false,
        averageRating: (data.averageRating as number) || 0,
        totalReviews: (data.totalReviews as number) || 0,
        ownerId: (data.ownerId as string) || undefined,
        ownerEmail: (data.ownerEmail as string) || undefined,
        createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
        updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.() || new Date(),
    };
}

/**
 * Fetch servers by category (SSR-safe)
 */
export async function getServersByCategory(category: ServerCategory): Promise<Server[]> {
    try {
        const q = query(
            collection(db, SERVERS_COLLECTION),
            where('category', '==', category),
            orderBy('votes', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => normalizeServer({ id: doc.id, data: () => doc.data() }));
    } catch (error) {
        console.error('Error fetching servers by category:', error);
        // Fallback: get all and filter
        try {
            const snapshot = await getDocs(collection(db, SERVERS_COLLECTION));
            return snapshot.docs
                .map(doc => normalizeServer({ id: doc.id, data: () => doc.data() }))
                .filter(s => s.category === category)
                .sort((a, b) => b.votes - a.votes);
        } catch {
            return [];
        }
    }
}

/**
 * Get all servers (SSR-safe)
 */
export async function getAllServers(): Promise<Server[]> {
    try {
        const snapshot = await getDocs(collection(db, SERVERS_COLLECTION));
        return snapshot.docs
            .map(doc => normalizeServer({ id: doc.id, data: () => doc.data() }))
            .sort((a, b) => b.votes - a.votes);
    } catch (error) {
        console.error('Error fetching all servers:', error);
        return [];
    }
}

/**
 * Get category statistics
 */
export async function getCategoryStats(): Promise<Record<ServerCategory, number>> {
    try {
        const servers = await getAllServers();
        const stats: Record<ServerCategory, number> = {
            survival: 0,
            pvp: 0,
            creative: 0,
            minigames: 0,
            roleplay: 0,
            adventure: 0,
            economy: 0,
            skyblock: 0,
            modded: 0,
            other: 0,
        };

        for (const server of servers) {
            if (stats[server.category] !== undefined) {
                stats[server.category]++;
            }
        }

        return stats;
    } catch (error) {
        console.error('Error fetching category stats:', error);
        return {
            survival: 0,
            pvp: 0,
            creative: 0,
            minigames: 0,
            roleplay: 0,
            adventure: 0,
            economy: 0,
            skyblock: 0,
            modded: 0,
            other: 0,
        };
    }
}
