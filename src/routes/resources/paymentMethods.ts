import { Router } from 'express';
import { db } from '../../config/database';
import { stripeEvents } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get payment method details by ID
router.get('/:id', async (req, res) => {
    try {
        const paymentMethodId = req.params.id;

        // Fetch all events for this payment method in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, paymentMethodId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Payment method not found' });
        }

        // Initialize payment method state
        let paymentMethodState: Stripe.PaymentMethod | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'payment_method.attached':
                    paymentMethodState = event.data as Stripe.PaymentMethod;
                    break;
                case 'payment_method.detached':
                    paymentMethodState = {
                        ...paymentMethodState!,
                        ...(event.data as Stripe.PaymentMethod)
                    };
                    break;
                case 'payment_method.updated':
                    paymentMethodState = {
                        ...paymentMethodState!,
                        ...(event.data as Stripe.PaymentMethod)
                    };
                    break;
                case 'payment_method.card_automatically_updated':
                    paymentMethodState = {
                        ...paymentMethodState!,
                        ...(event.data as Stripe.PaymentMethod)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(paymentMethodState);
    } catch (error) {
        console.error('Error retrieving payment method:', error);
        res.status(500).json({ error: 'Failed to retrieve payment method details' });
    }
});

export default router; 