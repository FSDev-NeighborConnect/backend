const request = require('supertest');
const server = require('../../server');

async function loginHelper(email, password) {
  const res = await request(server)
    .post('/api/login')
    .send({ email, password });

  if (res.status !== 200) {
    throw new Error(
      `Failed to log in: ${res.status} ${JSON.stringify(res.body)}`
    );
  }

  return {
    authCookie: res.headers['set-cookie'],
    csrfToken: res.body.csrfToken,
    user: res.body.user,
  };
}

module.exports = loginHelper;
