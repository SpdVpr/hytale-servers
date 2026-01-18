// ===================================
// Community Reviews System
// Allow players to review and rate servers
// ===================================

import {
    collection, addDoc, query, where, limit,
    getDocs, Timestamp, doc, updateDoc, increment, deleteDoc,
    getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const REVIEWS_COLLECTION = 'reviews';

export interface Review {
    id: string;
    serverId: string;
    userId: string;
    username: string;
    userAvatar?: string;
    rating: number; // 1-5 stars
    title: string;
    content: string;
    pros: string[];
    cons: string[];
    playtime?: string; // e.g., "50+ hours"
    verified: boolean; // Verified player
    helpful: number;
    notHelpful: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>; // 1-5 star counts
}

/**
 * Submit a new review
 */
export async function submitReview(
    serverId: string,
    userId: string,
    username: string,
    data: {
        rating: number;
        title: string;
        content: string;
        pros?: string[];
        cons?: string[];
        playtime?: string;
    }
): Promise<string> {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    const reviewData = {
        serverId,
        userId,
        username,
        rating: data.rating,
        title: data.title,
        content: data.content,
        pros: data.pros || [],
        cons: data.cons || [],
        playtime: data.playtime || null,
        verified: false,
        helpful: 0,
        notHelpful: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewData);

    // Update server's average rating
    await updateServerRating(serverId);

    return docRef.id;
}

/**
 * Get reviews for a server
 */
export async function getServerReviews(
    serverId: string,
    limitCount: number = 10,
    sortBy: 'recent' | 'helpful' | 'rating' = 'recent'
): Promise<Review[]> {
    try {
        // Simple query without orderBy to avoid needing composite index
        const q = query(
            collection(db, REVIEWS_COLLECTION),
            where('serverId', '==', serverId),
            limit(50) // Get more and sort client-side
        );

        const snapshot = await getDocs(q);

        let reviews = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate() || new Date(),
            updatedAt: d.data().updatedAt?.toDate() || new Date(),
        })) as Review[];

        // Sort client-side
        switch (sortBy) {
            case 'helpful':
                reviews.sort((a, b) => b.helpful - a.helpful);
                break;
            case 'rating':
                reviews.sort((a, b) => b.rating - a.rating);
                break;
            default: // recent
                reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        // Apply limit
        return reviews.slice(0, limitCount);
    } catch (error) {
        console.error('Error getting reviews:', error);
        return [];
    }
}

/**
 * Get review statistics for a server
 */
export async function getReviewStats(serverId: string): Promise<ReviewStats> {
    try {
        const q = query(
            collection(db, REVIEWS_COLLECTION),
            where('serverId', '==', serverId)
        );

        const snapshot = await getDocs(q);

        const reviews = snapshot.docs.map(d => d.data());
        const totalReviews = reviews.length;

        if (totalReviews === 0) {
            return {
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
        }

        const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        const averageRating = Math.round((sum / totalReviews) * 10) / 10;

        const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
                ratingDistribution[r.rating]++;
            }
        });

        return {
            totalReviews,
            averageRating,
            ratingDistribution,
        };
    } catch (error) {
        console.error('Error getting review stats:', error);
        return {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
    }
}

/**
 * Mark a review as helpful or not helpful
 */
export async function markReviewHelpful(
    reviewId: string,
    helpful: boolean
): Promise<void> {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);

    await updateDoc(reviewRef, {
        [helpful ? 'helpful' : 'notHelpful']: increment(1),
    });
}

/**
 * Update server's average rating after a new review
 */
async function updateServerRating(serverId: string): Promise<void> {
    const stats = await getReviewStats(serverId);

    // Update the server document with new rating
    const serverRef = doc(db, 'servers', serverId);
    await updateDoc(serverRef, {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
    });
}

/**
 * Delete a review (admin or owner only)
 */
export async function deleteReview(reviewId: string): Promise<void> {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const reviewDoc = await getDoc(reviewRef);

    if (reviewDoc.exists()) {
        const serverId = reviewDoc.data().serverId;
        await deleteDoc(reviewRef);
        await updateServerRating(serverId);
    }
}
