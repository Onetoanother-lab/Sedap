import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import User from './models/User.js';
import Product from './models/Product.js';
import Cart from './models/Cart.js';
import OrderList from './models/OrderList.js';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderListRoutes from './routes/orderlistRoutes.js';

const PORT = 8000;
const app = express();

app.use(express.json({ limit: '10mb' }));   
app.use(cors());

app.use('/api', userRoutes(User));
app.use('/api', productRoutes(Product));
app.use('/api', cartRoutes(Cart));
app.use('/api', orderListRoutes(OrderList));

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running → http://localhost:${PORT}`);
    });
};

startServer();