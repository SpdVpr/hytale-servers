import { NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// PUT /api/reset-votes - Reset all votes to 0
export async function PUT() {
    try {
        const serversRef = collection(db, 'servers');
        const snapshot = await getDocs(serversRef);

        let count = 0;
        const updatePromises = snapshot.docs.map(async (docSnapshot) => {
            await updateDoc(doc(db, 'servers', docSnapshot.id), {
                votes: 0,
                votesThisMonth: 0
            });
            count++;
        });

        await Promise.all(updatePromises);

        return NextResponse.json({
            success: true,
            message: `Reset votes for ${count} servers to 0`
        });
    } catch (error) {
        console.error('Error resetting votes:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to reset votes' },
            { status: 500 }
        );
    }
}
