// To Validate and sanitize input

const { check, param } = require("express-validator");

// Validate the get request for all user to prevent injections
exports.validateGetAllUsers = [
  (req, res, next) => {
    const forbiddenKeys = Object.keys(req.query).filter(key =>
      key.includes('$') || key.includes('.') || key.toLowerCase().includes('password')
    );

    if (forbiddenKeys.length > 0) {
      return res.status(400).json({
        message: 'Suspicious query parameters are not allowed.'
      });
    }

    next();
  }
];