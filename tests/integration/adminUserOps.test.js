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
  ({ authCookie, csrfToken } = await loginHelper('admin@example.com', 'AdminPass123!'));
});

afterAll(teardownTestDB);
describe('Admin Routes - User Operations (integration)', () => {
  describe('POST /api/admin/users/create', () => {

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

  describe('PUT /api/admin/users/:id', () => {

    it('updates an existing user', async () => {
      const userToUpdate = await User.findOne({ email: 'user@example.com' });
      const res = await request(server)
        .put(`/api/admin/users/${userToUpdate.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });

    it('returns 404 if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(server)
        .put(`/api/admin/users/${fakeId}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ name: 'No One' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('denies update without CSRF token', async () => {
      const userToUpdate = await User.findOne({ email: 'user@example.com' });
      const res = await request(server)
        .put(`/api/admin/users/${userToUpdate.id}`)
        .set('Cookie', authCookie)   // no CSRF
        .send({ name: 'Should Fail' });

      expect(res.status).toBe(403);
    });

    it('denies update by non-admin user', async () => {
      const other = await createTestUser({
        email: 'hacker@example.com',
        password: 'HackPass123!',
        role: 'member'
      });
      const login = await loginHelper(other.email, 'HackPass123!');
      const userToUpdate = await User.findOne({ email: 'user@example.com' });

      const res = await request(server)
        .put(`/api/admin/users/${userToUpdate.id}`)
        .set('Cookie', login.authCookie)
        .set('X-CSRF-Token', login.csrfToken)
        .send({ name: 'Hacked' });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/admin/i);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
  });

  it('deletes an existing user', async () => {
    const userToDelete = await User.findOne({ email: 'user@example.com' });
    const res = await request(server)
      .delete(`/api/admin/users/${userToDelete.id}`)
      .set('Cookie', authCookie)
      .set('X-CSRF-Token', csrfToken);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/successfully deleted/i);
  });

  it('returns 404 if user not found', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(server)
      .delete(`/api/admin/users/${fakeId}`)
      .set('Cookie', authCookie)
      .set('X-CSRF-Token', csrfToken);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('denies delete without CSRF token', async () => {
    const userToDelete = await User.findOne({ email: 'user@example.com' });
    const res = await request(server)
      .delete(`/api/admin/users/${userToDelete.id}`)
      .set('Cookie', authCookie); // no CSRF

    expect(res.status).toBe(403);
  });

  it('denies delete by non-admin user', async () => {
    const other = await createTestUser({
      email: 'intruder@example.com',
      password: 'Intrude123!',
      role: 'member'
    });
    const login = await loginHelper(other.email, 'Intrude123!');
    const userToDelete = await User.findOne({ email: 'user@example.com' });

    const res = await request(server)
      .delete(`/api/admin/users/${userToDelete.id}`)
      .set('Cookie', login.authCookie)
      .set('X-CSRF-Token', login.csrfToken);

    expect(res.status).toBe(403);
  });
});