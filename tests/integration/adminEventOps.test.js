const request = require('supertest');
const server = require('../../server.js');
const User = require('../../models/User.js');
const createTestUser = require('../utils/testUser.js');
const createTestEvent = require('../utils/testEvent.js');
const loginHelper = require('../utils/testAuth.js');
const { setupTestDB, teardownTestDB, clearDB } = require('../utils/testDb.js');
const mongoose = require('mongoose');

let authCookie, csrfToken;

beforeAll(setupTestDB);

beforeEach(async () => {
  await clearDB();

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

describe('Admin Routes - Event Operations (integration)', () => {
  describe('GET /api/admin/all/events', () => {
    it('fetches all events', async () => {
      const admin = await User.findOne({ email: 'admin@example.com' });
      await createTestEvent({
        title: 'Sample Event',
        description: 'An event for testing',
        location: 'Park Center',
        createdBy: admin.id
      });

      const res = await request(server)
        .get('/api/admin/all/events')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/admin/events/:id', () => {
    it('updates an event', async () => {
      const admin = await User.findOne({ email: 'admin@example.com' });
      const event = await createTestEvent({
        title: 'Old Title',
        description: 'Details (making this description long enough)',
        location: 'Hall',
        createdBy: admin.id
      });

      const res = await request(server)
        .put(`/api/admin/events/${event.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/event updated/i);
    });

    it('returns 404 if event not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(server)
        .put(`/api/admin/events/${fakeId}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ title: 'Won’t work' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Event not found!');
    });
  });

  describe('DELETE /api/admin/events/:id', () => {
    it('deletes an event', async () => {
      const admin = await User.findOne({ email: 'admin@example.com' });
      const event = await createTestEvent({
        title: 'Delete Me',
        description: 'To be deleted',
        location: 'Main Street',
        createdBy: admin.id
      });

      const res = await request(server)
        .delete(`/api/admin/events/${event.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);
    });

    it('returns 404 if event not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(server)
        .delete(`/api/admin/events/${fakeId}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Event not found.');
    });
  });
});
