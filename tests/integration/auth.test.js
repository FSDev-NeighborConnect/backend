const request = require('supertest');
const server = require('../../server.js');
const User = require('../../models/User.js');
const { hashPassword } = require('../../utils/hash.js');
const { setupTestDB, teardownTestDB, clearDB } = require('../utils/testDb.js');

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


      console.log('[SIGNUP TEST] Response:', res.statusCode, res.body);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully.');
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      const hashedPassword = await hashPassword('mypassword');
      await User.create({
        name: 'Test123',
        email: 'test@example.com',
        password: hashedPassword,
        streetAddress: 'Testingvägen 1',
        postalCode: '12345',
        phone: '000000'
      });
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
});

beforeAll(setupTestDB);
beforeEach(clearDB);
afterAll(teardownTestDB);