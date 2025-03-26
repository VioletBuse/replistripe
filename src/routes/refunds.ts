import { Router } from 'express';
import { db } from '../config/database';
import { stripeEvents } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get refund details by ID
router.get('/:id', async (req, res) => {
    try {
        const refundId = req.params.id;

        // Fetch all events for this refund in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, refundId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Refund not found' });
        }

        // Initialize refund state
        let refundState: Stripe.Refund | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'charge.refunded':
                    refundState = event.data as Stripe.Refund;
                    break;
                case 'refund.created':
                    refundState = event.data as Stripe.Refund;
                    break;
                case 'refund.updated':
                    refundState = {
                        ...refundState!,
                        ...(event.data as Stripe.Refund)
                    };
                    break;
                case 'refund.failed':
                    refundState = {
                        ...refundState!,
                        ...(event.data as Stripe.Refund)
                    };
                    break;
                case 'refund.succeeded':
                    refundState = {
                        ...refundState!,
                        ...(event.data as Stripe.Refund)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(refundState);
    } catch (error) {
        console.error('Error retrieving refund:', error);
        res.status(500).json({ error: 'Failed to retrieve refund details' });
    }
});

export default router; 