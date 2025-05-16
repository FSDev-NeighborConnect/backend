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
    category: 'General',
    status: 'open',
    street: user.streetAddress,
    postalCode: user.postalCode,
    createdBy: user.id
  });
});
afterAll(teardownTestDB);
