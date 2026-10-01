const bcrypt = require('bcryptjs');
const db = require('../../config/database');
const AppError = require('../../utils/AppError');
const { paginate } = require('../../utils/pagination');
const { auditLog } = require('../../utils/auditLogger');

class UserService {
  async listUsers(tenantId, query) {
    const { page, limit, role, search, sortBy, sortOrder } = query;

    const baseQuery = db('users')
      .where({ tenant_id: tenantId })
      .select('id', 'tenant_id', 'email', 'name', 'role', 'is_active', 'created_at', 'updated_at');

    if (role) {
      baseQuery.andWhere({ role });
    }

    if (search) {
      baseQuery.andWhere(function() {
        this.whereILike('name', `%${search}%`)
            .orWhereILike('email', `%${search}%`);
      });
    }

    baseQuery.orderBy(sortBy || 'created_at', sortOrder || 'desc');

    return paginate(baseQuery, { page, limit });
  }

  async getUserById(id, tenantId) {
    const user = await db('users')
      .where({ id, tenant_id: tenantId })
      .select('id', 'tenant_id', 'email', 'name', 'role', 'is_active', 'created_at', 'updated_at')
      .first();

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return user;
  }

  async createUser(tenantId, data, req) {
    const existing = await db('users')
      .where({ tenant_id: tenantId })
      .andWhereRaw('LOWER(email) = ?', [data.email.toLowerCase()])
      .first();

    if (existing) {
      throw AppError.conflict('A user with this email address already exists in your organization');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const [user] = await db('users')
      .insert({
        tenant_id: tenantId,
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        name: data.name,
        role: data.role || 'USER',
        is_active: true
      })
      .returning(['id', 'tenant_id', 'email', 'name', 'role', 'is_active', 'created_at']);

    await auditLog(req, {
      action: 'USER_CREATED',
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email, name: user.name, role: user.role }
    });

    return user;
  }

  async updateUser(id, tenantId, data, req) {
    const existing = await db('users')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!existing) {
      throw AppError.notFound('User not found');
    }

    const updatePayload = {
      updated_at: new Date()
    };

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.is_active !== undefined) updatePayload.is_active = data.is_active;
    if (data.password) {
      updatePayload.password_hash = await bcrypt.hash(data.password, 10);
    }

    const [updated] = await db('users')
      .where({ id, tenant_id: tenantId })
      .update(updatePayload)
      .returning(['id', 'tenant_id', 'email', 'name', 'role', 'is_active', 'created_at', 'updated_at']);

    await auditLog(req, {
      action: 'USER_UPDATED',
      entityType: 'user',
      entityId: id,
      details: {
        previous: { role: existing.role, is_active: existing.is_active },
        updated: { role: updated.role, is_active: updated.is_active }
      }
    });

    return updated;
  }
}

module.exports = new UserService();
