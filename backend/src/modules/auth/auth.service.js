const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../../config/database');
const env = require('../../config/environment');
const AppError = require('../../utils/AppError');
const { auditLog } = require('../../utils/auditLogger');

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

class AuthService {
  async login(email, password, req) {
    const user = await db('users')
      .join('tenants', 'users.tenant_id', 'tenants.id')
      .select(
        'users.id',
        'users.tenant_id',
        'users.email',
        'users.password_hash',
        'users.name',
        'users.role',
        'users.is_active',
        'tenants.name as tenant_name',
        'tenants.slug as tenant_slug'
      )
      .whereRaw('LOWER(users.email) = ?', [email.toLowerCase()])
      .first();

    if (!user || !user.is_active) {
      // Record failed login audit log if we can find tenant
      if (user) {
        await auditLog(req, {
          action: 'LOGIN_FAILED',
          entityType: 'user',
          entityId: user.id,
          tenantId: user.tenant_id,
          details: { reason: user.is_active ? 'Invalid credentials' : 'User account inactive', email }
        });
      }
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await auditLog(req, {
        action: 'LOGIN_FAILED',
        entityType: 'user',
        entityId: user.id,
        tenantId: user.tenant_id,
        details: { reason: 'Password mismatch', email }
      });
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Generate access token
    const accessToken = generateAccessToken(user);

    // Generate refresh token
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

    await db('refresh_tokens').insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt
    });

    // Record login audit log
    await auditLog(req, {
      action: 'LOGIN_SUCCESS',
      entityType: 'user',
      entityId: user.id,
      tenantId: user.tenant_id,
      userId: user.id,
      details: { email: user.email, role: user.role }
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        tenantId: user.tenant_id,
        tenantName: user.tenant_name,
        tenantSlug: user.tenant_slug,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async refreshToken(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw AppError.unauthorized('Refresh token required', 'REFRESH_TOKEN_MISSING');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await db('refresh_tokens')
      .where({ token_hash: tokenHash })
      .andWhere('expires_at', '>', new Date())
      .first();

    if (!storedToken) {
      throw AppError.unauthorized('Invalid or expired refresh token', 'REFRESH_TOKEN_INVALID');
    }

    const user = await db('users')
      .join('tenants', 'users.tenant_id', 'tenants.id')
      .select(
        'users.id',
        'users.tenant_id',
        'users.email',
        'users.name',
        'users.role',
        'users.is_active',
        'tenants.name as tenant_name',
        'tenants.slug as tenant_slug'
      )
      .where({ 'users.id': storedToken.user_id, 'users.is_active': true })
      .first();

    if (!user) {
      await db('refresh_tokens').where({ id: storedToken.id }).del();
      throw AppError.unauthorized('User not found or inactive', 'USER_INACTIVE');
    }

    // Token rotation: Remove old refresh token and create new one
    await db('refresh_tokens').where({ id: storedToken.id }).del();

    const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
    const newTokenHash = hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

    await db('refresh_tokens').insert({
      user_id: user.id,
      token_hash: newTokenHash,
      expires_at: expiresAt
    });

    const accessToken = generateAccessToken(user);

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
      user: {
        id: user.id,
        tenantId: user.tenant_id,
        tenantName: user.tenant_name,
        tenantSlug: user.tenant_slug,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async logout(userId, rawRefreshToken, req) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await db('refresh_tokens').where({ token_hash: tokenHash }).del();
    } else if (userId) {
      await db('refresh_tokens').where({ user_id: userId }).del();
    }

    if (req && req.user) {
      await auditLog(req, {
        action: 'LOGOUT',
        entityType: 'user',
        entityId: req.user.id,
        details: { email: req.user.email }
      });
    }
  }

  async getMe(userId, tenantId) {
    const user = await db('users')
      .join('tenants', 'users.tenant_id', 'tenants.id')
      .select(
        'users.id',
        'users.tenant_id',
        'users.email',
        'users.name',
        'users.role',
        'users.created_at',
        'tenants.name as tenant_name',
        'tenants.slug as tenant_slug'
      )
      .where({ 'users.id': userId, 'users.tenant_id': tenantId })
      .first();

    if (!user) {
      throw AppError.notFound('User profile not found');
    }

    return user;
  }
}

module.exports = new AuthService();
