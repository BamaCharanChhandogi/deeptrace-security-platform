const db = require('../../config/database');
const AppError = require('../../utils/AppError');
const { paginate } = require('../../utils/pagination');
const { auditLog } = require('../../utils/auditLogger');

class EventService {
  async listEvents(tenantId, query) {
    const { page, limit, severity, status, type, search, sortBy, sortOrder } = query;

    const baseQuery = db('security_events')
      .where({ tenant_id: tenantId });

    if (severity) {
      baseQuery.andWhere({ severity });
    }

    if (status) {
      baseQuery.andWhere({ status });
    }

    if (type) {
      baseQuery.andWhere({ event_type: type });
    }

    if (search) {
      baseQuery.andWhere(function() {
        this.whereILike('description', `%${search}%`)
            .orWhereILike('event_type', `%${search}%`)
            .orWhereILike('source', `%${search}%`);
      });
    }

    baseQuery.orderBy(sortBy || 'created_at', sortOrder || 'desc');

    return paginate(baseQuery, { page, limit });
  }

  async getEventById(id, tenantId) {
    const event = await db('security_events')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!event) {
      throw AppError.notFound('Security event not found');
    }

    return event;
  }

  async createEvent(tenantId, userId, data, req) {
    const [event] = await db('security_events')
      .insert({
        tenant_id: tenantId,
        event_type: data.event_type,
        severity: data.severity,
        status: data.status || 'OPEN',
        description: data.description,
        source: data.source || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      })
      .returning('*');

    await auditLog(req, {
      action: 'SECURITY_EVENT_CREATED',
      entityType: 'security_event',
      entityId: event.id,
      details: {
        eventType: event.event_type,
        severity: event.severity,
        status: event.status
      }
    });

    return event;
  }

  async updateEventStatus(id, tenantId, status, note, req) {
    const existing = await db('security_events')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!existing) {
      throw AppError.notFound('Security event not found');
    }

    const updatedMetadata = existing.metadata ? { ...existing.metadata } : {};
    if (note) {
      updatedMetadata.notes = updatedMetadata.notes || [];
      updatedMetadata.notes.push({
        text: note,
        updatedBy: req.user.name,
        updatedAt: new Date().toISOString()
      });
    }

    const [updated] = await db('security_events')
      .where({ id, tenant_id: tenantId })
      .update({
        status,
        metadata: JSON.stringify(updatedMetadata),
        updated_at: new Date()
      })
      .returning('*');

    await auditLog(req, {
      action: 'SECURITY_EVENT_STATUS_CHANGED',
      entityType: 'security_event',
      entityId: id,
      details: {
        previousStatus: existing.status,
        newStatus: status,
        note: note || null
      }
    });

    return updated;
  }
}

module.exports = new EventService();
