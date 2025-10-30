require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authRoutes = require('./routes/auth');
const classesRoutes = require('./routes/classes');
const bookingsRoutes = require('./routes/bookings');
const tokenRoutes = require('./routes/token');
const paymentRoutes = require ('./routes/payment');

const app = express();
const PORT = process.env.PORT || 8080

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

const { webhook } = require('./controllers/paymentControllor');

// Webhook must be BEFORE express.json()
// Webhook must be BEFORE express.json()
app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  webhook
);

app.use(express.json());

// Routes
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/payment', paymentRoutes);


//error handler
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err);
 res.status(502).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// basic health
app.get('/api/health', (req, res) => res.json({ 
  ok: true,
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV 
}));
app.get('/api/health', (req, res) => res.json({ 
  ok: true,
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV 
}));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    console.error(err);
  }
});

// Test route
app.get('/', (req, res) => res.send('Backend is running!'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});
