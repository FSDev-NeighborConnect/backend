// Will contain middleware function to check if user is authenticatedconst jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const token = req.cookies.token;  // Get token from cookie (does automatically using cookie parser)
  
    if (!token) {
      return res.status(401).json({ message: 'Token is missing!' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, role }
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
  
  module.exports = authenticate;