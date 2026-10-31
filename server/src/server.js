const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { autoSeedMongoIfConnected } = require('./services/dataService');
const routes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./errors/errorHandler');
const ApiError = require('./errors/ApiError');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security Headers
app.use(helmet());

// Restricted CORS
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new ApiError(403, `CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing & Rate Limiting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

// Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'TaskOrbit / Helix HRMS Core API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Mount All API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handler Middleware
app.use(errorHandler);

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  await autoSeedMongoIfConnected();

  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 TaskOrbit HRMS Server running on port ${PORT}`);
    console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
    console.log(`🔒 Allowed Client Origin: ${CLIENT_URL}`);
    console.log(`===============================================`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[TaskOrbit HRMS] Gracefully shutting down...');
    server.close(() => {
      console.log('[TaskOrbit HRMS] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();

module.exports = app;
