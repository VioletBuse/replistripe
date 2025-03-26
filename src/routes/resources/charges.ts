import { Router } from 'express';
import { db } from '../../config/database';
import { stripeEvents } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get charge details by ID
router.get('/:id', async (req, res) => {
    try {
        const chargeId = req.params.id;

        // Fetch all events for this charge in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, chargeId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Charge not found' });
        }

        // Initialize charge state
        let chargeState: Stripe.Charge | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'charge.created':
                    chargeState = event.data as Stripe.Charge;
                    break;
                case 'charge.updated':
                    chargeState = {
                        ...chargeState!,
                        ...(event.data as Stripe.Charge)
                    };
                    break;
                case 'charge.refunded':
                    chargeState = {
                        ...chargeState!,
                        ...(event.data as Stripe.Charge)
                    };
                    break;
                case 'charge.failed':
                    chargeState = {
                        ...chargeState!,
                        ...(event.data as Stripe.Charge)
                    };
                    break;
                case 'charge.succeeded':
                    chargeState = {
                        ...chargeState!,
                        ...(event.data as Stripe.Charge)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(chargeState);
    } catch (error) {
        console.error('Error retrieving charge:', error);
        res.status(500).json({ error: 'Failed to retrieve charge details' });
    }
});

export default router; 