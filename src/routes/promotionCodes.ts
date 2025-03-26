import { Router } from 'express';
import { db } from '../config/database';
import { stripeEvents } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get promotion code details by ID
router.get('/:id', async (req, res) => {
    try {
        const promotionCodeId = req.params.id;

        // Fetch all events for this promotion code in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, promotionCodeId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Promotion code not found' });
        }

        // Initialize promotion code state
        let promotionCodeState: Stripe.PromotionCode | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'promotion_code.created':
                    promotionCodeState = event.data as Stripe.PromotionCode;
                    break;
                case 'promotion_code.updated':
                    promotionCodeState = {
                        ...promotionCodeState!,
                        ...(event.data as Stripe.PromotionCode)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(promotionCodeState);
    } catch (error) {
        console.error('Error retrieving promotion code:', error);
        res.status(500).json({ error: 'Failed to retrieve promotion code details' });
    }
});

export default router; 