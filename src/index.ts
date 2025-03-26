import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { backgroundTaskService } from './services/backgroundTask';
import customerRoutes from './routes/customers';
import chargeRoutes from './routes/charges';
import paymentIntentRoutes from './routes/paymentIntents';
import setupIntentRoutes from './routes/setupIntents';

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