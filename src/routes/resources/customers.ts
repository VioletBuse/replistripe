import { Router } from 'express';
import { db } from '../../config/database';
import { stripeEvents } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get customer details by ID
router.get('/:id', async (req, res) => {
    try {
        const customerId = req.params.id;

        // Fetch all events for this customer in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, customerId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Initialize customer state
        let customerState: Stripe.Customer | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'customer.created':
                    customerState = event.data as Stripe.Customer;
                    break;
                case 'customer.updated':
                    customerState = {
                        ...customerState!,
                        ...(event.data as Stripe.Customer)
                    };
                    break;
                case 'customer.deleted':
                    return res.status(404).json({ error: 'Customer has been deleted' });
                // Add more event types as needed
            }
        }

        res.json(customerState);
    } catch (error) {
        console.error('Error retrieving customer:', error);
        res.status(500).json({ error: 'Failed to retrieve customer details' });
    }
});

export default router; 