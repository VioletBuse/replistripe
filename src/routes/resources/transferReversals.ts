import { Router } from 'express';
import { db } from '../../config/database';
import { stripeEvents } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get transfer reversal details by ID
router.get('/:id', async (req, res) => {
    try {
        const transferReversalId = req.params.id;

        // Fetch all events for this transfer reversal in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, transferReversalId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Transfer reversal not found' });
        }

        // Initialize transfer reversal state
        let transferReversalState: Stripe.TransferReversal | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'transfer_reversal.created':
                    transferReversalState = event.data as Stripe.TransferReversal;
                    break;
                case 'transfer_reversal.updated':
                    transferReversalState = {
                        ...transferReversalState!,
                        ...(event.data as Stripe.TransferReversal)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(transferReversalState);
    } catch (error) {
        console.error('Error retrieving transfer reversal:', error);
        res.status(500).json({ error: 'Failed to retrieve transfer reversal details' });
    }
});

export default router; 