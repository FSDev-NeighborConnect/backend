const request = require('supertest');
const server = require('../../server.js');
const User = require('../../models/User.js');
const Post = require('../../models/Post.js');
const { createTestUser } = require('../utils/testUser.js');
const { loginHelper } = require('../utils/testAuth.js');
const { setupTestDB, teardownTestDB, clearDB } = require('../utils/testDb.js');
const mongoose = require('mongoose');

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
describe('Admin Routes - Post Operations (integration)', () => {

  describe('PUT /api/admin/posts/:id', () => {
    beforeEach(async () => {
      ({ authCookie, csrfToken } = await loginHelper('admin@example.com', 'AdminPass123!'));
    });

    it('updates an existing post', async () => {
      const admin = await User.findOne({ email: 'admin@example.com' });
      const post = await Post.create({
        title: 'Original',
        description: 'Some description here',
        category: 'Test',
        status: 'open',
        street: '123 A St',
        postalCode: '00000',
        createdBy: admin.id
      });

      const res = await request(server)
        .put(`/api/admin/posts/${post.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/post updated/i);
    });

    it('returns 404 if post not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(server)
        .put(`/api/admin/posts/${fakeId}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ title: 'No Post' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post not found!');
    });

    it('denies update without CSRF token', async () => {
      const admin = await User.findOne({ email: 'admin@example.com' });
      const post = await Post.create({
        title: 'Skip CSRF',
        description: 'Some description here',
        category: 'Test',
        status: 'open',
        street: '123 A St',
        postalCode: '00000',
        createdBy: admin.id
      });

      const res = await request(server)
        .put(`/api/admin/posts/${post.id}`)
        .set('Cookie', authCookie) // no CSRF
        .send({ title: 'Should Fail' });

      expect(res.status).toBe(403);
    });

    it('denies update by non-admin user', async () => {
      const other = await createTestUser({
        email: 'notadminpost@example.com',
        password: 'Post123!',
        role: 'member'
      });
      const login = await loginHelper(other.email, 'Post123!');
      const admin = await User.findOne({ email: 'admin@example.com' });
      const post = await Post.create({
        title: 'No Access',
        description: 'Some description here',
        category: 'Test',
        status: 'open',
        street: '123 A St',
        postalCode: '00000',
        createdBy: admin.id
      });

      const res = await request(server)
        .put(`/api/admin/posts/${post.id}`)
        .set('Cookie', login.authCookie)
        .set('X-CSRF-Token', login.csrfToken)
        .send({ title: 'Hack Title' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/admin/posts/:id', () => {
    beforeEach(async () => {
      ({ authCookie, csrfToken } = await loginHelper('admin@example.com', 'AdminPass123!'));
    });

    it('deletes an existing post', async () => {
      const admin = await User.findOne({ email: 'admin@example.com' });
      const post = await Post.create({
        title: 'To be deleted',
        description: 'Some description here',
        category: 'Test',
        status: 'open',
        street: '123 A St',
        postalCode: '00000',
        createdBy: admin.id
      });

      const res = await request(server)
        .delete(`/api/admin/posts/${post.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/post deleted successfully/i);
    });

    it('returns 404 if post not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(server)
        .delete(`/api/admin/posts/${fakeId}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post not found.');
    });

    it('denies delete without CSRF token', async () => {
      const admin = await User.findOne({ email: 'admin@example.com' });
      const post = await Post.create({
        title: 'Skip Delete CSRF',
        description: 'Some description here',
        category: 'Test',
        status: 'open',
        street: '123 A St',
        postalCode: '00000',
        createdBy: admin.id
      });

      const res = await request(server)
        .delete(`/api/admin/posts/${post.id}`)
        .set('Cookie', authCookie); // no CSRF

      expect(res.status).toBe(403);
    });

    it('denies delete by non-admin user', async () => {
      const other = await createTestUser({
        email: 'notadmindel@example.com',
        password: 'Deleter123!',
        role: 'member'
      });
      const login = await loginHelper(other.email, 'Deleter123!');
      const admin = await User.findOne({ email: 'admin@example.com' });
      const post = await Post.create({
        title: 'No Delete Access',
        description: 'Some description here',
        category: 'Test',
        status: 'open',
        street: '123 A St',
        postalCode: '00000',
        createdBy: admin.id
      });

      const res = await request(server)
        .delete(`/api/admin/posts/${post.id}`)
        .set('Cookie', login.authCookie)
        .set('X-CSRF-Token', login.csrfToken);

      expect(res.status).toBe(403);
    });
  });

});