// Middleware to force routes to expect csrf header token, then compared with JWT in http only cookie 

function csrfProtection(req, res, next) {
  const headerToken = req.headers['x-csrf-token'];

  if (!headerToken || headerToken !== req.user?.csrfToken) {
    return res.status(403).json({ message: 'Invalid CSRF token!' });
  }

  next();
}

module.exports = { csrfProtection };