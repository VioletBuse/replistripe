import { Router } from 'express';
import { db } from '../../config/database';
import { stripeEvents } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get tax rate details by ID
router.get('/:id', async (req, res) => {
    try {
        const taxRateId = req.params.id;

        // Fetch all events for this tax rate in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, taxRateId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Tax rate not found' });
        }

        // Initialize tax rate state
        let taxRateState: Stripe.TaxRate | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'tax_rate.created':
                    taxRateState = event.data as Stripe.TaxRate;
                    break;
                case 'tax_rate.updated':
                    taxRateState = {
                        ...taxRateState!,
                        ...(event.data as Stripe.TaxRate)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(taxRateState);
    } catch (error) {
        console.error('Error retrieving tax rate:', error);
        res.status(500).json({ error: 'Failed to retrieve tax rate details' });
    }
});

export default router; 