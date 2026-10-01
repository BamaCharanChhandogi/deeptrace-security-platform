const db = require('../../config/database');
const { paginate } = require('../../utils/pagination');

class AuditService {
  async listLogs(tenantId, query) {
    const { page, limit, action, entityType, search, sortBy, sortOrder } = query;

    const baseQuery = db('audit_logs')
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .where('audit_logs.tenant_id', tenantId)
      .select(
        'audit_logs.*',
        'users.name as actor_name',
        'users.email as actor_email',
        'users.role as actor_role'
      );

    if (action) {
      baseQuery.andWhere('audit_logs.action', action);
    }

    if (entityType) {
      baseQuery.andWhere('audit_logs.entity_type', entityType);
    }

    if (search) {
      baseQuery.andWhere(function() {
        this.whereILike('audit_logs.action', `%${search}%`)
            .orWhereILike('audit_logs.entity_type', `%${search}%`)
            .orWhereILike('users.name', `%${search}%`)
            .orWhereILike('users.email', `%${search}%`);
      });
    }

    baseQuery.orderBy(`audit_logs.${sortBy || 'created_at'}`, sortOrder || 'desc');

    return paginate(baseQuery, { page, limit });
  }
}

module.exports = new AuditService();
