import { Router } from 'express';
import { db } from '../../config/database';
import { stripeEvents } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get subscription details by ID
router.get('/:id', async (req, res) => {
    try {
        const subscriptionId = req.params.id;

        // Fetch all events for this subscription in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, subscriptionId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        // Initialize subscription state
        let subscriptionState: Stripe.Subscription | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'customer.subscription.created':
                    subscriptionState = event.data as Stripe.Subscription;
                    break;
                case 'customer.subscription.updated':
                    subscriptionState = {
                        ...subscriptionState!,
                        ...(event.data as Stripe.Subscription)
                    };
                    break;
                case 'customer.subscription.deleted':
                    subscriptionState = {
                        ...subscriptionState!,
                        ...(event.data as Stripe.Subscription)
                    };
                    break;
                case 'customer.subscription.trial_will_end':
                    subscriptionState = {
                        ...subscriptionState!,
                        ...(event.data as Stripe.Subscription)
                    };
                    break;
                case 'customer.subscription.pending_update_applied':
                    subscriptionState = {
                        ...subscriptionState!,
                        ...(event.data as Stripe.Subscription)
                    };
                    break;
                case 'customer.subscription.pending_update_expired':
                    subscriptionState = {
                        ...subscriptionState!,
                        ...(event.data as Stripe.Subscription)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(subscriptionState);
    } catch (error) {
        console.error('Error retrieving subscription:', error);
        res.status(500).json({ error: 'Failed to retrieve subscription details' });
    }
});

export default router; 