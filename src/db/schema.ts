import { pgTable, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

export const stripeEvents = pgTable('stripe_events', {
    eventId: text('event_id').notNull().primaryKey(),
    type: text('type').notNull(),
    objectType: text('object_type').notNull(),
    objectId: text('object_id').notNull(),
    data: jsonb('data').notNull(),
    // created at cannot have a default because we are using stripe's created at
    createdAt: timestamp('created_at').notNull(),
    processedAt: timestamp('processed_at'),
});
