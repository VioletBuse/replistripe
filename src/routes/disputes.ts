import { Router } from 'express';
import { db } from '../config/database';
import { stripeEvents } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get dispute details by ID
router.get('/:id', async (req, res) => {
    try {
        const disputeId = req.params.id;

        // Fetch all events for this dispute in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, disputeId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Dispute not found' });
        }

        // Initialize dispute state
        let disputeState: Stripe.Dispute | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'charge.dispute.created':
                    disputeState = event.data as Stripe.Dispute;
                    break;
                case 'charge.dispute.updated':
                    disputeState = {
                        ...disputeState!,
                        ...(event.data as Stripe.Dispute)
                    };
                    break;
                case 'charge.dispute.closed':
                    disputeState = {
                        ...disputeState!,
                        ...(event.data as Stripe.Dispute)
                    };
                    break;
                case 'charge.dispute.funds_reinstated':
                    disputeState = {
                        ...disputeState!,
                        ...(event.data as Stripe.Dispute)
                    };
                    break;
                case 'charge.dispute.funds_withdrawn':
                    disputeState = {
                        ...disputeState!,
                        ...(event.data as Stripe.Dispute)
                    };
                    break;
                case 'charge.dispute.evidence_submitted':
                    disputeState = {
                        ...disputeState!,
                        ...(event.data as Stripe.Dispute)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(disputeState);
    } catch (error) {
        console.error('Error retrieving dispute:', error);
        res.status(500).json({ error: 'Failed to retrieve dispute details' });
    }
});

export default router; 