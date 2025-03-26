import { stripe } from '../config/stripe';
import { db } from '../config/database';
import { stripeEvents } from '../db/schema';
import Stripe from 'stripe';
import { desc } from 'drizzle-orm';

class BackgroundTaskService {
    private static instance: BackgroundTaskService;
    private isRunning: boolean = false;

    private constructor() { }

    public static getInstance(): BackgroundTaskService {
        if (!BackgroundTaskService.instance) {
            BackgroundTaskService.instance = new BackgroundTaskService();
        }
        return BackgroundTaskService.instance;
    }

    public async startPolling() {
        if (this.isRunning) {
            console.log('Background task is already running');
            return;
        }

        this.isRunning = true;
        console.log('Starting Stripe events polling...');

        while (this.isRunning) {
            try {
                await this.pollStripeEvents();
            } catch (error) {
                console.error('Error polling Stripe events:', error);
                // Wait a bit longer on error before retrying
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    public stopPolling() {
        this.isRunning = false;
        console.log('Stopping Stripe events polling...');
    }

    private async pollStripeEvents() {
        const fiveSecondsAgo = Math.floor(Date.now() / 1000) - 5;
        const params: Stripe.EventListParams = {
            limit: 100,
            created: {
                gte: fiveSecondsAgo
            }
        };

        // Get the last event from the database
        const lastEvent = await db.query.stripeEvents.findFirst({
            orderBy: [desc(stripeEvents.createdAt)]
        });

        if (lastEvent) {
            const lastEventTimestamp = Math.floor(new Date(lastEvent.createdAt).getTime() / 1000);
            if (lastEventTimestamp < fiveSecondsAgo) {
                params.starting_after = lastEvent.eventId;
            }
        }

        const events = await stripe.events.list(params);

        for (const event of events.data) {
            await this.handleEvent(event);
        }

        // Wait for 1 second before next poll
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    private async handleEvent(event: any) {
        console.log(`Processing event: ${event.type}`);

        // Store the event in the database
        await db.insert(stripeEvents)
            .values({
                eventId: event.id,
                type: event.type,
                objectType: event.data.object.object,
                objectId: event.data.object.id,
                data: event.data.object,
                createdAt: new Date(event.created * 1000),
                processedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: stripeEvents.eventId,
                set: {
                    eventId: event.id,
                    type: event.type,
                    objectType: event.data.object.object,
                    objectId: event.data.object.id,
                    data: event.data.object,
                    createdAt: new Date(event.created * 1000),
                    processedAt: new Date(),
                }
            });
    }
}

export const backgroundTaskService = BackgroundTaskService.getInstance(); 