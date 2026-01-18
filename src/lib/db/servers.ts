// ===================================
// Server Database Service
// Firebase Firestore Operations for Servers
// ===================================

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot,
    Timestamp,
    increment,
    writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Server, ServerSubmission, ServerCategory, PaginatedResponse } from '@/lib/types';

// Collection references
const SERVERS_COLLECTION = 'servers';
const VOTES_COLLECTION = 'votes';

// ===================================
// Type Conversions
// ===================================

function firestoreToServer(doc: DocumentSnapshot): Server | null {
    const data = doc.data();
    if (!data) return null;

    return {
        id: doc.id,
        name: data.name,
        ip: data.ip,
        port: data.port,
        description: data.description,
        shortDescription: data.shortDescription,
        category: data.category as ServerCategory,
        tags: data.tags || [],
        isOnline: data.isOnline ?? true,
        currentPlayers: data.currentPlayers ?? 0,
        maxPlayers: data.maxPlayers ?? 100,
        uptime: data.uptime ?? 0,
        lastPinged: data.lastPinged?.toDate() ?? new Date(),
        votes: data.votes ?? 0,
        votesThisMonth: data.votesThisMonth ?? 0,
        website: data.website,
        discord: data.discord,
        country: data.country,
        language: data.language || ['en'],
        version: data.version ?? '1.0.0',
        banner: data.banner,
        logo: data.logo,
        worldShareCode: data.worldShareCode,
        previewUrl: data.previewUrl,
        isFeatured: data.isFeatured ?? false,
        isVerified: data.isVerified ?? false,
        isPremium: data.isPremium ?? false,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
    };
}

// ===================================
// Read Operations
// ===================================

export async function getServerById(id: string): Promise<Server | null> {
    try {
        const docRef = doc(db, SERVERS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        return firestoreToServer(docSnap);
    } catch (error) {
        console.error('Error getting server:', error);
        return null;
    }
}

export async function getAllServers(): Promise<Server[]> {
    try {
        const q = query(
            collection(db, SERVERS_COLLECTION),
            orderBy('votes', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => firestoreToServer(doc))
            .filter((s): s is Server => s !== null);
    } catch (error) {
        console.error('Error getting servers:', error);
        return [];
    }
}

export async function getServersPaginated(
    pageSize: number = 20,
    lastDoc?: DocumentSnapshot,
    filters?: {
        category?: ServerCategory;
        onlineOnly?: boolean;
        featured?: boolean;
    },
    sortBy: 'votes' | 'players' | 'newest' = 'votes'
): Promise<PaginatedResponse<Server>> {
    try {
        const constraints = [];

        // Add filters
        if (filters?.category) {
            constraints.push(where('category', '==', filters.category));
        }
        if (filters?.onlineOnly) {
            constraints.push(where('isOnline', '==', true));
        }
        if (filters?.featured) {
            constraints.push(where('isFeatured', '==', true));
        }

        // Add sorting
        const sortField = sortBy === 'votes' ? 'votes'
            : sortBy === 'players' ? 'currentPlayers'
                : 'createdAt';
        constraints.push(orderBy(sortField, 'desc'));

        // Add pagination
        constraints.push(limit(pageSize + 1)); // Get one extra to check if there's more
        if (lastDoc) {
            constraints.push(startAfter(lastDoc));
        }

        const q = query(collection(db, SERVERS_COLLECTION), ...constraints);
        const snapshot = await getDocs(q);

        const servers = snapshot.docs
            .slice(0, pageSize)
            .map(doc => firestoreToServer(doc))
            .filter((s): s is Server => s !== null);

        const hasMore = snapshot.docs.length > pageSize;

        return {
            data: servers,
            total: -1, // Firestore doesn't provide total count efficiently
            page: -1,
            pageSize,
            totalPages: -1,
        };
    } catch (error) {
        console.error('Error getting paginated servers:', error);
        return { data: [], total: 0, page: 1, pageSize, totalPages: 0 };
    }
}

export async function getTopServers(count: number = 10): Promise<Server[]> {
    try {
        const q = query(
            collection(db, SERVERS_COLLECTION),
            orderBy('votes', 'desc'),
            limit(count)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => firestoreToServer(doc))
            .filter((s): s is Server => s !== null);
    } catch (error) {
        console.error('Error getting top servers:', error);
        return [];
    }
}

export async function getFeaturedServers(): Promise<Server[]> {
    try {
        const q = query(
            collection(db, SERVERS_COLLECTION),
            where('isFeatured', '==', true),
            where('isOnline', '==', true),
            orderBy('votes', 'desc'),
            limit(6)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => firestoreToServer(doc))
            .filter((s): s is Server => s !== null);
    } catch (error) {
        console.error('Error getting featured servers:', error);
        return [];
    }
}

export async function searchServers(
    searchTerm: string,
    category?: ServerCategory,
    onlineOnly?: boolean
): Promise<Server[]> {
    // Note: Firestore doesn't support full-text search natively
    // For production, consider using Algolia or Elasticsearch
    // This is a basic implementation that fetches all and filters client-side
    try {
        const constraints = [];

        if (category) {
            constraints.push(where('category', '==', category));
        }
        if (onlineOnly) {
            constraints.push(where('isOnline', '==', true));
        }
        constraints.push(orderBy('votes', 'desc'));
        constraints.push(limit(100));

        const q = query(collection(db, SERVERS_COLLECTION), ...constraints);
        const snapshot = await getDocs(q);

        let servers = snapshot.docs
            .map(doc => firestoreToServer(doc))
            .filter((s): s is Server => s !== null);

        // Client-side search filtering
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            servers = servers.filter(s =>
                s.name.toLowerCase().includes(term) ||
                s.description.toLowerCase().includes(term) ||
                s.tags.some(t => t.toLowerCase().includes(term))
            );
        }

        return servers;
    } catch (error) {
        console.error('Error searching servers:', error);
        return [];
    }
}

// ===================================
// Write Operations
// ===================================

export async function createServer(submission: ServerSubmission): Promise<string | null> {
    try {
        const serverData = {
            ...submission,
            isOnline: true,
            currentPlayers: 0,
            maxPlayers: 100,
            uptime: 100,
            lastPinged: Timestamp.now(),
            votes: 0,
            votesThisMonth: 0,
            isFeatured: false,
            isVerified: false,
            isPremium: false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, SERVERS_COLLECTION), serverData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating server:', error);
        return null;
    }
}

export async function updateServer(id: string, updates: Partial<Server>): Promise<boolean> {
    try {
        const docRef = doc(db, SERVERS_COLLECTION, id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: Timestamp.now(),
        });
        return true;
    } catch (error) {
        console.error('Error updating server:', error);
        return false;
    }
}

