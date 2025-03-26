import { Router } from 'express';
import { db } from '../config/database';
import { stripeEvents } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get review details by ID
router.get('/:id', async (req, res) => {
    try {
        const reviewId = req.params.id;

        // Fetch all events for this review in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, reviewId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Initialize review state
        let reviewState: Stripe.Review | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'review.opened':
                    reviewState = event.data as Stripe.Review;
                    break;
                case 'review.closed':
                    reviewState = {
                        ...reviewState!,
                        ...(event.data as Stripe.Review)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(reviewState);
    } catch (error) {
        console.error('Error retrieving review:', error);
        res.status(500).json({ error: 'Failed to retrieve review details' });
    }
});

export default router; 