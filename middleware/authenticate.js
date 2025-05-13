const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authenticate(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Access forbidden, user not authenticated!' });
  }


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists!' });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      csrfToken: decoded.csrfToken,
    };

    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token!' });
  }
};


module.exports = { authenticate };