export async function deleteServer(id: string): Promise<boolean> {
    try {
        await deleteDoc(doc(db, SERVERS_COLLECTION, id));
        return true;
    } catch (error) {
        console.error('Error deleting server:', error);
        return false;
    }
}

// ===================================
// Voting Operations
// ===================================

export async function voteForServer(
    serverId: string,
    visitorId: string
): Promise<{ success: boolean; message: string }> {
    try {
        // Check if user already voted in last 24 hours
        const voteId = `${serverId}_${visitorId}`;
        const voteRef = doc(db, VOTES_COLLECTION, voteId);
        const voteSnap = await getDoc(voteRef);

        if (voteSnap.exists()) {
            const lastVote = voteSnap.data().votedAt?.toDate();
            if (lastVote) {
                const hoursSinceVote = (Date.now() - lastVote.getTime()) / (1000 * 60 * 60);
                if (hoursSinceVote < 24) {
                    return { success: false, message: 'You can only vote once every 24 hours' };
                }
            }
        }

        // Use batch write for atomicity
        const batch = writeBatch(db);

        // Update or create vote record
        batch.set(voteRef, {
            serverId,
            visitorId,
            votedAt: Timestamp.now(),
        });

        // Increment server vote count
        const serverRef = doc(db, SERVERS_COLLECTION, serverId);
        batch.update(serverRef, {
            votes: increment(1),
            votesThisMonth: increment(1),
            updatedAt: Timestamp.now(),
        });

        await batch.commit();

        return { success: true, message: 'Vote registered successfully' };
    } catch (error) {
        console.error('Error voting for server:', error);
        return { success: false, message: 'Failed to register vote' };
    }
}

export async function checkVoteStatus(
    serverId: string,
    visitorId: string
): Promise<{ canVote: boolean; lastVoted?: Date }> {
    try {
        const voteId = `${serverId}_${visitorId}`;
        const voteRef = doc(db, VOTES_COLLECTION, voteId);
        const voteSnap = await getDoc(voteRef);

        if (!voteSnap.exists()) {
            return { canVote: true };
        }

        const lastVote = voteSnap.data().votedAt?.toDate();
        if (lastVote) {
            const hoursSinceVote = (Date.now() - lastVote.getTime()) / (1000 * 60 * 60);
            return {
                canVote: hoursSinceVote >= 24,
                lastVoted: lastVote,
            };
        }

        return { canVote: true };
    } catch (error) {
        console.error('Error checking vote status:', error);
        return { canVote: true };
    }
}

// ===================================
// Statistics
// ===================================

export async function getServerStats(): Promise<{
    totalServers: number;
    totalPlayers: number;
    totalVotes: number;
    onlineServers: number;
}> {
    try {
        const snapshot = await getDocs(collection(db, SERVERS_COLLECTION));

        let totalPlayers = 0;
        let totalVotes = 0;
        let onlineServers = 0;

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            totalPlayers += data.currentPlayers || 0;
            totalVotes += data.votes || 0;
            if (data.isOnline) onlineServers++;
        });

        return {
            totalServers: snapshot.size,
            totalPlayers,
            totalVotes,
            onlineServers,
        };
    } catch (error) {
        console.error('Error getting server stats:', error);
        return { totalServers: 0, totalPlayers: 0, totalVotes: 0, onlineServers: 0 };
    }
}

// ===================================
// Bulk Operations (for importing)
// ===================================

export async function bulkImportServers(servers: Omit<Server, 'id'>[]): Promise<number> {
    try {
        const batch = writeBatch(db);
        let count = 0;

        for (const server of servers) {
            if (count >= 500) {
                // Firestore batch limit is 500
                await batch.commit();
                count = 0;
            }

            const docRef = doc(collection(db, SERVERS_COLLECTION));
            batch.set(docRef, {
                ...server,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
            count++;
        }

        if (count > 0) {
            await batch.commit();
        }

        return servers.length;
    } catch (error) {
        console.error('Error bulk importing servers:', error);
        return 0;
    }
}
