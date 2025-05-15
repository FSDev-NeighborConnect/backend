// tests/userRoutes.test.js
const request = require('supertest');
const server = require('../../server.js');
const User = require('../../models/User.js');
const { hashPassword } = require('../../utils/hash.js');
const {
  setupTestDB,
  teardownTestDB,
  clearDB,
} = require('../utils/testDb.js');
const { createTestUser } = require('../utils/testUser.js');
const { loginHelper } = require('../utils/testAuth.js');

// mock Cloudinary so upload hits no external API
jest.mock(
  '../../utils/cloudinaryUploader',
  () => require('../utils/mockCloudinaryUploader.js')
);

describe('User Routes (integration)', () => {
  let authCookie;
  let csrfToken;
  let user;

  beforeAll(setupTestDB);
  beforeEach(async () => {
    await clearDB();

    // 1) Create a user in the test DB
    user = await createTestUser();
    // 2) Log in to obtain auth cookie + csrfToken
    ({ authCookie, csrfToken } = await loginHelper(user.email, 'Password123!'));
    // console.log('[TEST] logged in as:', user.id);
  });
  afterAll(teardownTestDB);

  describe('GET /api/users/user/:id', () => {
    it('returns the user (omits password)', async () => {
      const res = await request(server)
        .get(`/api/users/user/${user.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        _id: user.id,
        email: user.email,
        name: user.name,
      });
      expect(res.body).not.toHaveProperty('password');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('lets the user update their own profile', async () => {
      const newBio = 'I updated my bio!';
      const res = await request(server)
        .put(`/api/users/${user.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ bio: newBio });

      expect(res.status).toBe(200);
      expect(res.body.bio).toBe(newBio);

      const fromDb = await User.findById(user.id);
      expect(fromDb.bio).toBe(newBio);
    });

    it('blocks updates when IDs mismatch', async () => {
      const res = await request(server)
        .put('/api/users/anotherUserId')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ bio: 'nice try' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/users/zip/:zip', () => {
    it('returns users in that postal code', async () => {
      const res = await request(server)
        .get(`/api/users/zip/${user.postalCode}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]._id).toBe(user.id);
    });

    it('404 if no users found', async () => {
      const res = await request(server)
        .get('/api/users/zip/99999')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/users/upload-avatar', () => {
    it('uploads avatar and writes URL into DB', async () => {
      const res = await request(server)
        .post('/api/users/upload-avatar')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .attach('avatar', Buffer.from('fake'), 'avatar.jpg');

      expect(res.status).toBe(200);
      expect(res.body.imageUrl).toMatch(/^https?:\/\//);

      const updated = await User.findById(user.id);
      expect(updated.avatar.url).toBe(res.body.imageUrl);
    });
  });

  describe('GET /api/users/currentUser', () => {
    it('returns the logged-in user’s id & role', async () => {
      const res = await request(server)
        .get('/api/users/currentUser')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: user.id,
        role: user.role,
        csrfToken: csrfToken
      });
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('allows the user to delete themselves', async () => {
      const res = await request(server)
        .delete(`/api/users/${user.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);

      const deleted = await User.findById(user.id);
      expect(deleted).toBeNull();
    });

    it('blocks user from deleting someone else', async () => {
      const otherUser = await createTestUser({ email: 'other@test.com' });

      const res = await request(server)
        .delete(`/api/users/${otherUser.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(403);
    });

    it('returns 404 if user does not exist', async () => {
      const res = await request(server)
        .delete('/api/users/999999999999999999999999')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/users/upload-avatar', () => {
    it('uploads an avatar and updates user record', async () => {
      const res = await request(server)
        .post('/api/users/upload-avatar')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .attach('avatar', Buffer.from('fake-image'), 'avatar.jpg');

      expect(res.status).toBe(200);
      expect(res.body.imageUrl).toMatch(/^https?:\/\//);

      const updated = await User.findById(user.id);
      expect(updated.avatar).toMatchObject({
        url: res.body.imageUrl,
        public_id: expect.any(String),
      });
    });
  });

  describe('POST /api/users/upload-cover', () => {
    it('uploads a cover image and updates user record', async () => {
      const res = await request(server)
        .post('/api/users/upload-cover')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .attach('cover', Buffer.from('fake-image'), 'cover.jpg');

      expect(res.status).toBe(200);
      expect(res.body.imageUrl).toMatch(/^https?:\/\//);

      const updated = await User.findById(user.id);
      expect(updated.cover).toMatchObject({
        url: res.body.imageUrl,
        public_id: expect.any(String),
      });
    });
  });


});