// ✅ server.js (Final Updated)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// ✅ Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use('/images', express.static('public/images'));

// ✅ Final Correct CORS Setup
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'null'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));

// ✅ Handle Preflight OPTIONS requests globally
app.options('*', cors());

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/designs', require('./routes/designs'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/track-order', require('./routes/trackOrder'));
app.use('/api/manage-order', require('./routes/manageOrders'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/leftover', require('./routes/leftover'));
app.use('/api/design-images', require('./routes/designImages'));
app.use('/api/reports', require('./routes/reports'));


// ✅ Root route
app.get('/', (req, res) => {
  res.send('🚀 Welcome to FashhTrack API');
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
