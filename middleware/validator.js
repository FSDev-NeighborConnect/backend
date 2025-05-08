// To Validate and sanitize input
const {sanitizeHtml} = require('./sanitizeHtml')
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

// To validate & Sanitize LogIn request    
exports.validateLogIn = [
  sanitizeInputFields(['email', 'password']),
  check ('email')
    .isEmail() // to check if input is a valid email id 
    .withMessage ('Enter a valid email.')
    .trim()
    .escape(),// removes dangerous characters

    check ('password')
      .isLength({min: 8})
      .withMessage ('Password should be of minimum 8 chars.')
      .trim()
];

// To validate Post ID request
exports.validatePostId = [
  param('id')
    .isMongoId()
    .withMessage ('Invalid ID !')
];