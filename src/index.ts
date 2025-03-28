import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { backgroundTaskService } from './services/backgroundTask';
import customerRoutes from './routes/resources/customers';
import chargeRoutes from './routes/resources/charges';
import paymentIntentRoutes from './routes/resources/paymentIntents';
import setupIntentRoutes from './routes/resources/setupIntents';
import subscriptionRoutes from './routes/resources/subscriptions';
import invoiceRoutes from './routes/resources/invoices';
import paymentMethodRoutes from './routes/resources/paymentMethods';
import refundRoutes from './routes/resources/refunds';
import disputeRoutes from './routes/resources/disputes';
import balanceTransactionRoutes from './routes/resources/balanceTransactions';
import payoutRoutes from './routes/resources/payouts';
import webhookEndpointRoutes from './routes/resources/webhookEndpoints';
import productRoutes from './routes/resources/products';
import priceRoutes from './routes/resources/prices';
import couponRoutes from './routes/resources/coupons';
import promotionCodeRoutes from './routes/resources/promotionCodes';
import taxRateRoutes from './routes/resources/taxRates';
import taxIdRoutes from './routes/resources/taxIds';
import fileLinkRoutes from './routes/resources/fileLinks';
import reviewRoutes from './routes/resources/reviews';
import transferReversalRoutes from './routes/resources/transferReversals';
import applicationFeeRoutes from './routes/resources/applicationFees';
import webhookRoutes from './routes/webhooks';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the TypeScript Express API!' });
});

// Customer routes
app.use('/customers', customerRoutes);

// Charge routes
app.use('/charges', chargeRoutes);

// Payment Intent routes
app.use('/payment-intents', paymentIntentRoutes);

// Setup Intent routes
app.use('/setup-intents', setupIntentRoutes);

// Subscription routes
app.use('/subscriptions', subscriptionRoutes);

// Invoice routes
app.use('/invoices', invoiceRoutes);

// Payment Method routes
app.use('/payment-methods', paymentMethodRoutes);

// Refund routes
app.use('/refunds', refundRoutes);

// Dispute routes
app.use('/disputes', disputeRoutes);

// Balance Transaction routes
app.use('/balance-transactions', balanceTransactionRoutes);

// Payout routes
app.use('/payouts', payoutRoutes);

// Webhook Endpoint routes
app.use('/webhook-endpoints', webhookEndpointRoutes);

// Product routes
app.use('/products', productRoutes);

// Price routes
app.use('/prices', priceRoutes);

// Coupon routes
app.use('/coupons', couponRoutes);

// Promotion Code routes
app.use('/promotion-codes', promotionCodeRoutes);

// Tax Rate routes
app.use('/tax-rates', taxRateRoutes);

// Tax ID routes
app.use('/tax-ids', taxIdRoutes);

// File Link routes
app.use('/file-links', fileLinkRoutes);

// Review routes
app.use('/reviews', reviewRoutes);

// Transfer Reversal routes
app.use('/transfer-reversals', transferReversalRoutes);

// Application Fee routes
app.use('/application-fees', applicationFeeRoutes);

// Webhook route - must be raw body for signature verification
app.use('/webhooks', webhookRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server and background task
app.listen(port, async () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    await backgroundTaskService.startPolling();
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    backgroundTaskService.stopPolling();
    process.exit(0);
}); 