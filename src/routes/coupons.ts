import { Router } from 'express';
import { db } from '../config/database';
import { stripeEvents } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get coupon details by ID
router.get('/:id', async (req, res) => {
    try {
        const couponId = req.params.id;

        // Fetch all events for this coupon in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, couponId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        // Initialize coupon state
        let couponState: Stripe.Coupon | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'coupon.created':
                    couponState = event.data as Stripe.Coupon;
                    break;
                case 'coupon.updated':
                    couponState = {
                        ...couponState!,
                        ...(event.data as Stripe.Coupon)
                    };
                    break;
                case 'coupon.deleted':
                    couponState = {
                        ...couponState!,
                        ...(event.data as Stripe.Coupon)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(couponState);
    } catch (error) {
        console.error('Error retrieving coupon:', error);
        res.status(500).json({ error: 'Failed to retrieve coupon details' });
    }
});

export default router; 