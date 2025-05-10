const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// One function for both JWT & CSRF cookies, latter will be added
function setAuthCookies(res, user) {
  const token = generateToken(user);

  // JWT cookie (httpOnly)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // sends cookie only over https when server is deployed
    sameSite: 'None', // stop frontend - backend communication from breaking due to separate deployment or different local ports
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

module.exports = { setAuthCookies, clearAuthCookies };