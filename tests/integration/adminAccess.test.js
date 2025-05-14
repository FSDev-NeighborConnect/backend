const request = require('supertest');
const server = require('../../server.js');
const { createTestUser } = require('../utils/testUser.js');
const { loginHelper } = require('../utils/testAuth.js');
const { setupTestDB, teardownTestDB, clearDB } = require('../utils/testDb.js');

let authCookie, csrfToken;

beforeAll(setupTestDB);

beforeEach(async () => {
  await clearDB();

  // Seeds DB with admin & member users
  await createTestUser({
    email: 'admin@example.com',
    password: 'AdminPass123!',
    role: 'admin'
  });
  await createTestUser({
    email: 'user@example.com',
    password: 'UserPass123!',
    role: 'member'
  });
});

afterAll(teardownTestDB);
describe('Admin Routes - Access (integration)', () => {
  describe('POST /api/admin/login', () => {
    it('logs in an admin and returns a CSRF token and sets cookies', async () => {
      const res = await request(server)
        .post('/api/admin/login')
        .send({ email: 'admin@example.com', password: 'AdminPass123!' });

      expect(res.status).toBe(200);

      expect(res.body).toHaveProperty('csrfToken');
      expect(typeof res.body.csrfToken).toBe('string');
      expect(res.body.csrfToken.length).toBeGreaterThan(10);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.includes('HttpOnly'))).toBe(true);
      expect(cookies.some(c => c.includes('token='))).toBe(true);
    });

    it('rejects login with incorrect password', async () => {
      const res = await request(server)
        .post('/api/admin/login')
        .send({ email: 'admin@example.com', password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials!');
    });

    it('rejects login for non-admin user', async () => {
      const res = await request(server)
        .post('/api/admin/login')
        .send({ email: 'user@example.com', password: 'UserPass123!' });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Admin access only!');
    });

    it('rejects login for non-existent user', async () => {
      const res = await request(server)
        .post('/api/admin/login')
        .send({ email: 'ghost@example.com', password: 'GhostPass123!' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials!');
    });
  });

  describe('GET /api/admin/all/users', () => {
    beforeEach(async () => {
      ({ authCookie, csrfToken } = await loginHelper('admin@example.com', 'AdminPass123!'));
    });

    it('allows admin to fetch all users', async () => {
      const res = await request(server)
        .get('/api/admin/all/users')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body[0]).not.toHaveProperty('password');
    });

    it('denies access without valid CSRF token', async () => {
      const res = await request(server)
        .get('/api/admin/all/users')
        .set('Cookie', authCookie); // no CSRF

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/csrf/i);
    });

    it('denies access to non-admin users', async () => {
      const nonAdmin = await createTestUser({
        email: 'nonadmin@example.com',
        password: 'NotAdmin123!',
        role: 'member'
      });
      const login = await loginHelper(nonAdmin.email, 'NotAdmin123!');

      const res = await request(server)
        .get('/api/admin/all/users')
        .set('Cookie', login.authCookie)
        .set('X-CSRF-Token', login.csrfToken);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/admin/i);
    });
  });
});