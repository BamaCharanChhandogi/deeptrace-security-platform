const db = require('../../config/database');

class DashboardService {
  async getTenantStats(tenantId) {
    // 1. Total users
    const [userCount] = await db('users')
      .where({ tenant_id: tenantId, is_active: true })
      .count('* as total');

    // 2. Campaign metrics
    const campaignCounts = await db('campaigns')
      .where({ tenant_id: tenantId })
      .groupBy('status')
      .select('status', db.raw('count(*) as count'));

    const campaignStats = {
      total: 0,
      draft: 0,
      active: 0,
      completed: 0,
      cancelled: 0
    };

    campaignCounts.forEach(c => {
      const cnt = parseInt(c.count, 10);
      campaignStats.total += cnt;
      if (c.status === 'DRAFT') campaignStats.draft = cnt;
      if (c.status === 'ACTIVE') campaignStats.active = cnt;
      if (c.status === 'COMPLETED') campaignStats.completed = cnt;
      if (c.status === 'CANCELLED') campaignStats.cancelled = cnt;
    });

    // 3. Security Event metrics
    const eventSeverityCounts = await db('security_events')
      .where({ tenant_id: tenantId })
      .groupBy('severity')
      .select('severity', db.raw('count(*) as count'));

    const eventStatusCounts = await db('security_events')
      .where({ tenant_id: tenantId })
      .groupBy('status')
      .select('status', db.raw('count(*) as count'));

    const [criticalOpenCount] = await db('security_events')
      .where({ tenant_id: tenantId, severity: 'CRITICAL' })
      .andWhereNot({ status: 'RESOLVED' })
      .andWhereNot({ status: 'DISMISSED' })
      .count('* as count');

    const [openEventsCount] = await db('security_events')
      .where({ tenant_id: tenantId })
      .andWhereNot({ status: 'RESOLVED' })
      .andWhereNot({ status: 'DISMISSED' })
      .count('* as count');

    const severityStats = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };
    eventSeverityCounts.forEach(e => {
      severityStats[e.severity] = parseInt(e.count, 10);
    });

    const statusStats = {
      OPEN: 0,
      INVESTIGATING: 0,
      RESOLVED: 0,
      DISMISSED: 0
    };
    eventStatusCounts.forEach(e => {
      statusStats[e.status] = parseInt(e.count, 10);
    });

    // 4. Recent activity feed (latest 8 audit logs)
    const recentActivity = await db('audit_logs')
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .where('audit_logs.tenant_id', tenantId)
      .select(
        'audit_logs.id',
        'audit_logs.action',
        'audit_logs.entity_type',
        'audit_logs.entity_id',
        'audit_logs.details',
        'audit_logs.created_at',
        'users.name as actor_name',
        'users.email as actor_email'
      )
      .orderBy('audit_logs.created_at', 'desc')
      .limit(8);

    return {
      users: {
        total: parseInt(userCount?.total || 0, 10)
      },
      campaigns: campaignStats,
      events: {
        total: Object.values(severityStats).reduce((a, b) => a + b, 0),
        open: parseInt(openEventsCount?.count || 0, 10),
        criticalOpen: parseInt(criticalOpenCount?.count || 0, 10),
        bySeverity: severityStats,
        byStatus: statusStats
      },
      recentActivity
    };
  }
}

module.exports = new DashboardService();
