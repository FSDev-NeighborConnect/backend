const request = require('supertest');
const server = require('../../server.js');
const { hashPassword } = require('../../utils/hash.js');
const { setupTestDB, teardownTestDB, clearDB } = require('../utils/testDb.js');
const createTestUser = require('../utils/testUser.js');
const loginHelper = require('../utils/testAuth.js');

beforeAll(setupTestDB);
beforeEach(clearDB);
afterAll(teardownTestDB);

describe('Auth Routes (integration)', () => {
  describe('POST /api/signup', () => {
    it('should create new user and return 201', async () => {
      const res = await request(server)
        .post('/api/signup')
        .send({
          name: 'Tester Testingsson',
          email: 'test@example.com',
          password: 'Test12345678!',
          streetAddress: 'Testingvagen 1',
          postalCode: '12345',
          phone: '000000'
        });


      // Uncomment to debug potential signup problems via response object
      // console.log('[SIGNUP TEST] Response:', res.statusCode, res.body);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully.');
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      const hashedPassword = await hashPassword('mypassword');
      await createTestUser({ email: 'test@example.com', password: 'mypassword' });
    });

    it('should login a user and return a cookie', async () => {
      const res = await request(server)
        .post('/api/login')
        .send({ email: 'test@example.com', password: 'mypassword' });

      expect(res.statusCode).toBe(200);

      expect(res.headers['set-cookie']).toBeDefined();

      expect(res.body).toHaveProperty('message', 'Login successful');

      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toMatchObject({
        email: 'test@example.com',
        role: expect.any(String),
        id: expect.any(String)
      })

      expect(res.body).toHaveProperty('csrfToken');
      expect(typeof res.body.csrfToken).toBe('string');
    });

    it('should fail with wrong password', async () => {
      const res = await request(server)
        .post('/api/login')
        .send({ email: 'test@example.com', password: 'wrongpass' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/logout', () => {
    it('clears the auth cookie and returns 204', async () => {
      const user = await createTestUser({ email: 'admin@example.com', password: 'AdminPass123!', role: 'admin' });
      const { authCookie, csrfToken } = await loginHelper(user.email, 'AdminPass123!');

      const res = await request(server)
        .post('/api/logout')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(204);

      const setCookie = res.headers['set-cookie'];
      expect(setCookie).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/token=;/) // token cookie should be cleared
        ])
      );
    });
  });
});