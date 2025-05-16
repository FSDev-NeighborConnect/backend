const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate random CSRF token
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function createAuthPayload(user) {
  const csrfToken = generateCsrfToken();

  const token = jwt.sign(
    { id: user._id, role: user.role, csrfToken },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, csrfToken };
}

function setAuthCookies(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // sends cookie only over https when server is deployed
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // stop frontend - backend communication from breaking due to separate deployment or different local ports
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

}

// Logout logic for endpoint, to be implemented later
function clearAuthCookies(res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None'
  });
}

module.exports = { setAuthCookies, clearAuthCookies, createAuthPayload };