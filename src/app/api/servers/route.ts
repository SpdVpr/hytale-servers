import { NextResponse } from 'next/server';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SERVERS_COLLECTION = 'servers';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const sortBy = searchParams.get('sortBy') || 'votes';
    const onlineOnly = searchParams.get('onlineOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    try {
        // Get servers from Firebase
        const snapshot = await getDocs(collection(db, SERVERS_COLLECTION));

        let servers = snapshot.docs.map(doc => {
            const data = doc.data();
            // Generate slug if not present
            const slug = data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || doc.id;
            return {
                id: doc.id,
                slug: slug,
                name: data.name || '',
                ip: data.ip || '',
                port: data.port || 5520,
                description: data.description || '',
                shortDescription: data.shortDescription || data.description?.slice(0, 150) || '',
                category: data.category || 'survival',
                tags: data.tags || [],
                banner: data.banner || null,
                isOnline: data.isOnline || false,
                currentPlayers: data.currentPlayers || 0,
                maxPlayers: data.maxPlayers || 100,
                uptime: data.uptime || 0,
                votes: data.votes || 0,
                votesThisMonth: data.votesThisMonth || 0,
                website: data.website || null,
                discord: data.discord || null,
                country: data.country || 'US',
                language: data.language || ['en'],
                version: data.version || 'Unknown',
                isFeatured: data.isFeatured || false,
                isVerified: data.isVerified || false,
                isPremium: data.isPremium || false,
                averageRating: data.averageRating || 0,
                totalReviews: data.totalReviews || 0,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
            };
        });

        // Filter by search
        if (search) {
            const q = search.toLowerCase();
            servers = servers.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.tags.some((t: string) => t.toLowerCase().includes(q))
            );
        }

        // Filter by category
        if (category && category !== 'all') {
            servers = servers.filter(s => s.category === category);
        }

        // Filter online only
        if (onlineOnly) {
            servers = servers.filter(s => s.isOnline);
        }

        // Sort
        servers.sort((a, b) => {
            switch (sortBy) {
                case 'votes': return b.votes - a.votes;
                case 'players': return b.currentPlayers - a.currentPlayers;
                case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'name': return a.name.localeCompare(b.name);
                default: return 0;
            }
        });

        // Paginate
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedServers = servers.slice(startIndex, endIndex);

        // Stats
        const onlineCount = servers.filter(s => s.isOnline).length;
        const totalPlayers = servers.reduce((sum, s) => sum + s.currentPlayers, 0);

        return NextResponse.json({
            success: true,
            servers: paginatedServers,
            pagination: {
                page,
                pageSize,
                total: servers.length,
                totalPages: Math.ceil(servers.length / pageSize),
            },
            stats: {
                totalServers: servers.length,
                onlineServers: onlineCount,
                totalPlayers,
                totalVotes: servers.reduce((sum, s) => sum + s.votes, 0),
            },
        });
    } catch (error) {
        console.error('Error fetching servers:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch servers' },
            { status: 500 }
        );
    }
}

