import { redirect } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export default async function RandomPage() {
    try {
        // Fetch all servers
        const snapshot = await getDocs(collection(db, 'servers'));

        if (snapshot.empty) {
            redirect('/servers');
        }

        // Pick a random server
        const servers = snapshot.docs;
        const randomIndex = Math.floor(Math.random() * servers.length);
        const randomServer = servers[randomIndex];
        const slug = randomServer.data().slug || randomServer.id;

        // Redirect to random server
        redirect(`/servers/${slug}`);
    } catch (error) {
        console.error('Error getting random server:', error);
        redirect('/servers');
    }
}
