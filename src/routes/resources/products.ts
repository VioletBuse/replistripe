import { Router } from 'express';
import { db } from '../../config/database';
import { stripeEvents } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get product details by ID
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        // Fetch all events for this product in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, productId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Initialize product state
        let productState: Stripe.Product | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'product.created':
                    productState = event.data as Stripe.Product;
                    break;
                case 'product.updated':
                    productState = {
                        ...productState!,
                        ...(event.data as Stripe.Product)
                    };
                    break;
                case 'product.deleted':
                    productState = {
                        ...productState!,
                        ...(event.data as Stripe.Product)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(productState);
    } catch (error) {
        console.error('Error retrieving product:', error);
        res.status(500).json({ error: 'Failed to retrieve product details' });
    }
});

export default router; 