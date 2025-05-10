const User = require('../models/User');
const { comparePasswords } = require('../utils/hash');
const { setAuthCookies, createAuthPayload } = require('../services/authServices');

async function adminLogin(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials!' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only!' });
  }

  const valid = await comparePasswords(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials!' });
  }

  const { token, csrfToken } = createAuthPayload(user);

  setAuthCookies(res, token);

  return res.status(200).json({ message: 'Admin logged in.' }, csrfToken);
}

module.exports = { adminLogin };
