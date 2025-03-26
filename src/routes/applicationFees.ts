import { Router } from 'express';
import { db } from '../config/database';
import { stripeEvents } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get application fee details by ID
router.get('/:id', async (req, res) => {
    try {
        const applicationFeeId = req.params.id;

        // Fetch all events for this application fee in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, applicationFeeId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Application fee not found' });
        }

        // Initialize application fee state
        let applicationFeeState: Stripe.ApplicationFee | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'application_fee.created':
                    applicationFeeState = event.data as Stripe.ApplicationFee;
                    break;
                case 'application_fee.refunded':
                    applicationFeeState = {
                        ...applicationFeeState!,
                        ...(event.data as Stripe.ApplicationFee)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(applicationFeeState);
    } catch (error) {
        console.error('Error retrieving application fee:', error);
        res.status(500).json({ error: 'Failed to retrieve application fee details' });
    }
});

export default router; 