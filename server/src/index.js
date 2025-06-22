require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const productRoutes = require('./routes/products');
const priceRoutes = require('./routes/prices');
const supplierRoutes = require('./routes/suppliers');
const orderRoutes = require('./routes/orders');
const invoicesRoutes = require('./routes/invoices');
const repurchaseRoutes = require('./routes/repurchase.routes');
const sellRoutes = require('./routes/sell.routes');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/repurchases', repurchaseRoutes);
app.use('/api/sells', sellRoutes);

// Middleware to authenticate token
// app.use('/api', authMiddleware);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 