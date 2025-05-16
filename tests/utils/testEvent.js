const Event = require('../../models/Event');

async function createTestEvent(overrides = {}) {
  const now = new Date();

  const defaultEvent = {
    title: 'Test Event',
    description: 'A default description that is long enough.',
    location: 'Default Location',
    date: now,
    startTime: now,
    endTime: new Date(now.getTime() + 60 * 60 * 24 * 1000),
    streetAddress: '123 Test St',
    postalCode: '12345',
    createdBy: overrides.createdBy || '000000000000000000000001' // fake ObjectId
  };

  return await Event.create({ ...defaultEvent, ...overrides });
}

module.exports = createTestEvent;