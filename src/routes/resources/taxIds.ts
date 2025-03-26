import { Router } from 'express';
import { db } from '../../config/database';
import { stripeEvents } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get tax ID details by ID
router.get('/:id', async (req, res) => {
    try {
        const taxId = req.params.id;

        // Fetch all events for this tax ID in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, taxId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Tax ID not found' });
        }

        // Initialize tax ID state
        let taxIdState: Stripe.TaxId | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'customer.tax_id.created':
                    taxIdState = event.data as Stripe.TaxId;
                    break;
                case 'customer.tax_id.deleted':
                    taxIdState = {
                        ...taxIdState!,
                        ...(event.data as Stripe.TaxId)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(taxIdState);
    } catch (error) {
        console.error('Error retrieving tax ID:', error);
        res.status(500).json({ error: 'Failed to retrieve tax ID details' });
    }
});

export default router; 