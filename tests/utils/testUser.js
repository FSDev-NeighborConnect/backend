// tests/utils/testUser.js
const User = require('../../models/User');
const { hashPassword } = require('../../utils/hash');

async function createTestUser(overrides = {}) {
  const defaultData = {
    name: 'Tester',
    email: 'test@testing.com',
    password: 'Password123!',       // will be hashed
    streetAddress: '123 Test St',
    postalCode: '11111',
    phone: '000000000',
    role: 'member',
  };

  const data = { ...defaultData, ...overrides };
  const hashed = await hashPassword(data.password);
  const user = await User.create({ ...data, password: hashed });
  return user;
}

module.exports = { createTestUser };
