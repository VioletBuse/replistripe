import express from 'express';
import { db } from '../config/database';
import { stripeEvents } from '../db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { stripe } from "../config/stripe";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Verify Stripe webhook signature
const verifyStripeSignature = (req: express.Request) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
        throw new Error('No Stripe signature found');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    try {
        return stripe.webhooks.constructEvent(
            req.body,
            signature,
            webhookSecret
        );
    } catch (err: any) {
        throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
};

// Handle Stripe webhook events
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const event = verifyStripeSignature(req);

        // Save the event to the database
        await db.insert(stripeEvents).values({
            eventId: event.id,
            type: event.type,
            objectId: (event.data.object as { id: string; object: string }).id,
            objectType: (event.data.object as { id: string; object: string }).object,
            data: event.data.object,
            createdAt: new Date(event.created * 1000),
        });

        res.json({ received: true });
    } catch (err: any) {
        console.error('Webhook error:', err);
        res.status(400).json({ error: err.message });
    }
});

export default router; 