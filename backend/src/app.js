const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const corsOptions = require('./config/cors');
const requestIdMiddleware = require('./middleware/requestId');
const { apiRateLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const campaignRoutes = require('./modules/campaigns/campaign.routes');
const eventRoutes = require('./modules/events/event.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const userRoutes = require('./modules/users/user.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(requestIdMiddleware);

// Health check endpoint (public, unauthenticated)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'deeptrace-security-platform'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', apiRateLimiter, campaignRoutes);
app.use('/api/security-events', apiRateLimiter, eventRoutes);
app.use('/api/audit-logs', apiRateLimiter, auditRoutes);
app.use('/api/users', apiRateLimiter, userRoutes);
app.use('/api/dashboard', apiRateLimiter, dashboardRoutes);

// 404 Handler for undefined routes
app.use('*', (req, res, next) => {
  next(AppError.notFound(`Endpoint not found: ${req.method} ${req.originalUrl}`));
});

// Global Centralized Error Handler
app.use(errorHandler);

module.exports = app;
