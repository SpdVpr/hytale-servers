// ===================================
// Reviews API Endpoint
// GET /api/reviews?serverId=xxx - Get reviews for a server
// POST /api/reviews - Submit a new review
// ===================================

import { NextResponse } from 'next/server';
import {
    getServerReviews,
    submitReview,
    getReviewStats,
    markReviewHelpful,
    deleteReview
} from '@/lib/reviews';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get('serverId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = (searchParams.get('sortBy') || 'recent') as 'recent' | 'helpful' | 'rating';

    if (!serverId) {
        return NextResponse.json(
            { success: false, error: 'Server ID is required' },
            { status: 400 }
        );
    }

    try {
        const [reviews, stats] = await Promise.all([
            getServerReviews(serverId, limit, sortBy),
            getReviewStats(serverId),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                reviews,
                stats,
            },
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { serverId, userId, username, rating, title, content, pros, cons, playtime } = body;

        // Validate required fields
        if (!serverId || !userId || !username || !rating || !title || !content) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        const reviewId = await submitReview(serverId, userId, username, {
            rating,
            title,
            content,
            pros: pros || [],
            cons: cons || [],
            playtime,
        });

        return NextResponse.json({
            success: true,
            review: {
                id: reviewId,
                serverId,
                userId,
                username,
                rating,
                title,
                content,
                pros: pros || [],
                cons: cons || [],
                playtime,
            },
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit review' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { reviewId, helpful } = body;

        if (!reviewId || typeof helpful !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'Review ID and helpful flag are required' },
                { status: 400 }
            );
        }

        await markReviewHelpful(reviewId, helpful);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update review' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { reviewId } = body;

        if (!reviewId) {
            return NextResponse.json(
                { success: false, error: 'Review ID is required' },
                { status: 400 }
            );
        }

        await deleteReview(reviewId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete review' },
            { status: 500 }
        );
    }
}
