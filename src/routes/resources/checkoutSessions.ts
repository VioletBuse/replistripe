import { Router } from 'express';
import { db } from '../../config/database';
import { stripeEvents } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get checkout session details by ID
router.get('/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;

        // Fetch all events for this checkout session in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, sessionId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Checkout session not found' });
        }

        // Initialize session state
        let sessionState: Stripe.Checkout.Session | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'checkout.session.created':
                    sessionState = event.data as Stripe.Checkout.Session;
                    break;
                case 'checkout.session.async_payment_succeeded':
                case 'checkout.session.async_payment_failed':
                case 'checkout.session.completed':
                case 'checkout.session.expired':
                    sessionState = {
                        ...sessionState!,
                        ...(event.data as Stripe.Checkout.Session)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(sessionState);
    } catch (error) {
        console.error('Error retrieving checkout session:', error);
        res.status(500).json({ error: 'Failed to retrieve checkout session details' });
    }
});

export default router; 