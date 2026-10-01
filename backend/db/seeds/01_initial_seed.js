const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Clear tables in reverse dependency order
  await knex('refresh_tokens').del();
  await knex('audit_logs').del();
  await knex('security_events').del();
  await knex('campaign_members').del();
  await knex('campaigns').del();
  await knex('users').del();
  await knex('tenants').del();

  // Common password hash for 'Password123!'
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Tenants
  const tenantAId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const tenantBId = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

  await knex('tenants').insert([
    {
      id: tenantAId,
      name: 'CyberShield Corp',
      slug: 'cybershield'
    },
    {
      id: tenantBId,
      name: 'SentinelOps Inc',
      slug: 'sentinelops'
    }
  ]);

  // 2. Users
  const userAAdmin = 'u1000001-0000-0000-0000-000000000001';
  const userAManager = 'u1000002-0000-0000-0000-000000000002';
  const userAAnalyst = 'u1000003-0000-0000-0000-000000000003';
  const userBAdmin = 'u2000001-0000-0000-0000-000000000001';
  const userBManager = 'u2000002-0000-0000-0000-000000000002';

  await knex('users').insert([
    {
      id: userAAdmin,
      tenant_id: tenantAId,
      email: 'admin@cybershield.io',
      password_hash: passwordHash,
      name: 'Sarah Connor (Admin)',
      role: 'ADMIN',
      is_active: true
    },
    {
      id: userAManager,
      tenant_id: tenantAId,
      email: 'manager@cybershield.io',
      password_hash: passwordHash,
      name: 'John Miller (Manager)',
      role: 'MANAGER',
      is_active: true
    },
    {
      id: userAAnalyst,
      tenant_id: tenantAId,
      email: 'analyst@cybershield.io',
      password_hash: passwordHash,
      name: 'David Webb (Analyst)',
      role: 'USER',
      is_active: true
    },
    {
      id: userBAdmin,
      tenant_id: tenantBId,
      email: 'admin@sentinelops.io',
      password_hash: passwordHash,
      name: 'Marcus Vance (Tenant B Admin)',
      role: 'ADMIN',
      is_active: true
    },
    {
      id: userBManager,
      tenant_id: tenantBId,
      email: 'manager@sentinelops.io',
      password_hash: passwordHash,
      name: 'Elena Rostova (Tenant B Manager)',
      role: 'MANAGER',
      is_active: true
    }
  ]);

  // 3. Campaigns
  const campA1 = 'c1000001-0000-0000-0000-000000000001';
  const campA2 = 'c1000002-0000-0000-0000-000000000002';
  const campA3 = 'c1000003-0000-0000-0000-000000000003';
  const campA4 = 'c1000004-0000-0000-0000-000000000004';
  const campB1 = 'c2000001-0000-0000-0000-000000000001';

  await knex('campaigns').insert([
    {
      id: campA1,
      tenant_id: tenantAId,
      name: 'Q4 Phishing Resilience Drill',
      description: 'Simulated credential harvesting exercise targeting engineering and finance teams.',
      status: 'ACTIVE',
      start_date: '2026-09-15',
      end_date: '2026-10-15',
      created_by: userAAdmin
    },
    {
      id: campA2,
      tenant_id: tenantAId,
      name: 'Cloud Perimeter Hardening',
      description: 'Audit and remediation of AWS S3 and IAM roles across production accounts.',
      status: 'DRAFT',
      start_date: '2026-10-10',
      end_date: '2026-11-20',
      created_by: userAManager
    },
    {
      id: campA3,
      tenant_id: tenantAId,
      name: 'Zero-Trust Endpoint Onboarding',
      description: 'Rollout of mTLS client certificates and EDR agents to remote fleet.',
      status: 'COMPLETED',
      start_date: '2026-07-01',
      end_date: '2026-08-30',
      created_by: userAAdmin
    },
    {
      id: campA4,
      tenant_id: tenantAId,
      name: 'Legacy VPN Retirement',
      description: 'Deprecating legacy IPsec gateways in favor of identity-aware proxies.',
      status: 'CANCELLED',
      start_date: '2026-08-01',
      end_date: '2026-09-01',
      created_by: userAManager
    },
    {
      id: campB1,
      tenant_id: tenantBId,
      name: 'SentinelOps Internal Red-Team Exercise',
      description: 'Confidential Tenant B red-team penetration test against perimeter assets.',
      status: 'ACTIVE',
      start_date: '2026-09-20',
      end_date: '2026-10-30',
      created_by: userBAdmin
    }
  ]);

  // 4. Campaign Members
  await knex('campaign_members').insert([
    {
      campaign_id: campA1,
      user_id: userAManager,
      assigned_by: userAAdmin
    },
    {
      campaign_id: campA1,
      user_id: userAAnalyst,
      assigned_by: userAAdmin
    },
    {
      campaign_id: campA2,
      user_id: userAAnalyst,
      assigned_by: userAManager
    },
    {
      campaign_id: campB1,
      user_id: userBManager,
      assigned_by: userBAdmin
    }
  ]);

  // 5. Security Events
  await knex('security_events').insert([
    {
      tenant_id: tenantAId,
      event_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      severity: 'CRITICAL',
      status: 'OPEN',
      description: 'Repeated failed administrative login attempts from blacklisted ASN (198.51.100.42).',
      source: 'WAF / Edge Gateway',
      metadata: JSON.stringify({ ip: '198.51.100.42', attempts: 14, targetedEndpoint: '/api/v1/auth/admin' })
    },
    {
      tenant_id: tenantAId,
      event_type: 'SUSPICIOUS_OUTBOUND_TRAFFIC',
      severity: 'HIGH',
      status: 'INVESTIGATING',
      description: 'Unusual spike in DNS queries towards newly registered suspicious domains.',
      source: 'Internal DNS Resolver',
      metadata: JSON.stringify({ queryCount: 2450, domainTld: '.top', infectedHost: '10.0.4.15' })
    },
    {
      tenant_id: tenantAId,
      event_type: 'API_TOKEN_EXPIRED',
      severity: 'LOW',
      status: 'RESOLVED',
      description: 'CI/CD pipeline failed automated webhook call due to expired JWT token.',
      source: 'Auth Service',
      metadata: JSON.stringify({ serviceId: 'svc-github-actions', lastRotated: '2026-06-01' })
    },
    {
      tenant_id: tenantAId,
      event_type: 'PRIVILEGE_ESCALATION_DETECTED',
      severity: 'CRITICAL',
      status: 'OPEN',
      description: 'Non-admin user attempted to execute role alteration endpoint without permissions.',
      source: 'RBAC Enforcement Layer',
      metadata: JSON.stringify({ userId: userAAnalyst, targetAction: 'PROMOTE_TO_ADMIN' })
    },
    {
      tenant_id: tenantAId,
      event_type: 'BRUTE_FORCE_RATE_LIMIT',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      description: 'IP rate limit triggered on endpoint /api/auth/login.',
      source: 'API Gateway',
      metadata: JSON.stringify({ blockedIp: '203.0.113.88', durationSeconds: 900 })
    },
    {
      tenant_id: tenantBId,
      event_type: 'MALWARE_SIGNATURE_DETECTED',
      severity: 'HIGH',
      status: 'OPEN',
      description: 'EDR detected suspicious PowerShell execution with encoded command arguments.',
      source: 'Sentinel EDR Agent',
      metadata: JSON.stringify({ host: 'SENTINEL-WIN-09', threatId: 'Trojan.Win32.Cobalt' })
    }
  ]);

  // 6. Audit Logs
  await knex('audit_logs').insert([
    {
      tenant_id: tenantAId,
      user_id: userAAdmin,
      action: 'TENANT_INITIALIZED',
      entity_type: 'tenant',
      entity_id: tenantAId,
      details: JSON.stringify({ message: 'CyberShield Corp platform instance initialized' }),
      ip_address: '10.0.0.1',
      user_agent: 'System Seeder'
    },
    {
      tenant_id: tenantAId,
      user_id: userAAdmin,
      action: 'CAMPAIGN_CREATED',
      entity_type: 'campaign',
      entity_id: campA1,
      details: JSON.stringify({ name: 'Q4 Phishing Resilience Drill', status: 'ACTIVE' }),
      ip_address: '127.0.0.1',
      user_agent: 'Chrome/128.0 (Windows NT 10.0)'
    },
    {
      tenant_id: tenantAId,
      user_id: userAAdmin,
      action: 'USER_ASSIGNED_TO_CAMPAIGN',
      entity_type: 'campaign_member',
      entity_id: campA1,
      details: JSON.stringify({ assignedUserId: userAManager, campaignId: campA1 }),
      ip_address: '127.0.0.1',
      user_agent: 'Chrome/128.0 (Windows NT 10.0)'
    },
    {
      tenant_id: tenantBId,
      user_id: userBAdmin,
      action: 'CAMPAIGN_CREATED',
      entity_type: 'campaign',
      entity_id: campB1,
      details: JSON.stringify({ name: 'SentinelOps Internal Red-Team Exercise', status: 'ACTIVE' }),
      ip_address: '192.168.1.100',
      user_agent: 'Firefox/130.0 (Linux x86_64)'
    }
  ]);
};
