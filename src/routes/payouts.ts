import { Router } from 'express';
import { db } from '../config/database';
import { stripeEvents } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get payout details by ID
router.get('/:id', async (req, res) => {
    try {
        const payoutId = req.params.id;

        // Fetch all events for this payout in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, payoutId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Payout not found' });
        }

        // Initialize payout state
        let payoutState: Stripe.Payout | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'payout.created':
                    payoutState = event.data as Stripe.Payout;
                    break;
                case 'payout.updated':
                    payoutState = {
                        ...payoutState!,
                        ...(event.data as Stripe.Payout)
                    };
                    break;
                case 'payout.paid':
                    payoutState = {
                        ...payoutState!,
                        ...(event.data as Stripe.Payout)
                    };
                    break;
                case 'payout.failed':
                    payoutState = {
                        ...payoutState!,
                        ...(event.data as Stripe.Payout)
                    };
                    break;
                case 'payout.canceled':
                    payoutState = {
                        ...payoutState!,
                        ...(event.data as Stripe.Payout)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(payoutState);
    } catch (error) {
        console.error('Error retrieving payout:', error);
        res.status(500).json({ error: 'Failed to retrieve payout details' });
    }
});

export default router; 