import { Router } from 'express';
import { db } from '../config/database';
import { stripeEvents } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get balance transaction details by ID
router.get('/:id', async (req, res) => {
    try {
        const balanceTransactionId = req.params.id;

        // Fetch all events for this balance transaction in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, balanceTransactionId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Balance transaction not found' });
        }

        // Initialize balance transaction state
        let balanceTransactionState: Stripe.BalanceTransaction | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'balance.available':
                    balanceTransactionState = event.data as Stripe.BalanceTransaction;
                    break;
                case 'balance.updated':
                    balanceTransactionState = {
                        ...balanceTransactionState!,
                        ...(event.data as Stripe.BalanceTransaction)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(balanceTransactionState);
    } catch (error) {
        console.error('Error retrieving balance transaction:', error);
        res.status(500).json({ error: 'Failed to retrieve balance transaction details' });
    }
});

export default router; 