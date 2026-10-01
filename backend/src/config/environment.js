require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/deeptrace',
  JWT_SECRET: process.env.JWT_SECRET || 'deeptrace-super-secret-jwt-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  REFRESH_TOKEN_DAYS: 7,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

module.exports = env;
