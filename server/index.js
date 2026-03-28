import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import User from './models/User.js';
import Product from './models/Product.js';
import Cart from './models/Cart.js';
import OrderList from './models/OrderList.js';
import Customer from './models/Customer.js';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderListRoutes from './routes/orderListRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

const PORT = 8000;
const app = express();

app.use(express.json({ limit: '10mb' }));

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
];

app.use(cors({
    origin: (origin, cb) => {
        // allow requests with no origin (mobile apps, curl, same-origin)
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

app.use('/api', userRoutes(User));
app.use('/api', productRoutes(Product));
app.use('/api', cartRoutes(Cart));
app.use('/api', orderListRoutes(OrderList));
app.use('/api', customerRoutes(Customer));

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running → http://localhost:${PORT}`);
    });
};

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
