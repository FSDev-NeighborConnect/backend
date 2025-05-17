const request = require('supertest');
const server = require('../../server.js');
const Post = require('../../models/Post.js');
const Comment = require('../../models/Comment.js');
const createTestUser = require('../utils/testUser.js');
const loginHelper = require('../utils/testAuth.js');
const { setupTestDB, teardownTestDB, clearDB } = require('../utils/testDb.js');

let admin, user, post, authCookie, csrfToken;

beforeAll(setupTestDB);
beforeEach(async () => {
  await clearDB();
  user = await createTestUser();
  admin = await createTestUser({ email: 'admin@site.com', role: 'admin' });

  post = await Post.create({
    title: 'Admin Test Post',
    description: 'Admin wants comments',
    status: 'open',
    street: user.streetAddress,
    postalCode: user.postalCode,
    createdBy: user.id,
  });

  await Comment.create({
    content: 'Visible comment',
    post: post.id,
    author: user.id,
  });

  const login = await loginHelper(admin.email, 'Password123!');
  authCookie = login.authCookie;
  csrfToken = login.csrfToken;
});
afterAll(teardownTestDB);

describe('Admin Routes - Comment Operations (integration)', () => {
  describe('GET /api/admin/all/comments', () => {
    it('fetches all comments with author and post populated', async () => {
      const res = await request(server)
        .get('/api/admin/all/comments')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('author');
      expect(res.body[0]).toHaveProperty('post');
    });
  });

  describe('DELETE /api/admin/comments/:id', () => {
    it('deletes a comment as admin', async () => {
      const comment = await Comment.create({
        content: 'To be removed',
        post: post.id,
        author: user.id,
      });

      const res = await request(server)
        .delete(`/api/admin/comments/${comment.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Comment deleted by admin');
    });

    it('returns 404 if comment is not found', async () => {
      const res = await request(server)
        .delete('/api/admin/comments/64f0f0000000000000000000')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Comment not found!');
    });
  });
});