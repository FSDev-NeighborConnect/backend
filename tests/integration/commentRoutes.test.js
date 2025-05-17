const request = require('supertest');
const server = require('../../server.js');
const Post = require('../../models/Post.js');
const Comment = require('../../models/Comment.js');
const createTestUser = require('../utils/testUser.js');
const loginHelper = require('../utils/testAuth.js');
const { setupTestDB, teardownTestDB, clearDB } = require('../utils/testDb.js');

let user, authCookie, csrfToken, post;

beforeAll(setupTestDB);
beforeEach(async () => {
  await clearDB();
  user = await createTestUser();
  ({ authCookie, csrfToken } = await loginHelper(user.email, 'Password123!'));
  post = await Post.create({
    title: 'Post for Comments',
    description: 'Testing comments',
    status: 'open',
    street: user.streetAddress,
    postalCode: user.postalCode,
    createdBy: user.id
  });
});
afterAll(teardownTestDB);

describe('Comment Routes (integration)', () => {
  describe('POST /api/posts/:postId/comments', () => {
    it('should create a comment on a post', async () => {
      const res = await request(server)
        .post(`/api/posts/${post.id}/comments`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ content: 'Nice work!' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Comment posted');
      expect(res.body.comment.post).toBe(post.id);
    });

    it('returns 404 if post does not exist', async () => {
      const res = await request(server)
        .post('/api/posts/64f0f0000000000000000000/comments')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ content: 'Test comment' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post not found');
    });
  });

  describe('GET /api/posts/:postId/comments', () => {
    it('should get comments for a post', async () => {
      await Comment.create({
        content: 'Example comment',
        post: post.id,
        author: user.id
      });

      const res = await request(server)
        .get(`/api/posts/${post.id}/comments`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].content).toBe('Example comment');
    });

    it('returns 404 if post not found', async () => {
      const res = await request(server)
        .get('/api/posts/64f0f0000000000000000000/comments')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post not found');
    });
  });

  describe('DELETE /api/posts/:postId/comments/:id', () => {
    it('allows user to delete their own comment', async () => {
      const comment = await Comment.create({
        content: 'Delete me',
        post: post.id,
        author: user.id
      });

      const res = await request(server)
        .delete(`/api/posts/${post.id}/comments/${comment.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Comment deleted');
    });

    it('blocks user from deleting someone else\'s comment', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const comment = await Comment.create({
        content: 'Not yours',
        post: post.id,
        author: otherUser.id
      });

      const res = await request(server)
        .delete(`/api/posts/${post.id}/comments/${comment.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/only delete your own/i);
    });

    it('returns 404 if comment does not exist', async () => {
      const fakeId = '64f0f0000000000000000000';
      const res = await request(server)
        .delete(`/api/posts/${post.id}/comments/${fakeId}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Comment not found');
    });
  });
});