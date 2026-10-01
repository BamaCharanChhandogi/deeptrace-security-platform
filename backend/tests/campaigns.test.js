const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

jest.setTimeout(30000);

describe('Campaign Management, RBAC & State Machine', () => {
  let adminToken;
  let managerToken;
  let userToken;

  beforeAll(async () => {
    const resAdmin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@cybershield.io', password: 'Password123!' });
    adminToken = resAdmin.body.data.accessToken;

    const resMgr = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@cybershield.io', password: 'Password123!' });
    managerToken = resMgr.body.data.accessToken;

    const resUser = await request(app)
      .post('/api/auth/login')
      .send({ email: 'analyst@cybershield.io', password: 'Password123!' });
    userToken = resUser.body.data.accessToken;
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('USER role CANNOT create campaigns (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Unauthorized Campaign' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('USER role CANNOT view audit logs (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  test('MANAGER role CANNOT view audit logs (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(403);
  });

  test('ADMIN role CAN view audit logs', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('MANAGER role CAN create a campaign', async () => {
    const res = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        name: 'Automated Test Campaign',
        description: 'Testing campaign lifecycle and RBAC',
        status: 'DRAFT'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');

    const createdId = res.body.data.id;

    // Test Valid State Transition: DRAFT -> ACTIVE
    const actRes = await request(app)
      .patch(`/api/campaigns/${createdId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'ACTIVE' });

    expect(actRes.status).toBe(200);
    expect(actRes.body.data.status).toBe('ACTIVE');

    // Test Valid State Transition: ACTIVE -> COMPLETED
    const compRes = await request(app)
      .patch(`/api/campaigns/${createdId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'COMPLETED' });

    expect(compRes.status).toBe(200);
    expect(compRes.body.data.status).toBe('COMPLETED');

    // Test Invalid State Transition: COMPLETED -> DRAFT (Terminal state!)
    const invalidRes = await request(app)
      .patch(`/api/campaigns/${createdId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'DRAFT' });

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.error.message).toContain('Terminal states cannot transition back');

    // Test MANAGER CANNOT delete campaign (403 Forbidden)
    const delResMgr = await request(app)
      .delete(`/api/campaigns/${createdId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(delResMgr.status).toBe(403);

    // Test ADMIN CAN delete campaign
    const delResAdmin = await request(app)
      .delete(`/api/campaigns/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(delResAdmin.status).toBe(200);
  });
});
