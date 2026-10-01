const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('Mandatory Security Scenario: Multi-Tenant Data Isolation', () => {
  let tenantAToken;
  let tenantBToken;
  const tenantBCampaignId = 'c2000001-0000-0000-0000-000000000001';
  const tenantACampaignId = 'c1000001-0000-0000-0000-000000000001';
  const tenantBUserId = 'u2000002-0000-0000-0000-000000000002';

  beforeAll(async () => {
    // 1. Authenticate as Tenant A (Sarah Connor - CyberShield Admin)
    const resA = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@cybershield.io', password: 'Password123!' });
    tenantAToken = resA.body.data.accessToken;

    // 2. Authenticate as Tenant B (Marcus Vance - SentinelOps Admin)
    const resB = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@sentinelops.io', password: 'Password123!' });
    tenantBToken = resB.body.data.accessToken;
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('Tenant B can view their own campaign', async () => {
    const res = await request(app)
      .get(`/api/campaigns/${tenantBCampaignId}`)
      .set('Authorization', `Bearer ${tenantBToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(tenantBCampaignId);
    expect(res.body.data.name).toContain('SentinelOps Internal Red-Team Exercise');
  });

  test('Tenant A user CANNOT view Tenant B campaign (returns 404 Not Found to prevent enumeration)', async () => {
    const res = await request(app)
      .get(`/api/campaigns/${tenantBCampaignId}`)
      .set('Authorization', `Bearer ${tenantAToken}`);

    // Must return 404 Not Found, never 200, never leaking Tenant B data
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.data).toBeUndefined();
  });

  test('Tenant A user CANNOT modify Tenant B campaign', async () => {
    const res = await request(app)
      .patch(`/api/campaigns/${tenantBCampaignId}`)
      .set('Authorization', `Bearer ${tenantAToken}`)
      .send({ name: 'Hacked By Tenant A' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);

    // Verify campaign in database remained untouched
    const check = await db('campaigns').where({ id: tenantBCampaignId }).first();
    expect(check.name).toBe('SentinelOps Internal Red-Team Exercise');
  });

  test('Tenant A user CANNOT delete Tenant B campaign', async () => {
    const res = await request(app)
      .delete(`/api/campaigns/${tenantBCampaignId}`)
      .set('Authorization', `Bearer ${tenantAToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);

    // Verify campaign still exists in database
    const check = await db('campaigns').where({ id: tenantBCampaignId }).first();
    expect(check).toBeDefined();
  });

  test('Tenant A CANNOT assign a Tenant B user to Tenant A campaign', async () => {
    const res = await request(app)
      .post(`/api/campaigns/${tenantACampaignId}/members`)
      .set('Authorization', `Bearer ${tenantAToken}`)
      .send({ userId: tenantBUserId });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Tenant A campaign list query never returns Tenant B campaigns', async () => {
    const res = await request(app)
      .get('/api/campaigns')
      .set('Authorization', `Bearer ${tenantAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const ids = res.body.data.map(c => c.id);
    expect(ids).not.toContain(tenantBCampaignId);
  });
});
