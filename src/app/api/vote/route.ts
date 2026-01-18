import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    getDoc,
    updateDoc,
    addDoc,
    query,
    where,
    getDocs,
    Timestamp,
    increment
} from 'firebase/firestore';

// Vote for a server
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { serverId, userId, username, userEmail } = body;

        if (!serverId) {
            return NextResponse.json(
                { success: false, error: 'Server ID is required' },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'You must be logged in to vote' },
                { status: 401 }
            );
        }

        // Check if user already voted for this server today
        // Use simple query to avoid composite index requirement
        const votesRef = collection(db, 'votes');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Query only by serverId - simpler, no composite index needed
        const userVotesQuery = query(
            votesRef,
            where('serverId', '==', serverId),
            where('userId', '==', userId)
        );

        const userVotes = await getDocs(userVotesQuery);

        // Check if any vote was made today (filter in JS)
        const hasVotedToday = userVotes.docs.some(doc => {
            const voteDate = doc.data().votedAt?.toDate?.();
            if (!voteDate) return false;
            return voteDate >= today;
        });

        if (hasVotedToday) {
            return NextResponse.json(
                { success: false, error: 'You have already voted for this server today' },
                { status: 429 }
            );
        }

        // Verify server exists
        const serverRef = doc(db, 'servers', serverId);
        const serverSnap = await getDoc(serverRef);

        if (!serverSnap.exists()) {
            return NextResponse.json(
                { success: false, error: 'Server not found' },
                { status: 404 }
            );
        }

        // Create vote record
        const voteData = {
            serverId,
            userId,
            username: username || 'Anonymous',
            userEmail: userEmail || null,
            votedAt: Timestamp.now(),
        };

        await addDoc(votesRef, voteData);

        // Increment server vote counts
        await updateDoc(serverRef, {
            votes: increment(1),
            votesThisMonth: increment(1),
        });

        // Get updated server data
        const updatedServerSnap = await getDoc(serverRef);
        const updatedServer = updatedServerSnap.data();

        return NextResponse.json({
            success: true,
            message: 'Vote recorded successfully',
            newVoteCount: updatedServer?.votes || 0,
        });
    } catch (error) {
        console.error('Error processing vote:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process vote' },
            { status: 500 }
        );
    }
}

// Get vote history for a server
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const serverId = searchParams.get('serverId');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!serverId) {
            return NextResponse.json(
                { success: false, error: 'Server ID is required' },
                { status: 400 }
            );
        }

        // Get recent votes for this server
        const votesRef = collection(db, 'votes');
        const votesQuery = query(
            votesRef,
            where('serverId', '==', serverId)
        );

        const votesSnapshot = await getDocs(votesQuery);

        const votes = votesSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                votedAt: doc.data().votedAt?.toDate?.()?.toISOString() || null,
            }))
            .sort((a: any, b: any) => {
                const dateA = new Date(a.votedAt || 0).getTime();
                const dateB = new Date(b.votedAt || 0).getTime();
                return dateB - dateA;
            })
            .slice(0, limit);

        // Count total votes
        const totalVotes = votesSnapshot.size;

        return NextResponse.json({
            success: true,
            votes,
            totalVotes,
        });
    } catch (error) {
        console.error('Error fetching votes:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch votes' },
            { status: 500 }
        );
    }
}
