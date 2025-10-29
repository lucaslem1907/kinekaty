require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path'); 
const prisma = new PrismaClient();

const authRoutes = require('./routes/auth');
const classesRoutes = require('./routes/classes');
const bookingsRoutes = require('./routes/bookings');
const tokenRoutes = require('./routes/token');
const paymentRoutes = require ('./routes/payment');

const app = express();
const PORT = process.env.PORT;


app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

const { webhook } = require('./controllers/paymentControllor');

app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  webhook
);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/payment', paymentRoutes);


//error handler
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(500).send("Internal Server Error 2.0");
});

// basic health
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Test route
app.get('/', (req, res) => res.send('Backend is running!'));