import { Router } from 'express';
import { db } from '../../config/database';
import { stripeEvents } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get file link details by ID
router.get('/:id', async (req, res) => {
    try {
        const fileLinkId = req.params.id;

        // Fetch all events for this file link in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, fileLinkId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'File link not found' });
        }

        // Initialize file link state
        let fileLinkState: Stripe.FileLink | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'file.created':
                    fileLinkState = event.data as Stripe.FileLink;
                    break;
                case 'file.updated':
                    fileLinkState = {
                        ...fileLinkState!,
                        ...(event.data as Stripe.FileLink)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(fileLinkState);
    } catch (error) {
        console.error('Error retrieving file link:', error);
        res.status(500).json({ error: 'Failed to retrieve file link details' });
    }
});

export default router; 