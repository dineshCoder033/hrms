const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const env = require('./config/env');

const { connectDB } = require('./config/db');
const routes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./errors/errorHandler');
const ApiError = require('./errors/ApiError');

const app = express();
const PORT = env.PORT;
const CLIENT_URL = env.CLIENT_URL;

// Trust reverse proxy (Render, Railway, Nginx, Cloudflare) so rate-limit & req.ip work accurately
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Restricted CORS supporting comma-separated CLIENT_URLs
const configuredOrigins = CLIENT_URL.split(',')
  .map((u) => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

const devOrigins = env.NODE_ENV !== 'production'
  ? ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000']
  : [];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...devOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }
    // Allow any localhost/127.0.0.1 port in non-production environments
    if (env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
      return callback(null, true);
    }
    return callback(new ApiError(403, `CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Mount Webhook Routes BEFORE express.json() for raw body HMAC signature verification
const webhookRoutes = require('./routes/webhookRoutes');
app.use('/api/webhooks', webhookRoutes);

// Body parsing & Rate Limiting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

// Health check for hosting platforms (Render / Railway / Docker)
app.get('/api/health', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? 'online' : 'degraded',
    db: dbReady ? 'connected' : 'disconnected',
    system: 'TaskOrbit / Helix HRMS Core API',
    environment: env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Mount All API Routes
app.use('/api', routes);

// Optional Single-Server Hosting: serve built React client if present
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (env.NODE_ENV === 'production' && fs.existsSync(path.join(clientDistPath, 'index.html'))) {
  app.use(express.static(clientDistPath, { maxAge: '7d' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Handler for unmatched API routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handler Middleware
app.use(errorHandler);

// Start Server & Connect Database (skipped in Jest test mode)
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`server running 🚀`);

    // Automatic Keep-Alive ping worker (prevents Render free tier from sleeping after 15m)
    const rawExternalUrl = process.env.RENDER_EXTERNAL_URL || 'https://hrmsserver-stes.onrender.com';
    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      const PING_INTERVAL = 13 * 60 * 1000; // Ping every 13 minutes
      setInterval(async () => {
        try {
          const pingUrl = `${rawExternalUrl.replace(/\/$/, '')}/api/health`;
          const res = await fetch(pingUrl);
          if (res.ok) {
            console.log(`[KeepAlive] Self-ping successful at ${new Date().toISOString()}`);
          }
        } catch (err) {
          console.warn(`[KeepAlive] Ping failed:`, err.message);
        }
      }, PING_INTERVAL);
      console.log(`[KeepAlive] Worker active: pinging ${rawExternalUrl}/api/health every 13 mins`);
    }
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n[TaskOrbit HRMS] ${signal} received. Gracefully shutting down...`);
    server.close(async () => {
      try {
        await mongoose.connection.close();
        console.log('[TaskOrbit HRMS] HTTP server & MongoDB connection closed.');
      } catch (err) {
        console.error('[TaskOrbit HRMS] Error closing MongoDB:', err.message);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    console.error('[TaskOrbit HRMS] Unhandled Promise Rejection:', reason);
  });
};

if (env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
