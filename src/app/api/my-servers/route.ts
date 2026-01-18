import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SERVERS_COLLECTION = 'servers';

// GET /api/my-servers?userId=xxx - Get all servers owned by user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID required' },
                { status: 400 }
            );
        }

        const serversRef = collection(db, SERVERS_COLLECTION);
        const q = query(serversRef, where('ownerId', '==', userId));
        const snapshot = await getDocs(q);

        const servers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            lastPinged: doc.data().lastPinged?.toDate?.() || new Date(0),
        }));

        // Sort by creation date (newest first)
        servers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            success: true,
            servers,
            count: servers.length
        });

    } catch (error) {
        console.error('Error fetching user servers:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch servers' },
            { status: 500 }
        );
    }
}
