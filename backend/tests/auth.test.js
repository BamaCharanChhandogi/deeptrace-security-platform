const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('Authentication & Authorization', () => {
  jest.setTimeout(30000);

  afterAll(async () => {
    await db.destroy();
  });

  test('POST /api/auth/login succeeds with valid credentials and sets refresh cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@cybershield.io',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@cybershield.io');
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('POST /api/auth/login fails with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@cybershield.io',
        password: 'WrongPassword!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('GET /api/auth/me fails when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me succeeds with valid Bearer token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@cybershield.io', password: 'Password123!' });

    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('MANAGER');
  });
});
