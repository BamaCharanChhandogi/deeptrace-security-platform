const db = require('../../config/database');
const AppError = require('../../utils/AppError');
const { paginate } = require('../../utils/pagination');
const { isValidTransition } = require('../../utils/stateMachine');
const { auditLog } = require('../../utils/auditLogger');

class CampaignService {
  async listCampaigns(tenantId, query) {
    const { page, limit, status, search, sortBy, sortOrder } = query;

    const baseQuery = db('campaigns')
      .leftJoin('users', 'campaigns.created_by', 'users.id')
      .where('campaigns.tenant_id', tenantId)
      .select(
        'campaigns.*',
        'users.name as creator_name',
        'users.email as creator_email'
      );

    if (status) {
      baseQuery.andWhere('campaigns.status', status);
    }

    if (search) {
      baseQuery.andWhere(function() {
        this.whereILike('campaigns.name', `%${search}%`)
            .orWhereILike('campaigns.description', `%${search}%`);
      });
    }

    baseQuery.orderBy(`campaigns.${sortBy || 'created_at'}`, sortOrder || 'desc');

    const result = await paginate(baseQuery, { page, limit });

    // Fetch member counts for the returned campaigns
    if (result.data.length > 0) {
      const campaignIds = result.data.map(c => c.id);
      const memberCounts = await db('campaign_members')
        .whereIn('campaign_id', campaignIds)
        .groupBy('campaign_id')
        .select('campaign_id', db.raw('count(*) as member_count'));

      const countsMap = memberCounts.reduce((acc, row) => {
        acc[row.campaign_id] = parseInt(row.member_count, 10);
        return acc;
      }, {});

      result.data = result.data.map(c => ({
        ...c,
        member_count: countsMap[c.id] || 0
      }));
    }

    return result;
  }

  async getCampaignById(id, tenantId) {
    const campaign = await db('campaigns')
      .leftJoin('users', 'campaigns.created_by', 'users.id')
      .where({ 'campaigns.id': id, 'campaigns.tenant_id': tenantId })
      .select(
        'campaigns.*',
        'users.name as creator_name',
        'users.email as creator_email'
      )
      .first();

    if (!campaign) {
      // Security: Always return 404 rather than 403 to prevent resource enumeration
      throw AppError.notFound('Campaign not found');
    }

    // Load members
    const members = await db('campaign_members')
      .join('users', 'campaign_members.user_id', 'users.id')
      .where('campaign_members.campaign_id', id)
      .select(
        'users.id',
        'users.name',
        'users.email',
        'users.role',
        'campaign_members.assigned_at'
      );

    return {
      ...campaign,
      members
    };
  }

  async createCampaign(tenantId, userId, data, req) {
    const [campaign] = await db('campaigns')
      .insert({
        tenant_id: tenantId,
        name: data.name,
        description: data.description || null,
        status: data.status || 'DRAFT',
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        created_by: userId
      })
      .returning('*');

    await auditLog(req, {
      action: 'CAMPAIGN_CREATED',
      entityType: 'campaign',
      entityId: campaign.id,
      details: { name: campaign.name, status: campaign.status }
    });

    return campaign;
  }

  async updateCampaign(id, tenantId, userId, data, req) {
    // Multi-tenant check
    const existing = await db('campaigns')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!existing) {
      throw AppError.notFound('Campaign not found');
    }

    // Validate state machine transition if status is being updated
    if (data.status && data.status !== existing.status) {
      if (!isValidTransition(existing.status, data.status)) {
        throw AppError.badRequest(
          `Invalid status transition from '${existing.status}' to '${data.status}'. Terminal states cannot transition back.`
        );
      }
    }

    const updatePayload = {
      ...data,
      updated_at: new Date()
    };

    const [updated] = await db('campaigns')
      .where({ id, tenant_id: tenantId })
      .update(updatePayload)
      .returning('*');

    const action = (data.status && data.status !== existing.status)
      ? 'CAMPAIGN_STATUS_CHANGED'
      : 'CAMPAIGN_UPDATED';

    await auditLog(req, {
      action,
      entityType: 'campaign',
      entityId: id,
      details: {
        previous: { status: existing.status, name: existing.name },
        current: { status: updated.status, name: updated.name }
      }
    });

    return updated;
  }

  async deleteCampaign(id, tenantId, req) {
    const existing = await db('campaigns')
      .where({ id, tenant_id: tenantId })
      .first();

    if (!existing) {
      throw AppError.notFound('Campaign not found');
    }

    await db('campaigns').where({ id, tenant_id: tenantId }).del();

    await auditLog(req, {
      action: 'CAMPAIGN_DELETED',
      entityType: 'campaign',
      entityId: id,
      details: { name: existing.name, status: existing.status }
    });

    return { message: 'Campaign deleted successfully' };
  }

  async assignMember(campaignId, tenantId, memberUserId, assignedByUserId, req) {
    // 1. Ensure campaign belongs to this tenant
    const campaign = await db('campaigns')
      .where({ id: campaignId, tenant_id: tenantId })
      .first();

    if (!campaign) {
      throw AppError.notFound('Campaign not found');
    }

    // 2. Ensure member user belongs to the SAME tenant (anti-cross-tenant assignment)
    const targetUser = await db('users')
      .where({ id: memberUserId, tenant_id: tenantId, is_active: true })
      .first();

    if (!targetUser) {
      throw AppError.badRequest('Target user does not exist in your organization or is inactive');
    }

    // 3. Check for existing membership
    const existing = await db('campaign_members')
      .where({ campaign_id: campaignId, user_id: memberUserId })
      .first();

    if (existing) {
      throw AppError.conflict('User is already assigned to this campaign');
    }

    const [member] = await db('campaign_members')
      .insert({
        campaign_id: campaignId,
        user_id: memberUserId,
        assigned_by: assignedByUserId
      })
      .returning('*');

    await auditLog(req, {
      action: 'CAMPAIGN_MEMBER_ASSIGNED',
      entityType: 'campaign_member',
      entityId: campaignId,
      details: { campaignId, assignedUserId: memberUserId, userEmail: targetUser.email }
    });

    return {
      ...member,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    };
  }

  async removeMember(campaignId, tenantId, memberUserId, req) {
    const campaign = await db('campaigns')
      .where({ id: campaignId, tenant_id: tenantId })
      .first();

    if (!campaign) {
      throw AppError.notFound('Campaign not found');
    }

    const deletedCount = await db('campaign_members')
      .where({ campaign_id: campaignId, user_id: memberUserId })
      .del();

    if (deletedCount === 0) {
      throw AppError.notFound('User is not assigned to this campaign');
    }

    await auditLog(req, {
      action: 'CAMPAIGN_MEMBER_REMOVED',
      entityType: 'campaign_member',
      entityId: campaignId,
      details: { campaignId, removedUserId: memberUserId }
    });

    return { message: 'Member removed from campaign' };
  }

  async getMembers(campaignId, tenantId) {
    const campaign = await db('campaigns')
      .where({ id: campaignId, tenant_id: tenantId })
      .first();

    if (!campaign) {
      throw AppError.notFound('Campaign not found');
    }

    const members = await db('campaign_members')
      .join('users', 'campaign_members.user_id', 'users.id')
      .where('campaign_members.campaign_id', campaignId)
      .select(
        'users.id',
        'users.name',
        'users.email',
        'users.role',
        'campaign_members.assigned_at'
      );

    return members;
  }
}

module.exports = new CampaignService();
