const request = require('supertest');
const server = require('../../server.js');
const Post = require('../../models/Post.js');
const createTestUser = require('../utils/testUser.js');
const loginHelper = require('../utils/testAuth.js');
const { setupTestDB, teardownTestDB, clearDB } = require('../utils/testDb.js');

let user, authCookie, csrfToken;

beforeAll(setupTestDB);
beforeEach(async () => {
  await clearDB();
  user = await createTestUser();
  ({ authCookie, csrfToken } = await loginHelper(user.email, 'Password123!'));
});
afterAll(teardownTestDB);

describe('Post Routes (integration)', () => {
  describe('POST /api/posts/post', () => {
    it('should create a new post', async () => {
      const postData = {
        title: 'Help with groceries',
        description: 'Need help carrying bags',
        category: 'Errand',
        status: 'open'
      };

      const res = await request(server)
        .post('/api/posts/post')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send(postData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Post created successfully');
    });
  });

  describe('GET /api/posts/all/posts', () => {
    it('should fetch all posts', async () => {
      await Post.create({
        title: 'Lawn mowing',
        description: 'Need help mowing lawn',
        category: 'Yard',
        status: 'open',
        street: user.streetAddress,
        postalCode: user.postalCode,
        createdBy: user.id
      });

      const res = await request(server)
        .get('/api/posts/all/posts')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/posts/zip', () => {
    it('should fetch posts by user postal code', async () => {
      await Post.create({
        title: 'Package pickup',
        description: 'Need help with a pickup',
        category: 'Errand',
        status: 'open',
        street: user.streetAddress,
        postalCode: user.postalCode,
        createdBy: user.id
      });

      const res = await request(server)
        .get('/api/posts/zip')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body[0].postalCode).toBe(user.postalCode);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a post by ID', async () => {
      const post = await Post.create({
        title: 'Test Post',
        description: 'Test Description here',
        category: 'Misc',
        status: 'open',
        street: user.streetAddress,
        postalCode: user.postalCode,
        createdBy: user.id
      });

      const res = await request(server)
        .get(`/api/posts/${post.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.postDetails._id).toBe(post.id);
    });

    it('returns 404 if post not found', async () => {
      const res = await request(server)
        .get('/api/posts/64f0f0000000000000000000')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('allows post owner to delete post', async () => {
      const post = await Post.create({
        title: 'To delete',
        description: 'Temporary description',
        category: 'Errand',
        status: 'open',
        street: user.streetAddress,
        postalCode: user.postalCode,
        createdBy: user.id
      });

      const res = await request(server)
        .delete(`/api/posts/${post.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
    });

    it('blocks user from deleting someone else’s post', async () => {
      const otherUser = await createTestUser({ email: 'someone@else.com' });
      const post = await Post.create({
        title: 'Owned by someone else',
        description: 'Private description here',
        category: 'Other',
        status: 'open',
        street: otherUser.streetAddress,
        postalCode: otherUser.postalCode,
        createdBy: otherUser.id
      });

      const res = await request(server)
        .delete(`/api/posts/${post.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/posts/user/:id', () => {
    it('returns all posts by a user ID', async () => {
      await Post.create({
        title: 'Dog Walking',
        description: 'Help with walking the dog',
        category: 'Pet',
        status: 'open',
        street: user.streetAddress,
        postalCode: user.postalCode,
        createdBy: user.id
      });

      const res = await request(server)
        .get(`/api/posts/user/${user.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body[0].createdBy).toBe(user.id);
    });

    it('returns 404 if no posts found', async () => {
      const otherUser = await createTestUser({ email: 'empty@user.com' });

      const res = await request(server)
        .get(`/api/posts/user/${otherUser.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
    });
  });
});
