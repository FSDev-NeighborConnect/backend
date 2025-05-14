const request = require('supertest');
const server = require('../../server.js');
const User = require('../../models/User.js');
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
describe('Admin Routes (integration', () => {
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

  describe('POST /api/admin/users/create', () => {
    beforeEach(async () => {
      ({ authCookie, csrfToken } = await loginHelper('admin@example.com', 'AdminPass123!'));
    });

    it('creates a new user as admin', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'StrongPass123!',
        streetAddress: '456 New Street',
        postalCode: '11111',
        phone: '5555555',
        role: 'member'
      };

      const res = await request(server)
        .post('/api/admin/users/create')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/registered successfully/i);

      const user = await User.findOne({ email: newUser.email });
      expect(user).not.toBeNull();
      expect(user.role).toBe('member');
    });

    it('rejects duplicate email', async () => {
      await createTestUser({ email: 'duplicate@example.com' });

      const res = await request(server)
        .post('/api/admin/users/create')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: 'Clone',
          email: 'duplicate@example.com',
          password: 'Copy123!',
          streetAddress: '789 Clone Ave',
          postalCode: '22222',
          phone: '555555',
          role: 'member'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('denies creation without CSRF token', async () => {
      const newUser = {
        name: 'Someone Else',
        email: 'else@example.com',
        password: 'Pass123!',
        streetAddress: '111 Else St',
        postalCode: '33333',
        phone: '555666665',
        role: 'member'
      };

      const res = await request(server)
        .post('/api/admin/users/create')
        .set('Cookie', authCookie)  // no X-CSRF-Token header
        .send(newUser);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/csrf/i);
    });

    it('denies creation by non-admin users', async () => {
      const nonAdmin = await createTestUser({
        email: 'notadmin2@example.com',
        password: 'NotAdmin234!',
        role: 'member'
      });
      const login = await loginHelper(nonAdmin.email, 'NotAdmin234!');

      const newUser = {
        name: 'Bad Actor',
        email: 'bad@example.com',
        password: 'BadPass123!',
        streetAddress: '999 Bad St',
        postalCode: '44444',
        phone: '5554356',
        role: 'member'
      };

      const res = await request(server)
        .post('/api/admin/users/create')
        .set('Cookie', login.authCookie)
        .set('X-CSRF-Token', login.csrfToken)
        .send(newUser);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/admin access required/i);
    });
  });
});