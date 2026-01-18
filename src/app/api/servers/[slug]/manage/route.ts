import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SERVERS_COLLECTION = 'servers';

// PUT /api/servers/[slug]/manage - Update server
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const { userId, updates } = body;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User not authenticated' },
                { status: 401 }
            );
        }

        // Find server by slug
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const serversRef = collection(db, SERVERS_COLLECTION);
        const q = query(serversRef, where('slug', '==', slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json(
                { success: false, error: 'Server not found' },
                { status: 404 }
            );
        }

        const serverDoc = snapshot.docs[0];
        const serverData = serverDoc.data();

        // Check ownership
        if (serverData.ownerId !== userId) {
            return NextResponse.json(
                { success: false, error: 'You do not own this server' },
                { status: 403 }
            );
        }

        // Allowed fields to update
        const allowedFields = [
            'name', 'description', 'shortDescription', 'category',
            'tags', 'website', 'discord', 'banner', 'gallery'
        ];

        const sanitizedUpdates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                sanitizedUpdates[field] = updates[field];
            }
        }

        sanitizedUpdates.updatedAt = new Date();

        await updateDoc(doc(db, SERVERS_COLLECTION, serverDoc.id), sanitizedUpdates);

        return NextResponse.json({
            success: true,
            message: 'Server updated successfully'
        });

    } catch (error) {
        console.error('Error updating server:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update server' },
            { status: 500 }
        );
    }
}

// DELETE /api/servers/[slug]/manage - Delete server
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User not authenticated' },
                { status: 401 }
            );
        }

        // Find server by slug
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const serversRef = collection(db, SERVERS_COLLECTION);
        const q = query(serversRef, where('slug', '==', slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json(
                { success: false, error: 'Server not found' },
                { status: 404 }
            );
        }

        const serverDoc = snapshot.docs[0];
        const serverData = serverDoc.data();

        // Check ownership
        if (serverData.ownerId !== userId) {
            return NextResponse.json(
                { success: false, error: 'You do not own this server' },
                { status: 403 }
            );
        }

        await deleteDoc(doc(db, SERVERS_COLLECTION, serverDoc.id));

        return NextResponse.json({
            success: true,
            message: 'Server deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting server:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete server' },
            { status: 500 }
        );
    }
}
