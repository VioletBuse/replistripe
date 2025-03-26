import { Router } from 'express';
import { db } from '../config/database';
import { stripeEvents } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get webhook endpoint details by ID
router.get('/:id', async (req, res) => {
    try {
        const webhookEndpointId = req.params.id;

        // Fetch all events for this webhook endpoint in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, webhookEndpointId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Webhook endpoint not found' });
        }

        // Initialize webhook endpoint state
        let webhookEndpointState: Stripe.WebhookEndpoint | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'webhook_endpoint.created':
                    webhookEndpointState = event.data as Stripe.WebhookEndpoint;
                    break;
                case 'webhook_endpoint.updated':
                    webhookEndpointState = {
                        ...webhookEndpointState!,
                        ...(event.data as Stripe.WebhookEndpoint)
                    };
                    break;
                case 'webhook_endpoint.deleted':
                    webhookEndpointState = {
                        ...webhookEndpointState!,
                        ...(event.data as Stripe.WebhookEndpoint)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(webhookEndpointState);
    } catch (error) {
        console.error('Error retrieving webhook endpoint:', error);
        res.status(500).json({ error: 'Failed to retrieve webhook endpoint details' });
    }
});

export default router; 