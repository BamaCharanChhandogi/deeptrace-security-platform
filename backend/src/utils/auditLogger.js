const db = require('../config/database');
const logger = require('./logger');

/**
 * Record an audit log entry in the database
 * @param {import('express').Request} req - Express request
 * @param {object} params
 * @param {string} params.action - e.g. CAMPAIGN_CREATED, USER_ROLE_UPDATED
 * @param {string} [params.entityType] - e.g. campaign, user, security_event
 * @param {string} [params.entityId] - UUID of entity
 * @param {object} [params.details] - Arbitrary JSON metadata
 * @param {string} [params.tenantId] - Optional override if unauthenticated (e.g. login attempt)
 * @param {string} [params.userId] - Optional override
 */
async function auditLog(req, { action, entityType = null, entityId = null, details = null, tenantId = null, userId = null }) {
  try {
    const finalTenantId = tenantId || req?.user?.tenantId;
    const finalUserId = userId || req?.user?.id || null;

    if (!finalTenantId) {
      logger.warn('Audit log omitted: No tenantId resolvable for action %s', action);
      return;
    }

    const ipAddress = req?.headers['x-forwarded-for']?.split(',')[0].trim() || req?.ip || req?.socket?.remoteAddress || null;
    const userAgent = req?.get('user-agent') || null;

    await db('audit_logs').insert({
      tenant_id: finalTenantId,
      user_id: finalUserId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details ? JSON.stringify(details) : null,
      ip_address: ipAddress ? ipAddress.slice(0, 50) : null,
      user_agent: userAgent
    });
  } catch (err) {
    // Non-blocking: Audit log failure should be logged but never crash the core business transaction
    logger.error('Failed to write audit log: %s', err.message, { stack: err.stack });
  }
}

module.exports = { auditLog };
