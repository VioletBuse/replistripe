import { Router } from 'express';
import { db } from '../../config/database';
import { stripeEvents } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get account details by ID
router.get('/:id', async (req, res) => {
    try {
        const accountId = req.params.id;

        // Fetch all events for this account in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, accountId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Initialize account state
        let accountState: Stripe.Account | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'account.created':
                    accountState = event.data as Stripe.Account;
                    break;
                case 'account.updated':
                    accountState = {
                        ...accountState!,
                        ...(event.data as Stripe.Account)
                    };
                    break;
                case 'account.deleted':
                    return res.status(404).json({ error: 'Account has been deleted' });
                // Add more event types as needed
            }
        }

        res.json(accountState);
    } catch (error) {
        console.error('Error retrieving account:', error);
        res.status(500).json({ error: 'Failed to retrieve account details' });
    }
});

export default router; 