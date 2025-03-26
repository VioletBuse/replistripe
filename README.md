# Stripe Event Replay API

A TypeScript Express API that replays Stripe events and maintains state for various Stripe objects. This application provides a way to track and query the state of Stripe objects based on their event history.

## Features

- Event-based state management for Stripe objects
- RESTful API endpoints for various Stripe resources
- Background task service for polling Stripe events
- TypeScript support with type safety
- PostgreSQL database with Drizzle ORM
- Express.js with middleware support

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Stripe API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
PORT=3000
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd replistripe
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:generate
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Core Resources

- `GET /customers/:id` - Get customer details
- `GET /charges/:id` - Get charge details
- `GET /payment-intents/:id` - Get payment intent details
- `GET /setup-intents/:id` - Get setup intent details
- `GET /subscriptions/:id` - Get subscription details
- `GET /invoices/:id` - Get invoice details
- `GET /payment-methods/:id` - Get payment method details
- `GET /refunds/:id` - Get refund details
- `GET /disputes/:id` - Get dispute details
- `GET /balance-transactions/:id` - Get balance transaction details
- `GET /payouts/:id` - Get payout details
- `GET /webhook-endpoints/:id` - Get webhook endpoint details

### Product Catalog

- `GET /products/:id` - Get product details
- `GET /prices/:id` - Get price details
- `GET /coupons/:id` - Get coupon details
- `GET /promotion-codes/:id` - Get promotion code details

### Tax Management

- `GET /tax-rates/:id` - Get tax rate details
- `GET /tax-ids/:id` - Get tax ID details

### File Management

- `GET /file-links/:id` - Get file link details

### Fraud Prevention

- `GET /reviews/:id` - Get review details

### Transfer Management

- `GET /transfer-reversals/:id` - Get transfer reversal details

### Platform Fees

- `GET /application-fees/:id` - Get application fee details

## Event Types

The application handles various Stripe event types for each resource:

### Customers
- `customer.created`
- `customer.updated`
- `customer.deleted`

### Charges
- `charge.succeeded`
- `charge.failed`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.updated`
- `charge.dispute.closed`
- `charge.dispute.funds_reinstated`
- `charge.dispute.funds_withdrawn`

### Payment Intents
- `payment_intent.succeeded`
- `payment_intent.processing`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `payment_intent.created`
- `payment_intent.requires_action`
- `payment_intent.requires_capture`
- `payment_intent.requires_confirmation`
- `payment_intent.requires_payment_method`

### Setup Intents
- `setup_intent.succeeded`
- `setup_intent.processing`
- `setup_intent.requires_payment_method`
- `setup_intent.requires_confirmation`
- `setup_intent.requires_action`
- `setup_intent.canceled`

### Subscriptions
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `customer.subscription.pending_update_applied`
- `customer.subscription.pending_update_expired`

### Invoices
- `invoice.created`
- `invoice.finalized`
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.payment_action_required`
- `invoice.upcoming`
- `invoice.marked_uncollectible`
- `invoice.voided`

### Payment Methods
- `payment_method.attached`
- `payment_method.detached`
- `payment_method.updated`

### Refunds
- `charge.refunded`
- `refund.updated`

### Disputes
- `charge.dispute.created`
- `charge.dispute.updated`
- `charge.dispute.closed`
- `charge.dispute.funds_reinstated`
- `charge.dispute.funds_withdrawn`

### Balance Transactions
- `balance.available`

### Payouts
- `payout.paid`
- `payout.failed`
- `payout.canceled`

### Webhook Endpoints
- `webhook_endpoint.created`
- `webhook_endpoint.updated`
- `webhook_endpoint.deleted`

### Products
- `product.created`
- `product.updated`
- `product.deleted`

### Prices
- `price.created`
- `price.updated`
- `price.deleted`

### Coupons
- `coupon.created`
- `coupon.updated`
- `coupon.deleted`

### Promotion Codes
- `promotion_code.created`
- `promotion_code.updated`

### Tax Rates
- `tax_rate.created`
- `tax_rate.updated`

### Tax IDs
- `customer.tax_id.created`
- `customer.tax_id.deleted`

### File Links
- `file.created`
- `file.updated`

### Reviews
- `review.opened`
- `review.closed`

### Transfer Reversals
- `transfer_reversal.created`
- `transfer_reversal.updated`

### Application Fees
- `application_fee.created`
- `application_fee.refunded`

## Development

### Project Structure

```
src/
├── config/         # Configuration files
├── db/            # Database schema and migrations
├── routes/        # API route handlers
├── services/      # Business logic and services
└── index.ts       # Application entry point
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application
- `npm start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.