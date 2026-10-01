const express = require('express');
const authController = require('./auth.controller');
const { loginSchema } = require('./auth.validation');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authenticate');
const { authRateLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.post('/login', authRateLimiter, validate(loginSchema, 'body'), authController.login);
router.post('/refresh', authRateLimiter, authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
