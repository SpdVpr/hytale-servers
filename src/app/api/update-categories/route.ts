import { NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Server category mappings based on descriptions
const SERVER_CATEGORIES: Record<string, string> = {
    'pvpht': 'pvp',
    'hytale-party': 'minigames',
    'elitehytale-pvp-no-lag-active-staff': 'pvp',
    'hytown': 'roleplay',
    'hylore': 'survival',
    'hyfable': 'survival',
    'hytale-box': 'creative',
    '2b2h': 'survival',
    'cozytale-kitpvp-and-more': 'minigames',
    'runeteria': 'roleplay',
    'topstrix': 'adventure', // HyStrix
    'dogecraft': 'economy',
    'hyspania': 'survival',
    'ru-inter-world-hytale-iw': 'survival',
    'hyt2b': 'survival',
    'primetale': 'other',
    'horizons-smp': 'survival',
    'runefall-net': 'minigames',
    'hyfyve': 'survival',
    'old-stronghold': 'adventure',
};

// PUT /api/update-categories - Update all server categories
export async function PUT() {
    try {
        const serversRef = collection(db, 'servers');
        const snapshot = await getDocs(serversRef);

        let updated = 0;
        const results: { name: string; slug: string; category: string }[] = [];

        const updatePromises = snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            const slug = data.slug;

            if (slug && SERVER_CATEGORIES[slug]) {
                const newCategory = SERVER_CATEGORIES[slug];
                await updateDoc(doc(db, 'servers', docSnapshot.id), {
                    category: newCategory
                });
                updated++;
                results.push({ name: data.name, slug, category: newCategory });
            }
        });

        await Promise.all(updatePromises);

        return NextResponse.json({
            success: true,
            message: `Updated categories for ${updated} servers`,
            results
        });
    } catch (error) {
        console.error('Error updating categories:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update categories' },
            { status: 500 }
        );
    }
}
