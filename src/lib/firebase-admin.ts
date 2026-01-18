// ===================================
// Firebase Admin Configuration (Server-side only)
// ===================================

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App | undefined;
let adminDb: Firestore | undefined;
let adminAuth: Auth | undefined;

function initializeAdminApp(): App {
    if (getApps().length === 0) {
        // Check if we have service account credentials
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (serviceAccount) {
            try {
                const credentials = JSON.parse(serviceAccount);
                return initializeApp({
                    credential: cert(credentials),
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                });
            } catch (error) {
                console.error('Error parsing Firebase service account:', error);
            }
        }

        // Fallback to default credentials (for production environments like Cloud Functions)
        return initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    }

    return getApps()[0];
}

export function getAdminApp(): App {
    if (!adminApp) {
        adminApp = initializeAdminApp();
    }
    return adminApp;
}

export function getAdminDb(): Firestore {
    if (!adminDb) {
        adminDb = getFirestore(getAdminApp());
    }
    return adminDb;
}

export function getAdminAuth(): Auth {
    if (!adminAuth) {
        adminAuth = getAuth(getAdminApp());
    }
    return adminAuth;
}
