import { Router } from 'express';
import { db } from '../config/database';
import { stripeEvents } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();

// Get invoice details by ID
router.get('/:id', async (req, res) => {
    try {
        const invoiceId = req.params.id;

        // Fetch all events for this invoice in chronological order
        const events = await db.query.stripeEvents.findMany({
            where: eq(stripeEvents.objectId, invoiceId),
            orderBy: [asc(stripeEvents.createdAt)]
        });

        if (events.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Initialize invoice state
        let invoiceState: Stripe.Invoice | null = null;

        // Apply events in order
        for (const event of events) {
            switch (event.type) {
                case 'invoice.created':
                    invoiceState = event.data as Stripe.Invoice;
                    break;
                case 'invoice.updated':
                    invoiceState = {
                        ...invoiceState!,
                        ...(event.data as Stripe.Invoice)
                    };
                    break;
                case 'invoice.paid':
                    invoiceState = {
                        ...invoiceState!,
                        ...(event.data as Stripe.Invoice)
                    };
                    break;
                case 'invoice.payment_failed':
                    invoiceState = {
                        ...invoiceState!,
                        ...(event.data as Stripe.Invoice)
                    };
                    break;
                case 'invoice.payment_action_required':
                    invoiceState = {
                        ...invoiceState!,
                        ...(event.data as Stripe.Invoice)
                    };
                    break;
                case 'invoice.upcoming':
                    invoiceState = {
                        ...invoiceState!,
                        ...(event.data as Stripe.Invoice)
                    };
                    break;
                case 'invoice.finalized':
                    invoiceState = {
                        ...invoiceState!,
                        ...(event.data as Stripe.Invoice)
                    };
                    break;
                case 'invoice.voided':
                    invoiceState = {
                        ...invoiceState!,
                        ...(event.data as Stripe.Invoice)
                    };
                    break;
                // Add more event types as needed
            }
        }

        res.json(invoiceState);
    } catch (error) {
        console.error('Error retrieving invoice:', error);
        res.status(500).json({ error: 'Failed to retrieve invoice details' });
    }
});

export default router; 