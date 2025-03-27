import { Router } from 'express';
import { db } from '../../config/database';
import { stripeEvents } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get transfer details by ID
router.get('/:id', async (req, res) => {
    try {
        const transferId = req.params.id;

        // Fetch all events for this transfer in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, transferId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Transfer not found' });
        }

        // Initialize transfer state
        let transferState: Stripe.Transfer | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'transfer.created':
                    transferState = event.data as Stripe.Transfer;
                    break;
                case 'transfer.failed':
                case 'transfer.paid':
                case 'transfer.reversed':
                    transferState = {
                        ...transferState!,
                        ...(event.data as Stripe.Transfer)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(transferState);
    } catch (error) {
        console.error('Error retrieving transfer:', error);
        res.status(500).json({ error: 'Failed to retrieve transfer details' });
    }
});

export default router; 