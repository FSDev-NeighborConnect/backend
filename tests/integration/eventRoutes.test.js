const request = require('supertest');
const server = require('../../server.js');
const User = require('../../models/User.js');
const Event = require('../../models/Event.js');
const createTestUser = require('../utils/testUser.js');
const createTestEvent = require('../utils/testEvent.js');
const loginHelper = require('../utils/testAuth.js');
const { setupTestDB, teardownTestDB, clearDB } = require('../utils/testDb.js');
const mongoose = require('mongoose');

let authCookie, csrfToken, user;

beforeAll(setupTestDB);
beforeEach(async () => {
  await clearDB();
  user = await createTestUser();
  ({ authCookie, csrfToken } = await loginHelper(user.email, 'Password123!'));
});
afterAll(teardownTestDB);

describe('Event Routes (integration)', () => {

  describe('POST /api/events/event', () => {
    it('creates a new event successfully', async () => {
      const eventData = {
        eventImage: 'Test (no need to load resources)',
        title: 'Test Event',
        date: new Date().toISOString(),
        startTime: new Date().toISOString(),
        endTime: new Date(new Date().getTime() + 3600000).toISOString(),
        streetAddress: '123 Test St',
        postalCode: user.postalCode,
        description: 'This is a valid event description.'
      };

      const res = await request(server)
        .post('/api/events/event')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send(eventData);

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/event created successfully/i);

      const events = await Event.find({ createdBy: user.id });
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe(eventData.title);
    });

    it('returns 404 if authenticated user not found in DB', async () => {
      // Delete user to simulate missing user
      await User.findByIdAndDelete(user.id);

      const res = await request(server)
        .post('/api/events/event')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({});

      expect(res.status).toBe(401); // Auth middleware rejects user missing from DB
      expect(res.body.message).toBe('User no longer exists!');
    });

    it('triggers global error handler on schema validation failure', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => { });

      const res = await request(server)
        .post('/api/events/event')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ title: 'Too Short' }); // Missing required fields

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/server error/i);

      console.error.mockRestore();
    });

  });

  describe('GET /api/events/zip', () => {
    it('fetches events in user postal code', async () => {
      await createTestEvent({ createdBy: user.id, postalCode: user.postalCode });

      const res = await request(server)
        .get('/api/events/zip')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.events)).toBe(true);
      expect(res.body.events[0].createdBy.name).toBe(user.name);
    });
  });

  describe('GET /api/events/user/:id', () => {
    it('fetches events created by a specific user', async () => {
      await createTestEvent({ createdBy: user.id });

      const res = await request(server)
        .get(`/api/events/user/${user.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.eventDetails)).toBe(true);
      expect(res.body.eventDetails[0].createdBy.name).toBe(user.name);
    });

    it('returns 404 if user has no events', async () => {
      const otherId = new mongoose.Types.ObjectId().toString();
      const res = await request(server)
        .get(`/api/events/user/${otherId}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/no events created by user/i);
    });
  });

  describe('GET /api/events/:id', () => {
    it('fetches event by ID', async () => {
      const event = await createTestEvent({ createdBy: user.id });
      const res = await request(server)
        .get(`/api/events/${event.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.eventDetails._id).toBe(event.id);
    });

    it('returns 404 if event not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(server)
        .get(`/api/events/${fakeId}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Page not found');
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('deletes own event', async () => {
      const event = await createTestEvent({ createdBy: user.id });
      const res = await request(server)
        .delete(`/api/events/${event.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);
      const found = await Event.findById(event.id);
      expect(found).toBeNull();
    });

    it('returns 403 if not owner', async () => {
      const other = await createTestUser({ email: 'other@test.com' });
      const event = await createTestEvent({ createdBy: other.id });
      const res = await request(server)
        .delete(`/api/events/${event.id}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not the owner/i);
    });

    it('returns 404 if event not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(server)
        .delete(`/api/events/${fakeId}`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Event not found');
    });
  });

  describe('POST /api/events/events/:eventId/rsvp', () => {
    it('RSVPs to an event successfully', async () => {
      const event = await createTestEvent({ createdBy: user.id });
      const res = await request(server)
        .post(`/api/events/events/${event.id}/rsvp`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/rsvp successful/i);
      expect(res.body.totalRsvp).toBe(1);
    });

    it('returns 400 if already RSVP\'d', async () => {
      const event = await createTestEvent({ createdBy: user.id });
      // First RSVP
      await request(server)
        .post(`/api/events/events/${event.id}/rsvp`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);
      // Second RSVP
      const res = await request(server)
        .post(`/api/events/events/${event.id}/rsvp`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already rsvp/i);
    });

    it('returns 404 if event not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(server)
        .post(`/api/events/events/${fakeId}/rsvp`)
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Event not found');
    });
  });
});
