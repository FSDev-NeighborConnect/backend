// To Validate and sanitize input

const { check, param } = require("express-validator");


exports.validateLogIn = [
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


exports.validatePostID = [
  param('id')
    .isMongoId()
    .withMessage ('Invalid ID !')
]


exports.validatePostCreation = [
  check('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5-100 characters'),

  check('description')
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),

  check('status')
    .notEmpty()
    .isIn('open', 'in progress', 'closed').withMessage('Must be open, in progress or closed')
];


exports.validateSignUp = [
  check ('name').notEmpty().withMessage('Name is required')
  .isLength({min: 4}).withMessage('Name must be at least 4 characters')
  .matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain only letters and spaces')
    .trim(),

  check ('email')
  .notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Enter a valid email'). normalizeEmail(),

  check ('password')
    .notEmpty().withMessage('Password is required')
    .isLength({min:8}).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),

  check ('streetAddress')
    .notEmpty().withMessage('Street address is required')
    .isLength({ min: 5 }).withMessage('Address must be at least 5 characters')
    .matches(/^[0-9\s-]{4,10}$/).withMessage('Invalid postal code format'),
    
    check('phone')
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('any').withMessage('Enter a valid phone number'),

  // Avatar URL: optional, must be a valid URL
  check('avatarUrl')
    .optional()
    .isURL().withMessage('Avatar must be a valid URL'),

  // Bio: optional, length limit
  check('bio')
    .optional()
    .isLength({ max: 500 }).withMessage('Bio must be at most 300 characters'),

  // Role: required, must be one of the accepted values
  check('role')
    .optional()
    .isIn(['member', 'admin']).withMessage('Role must be either user or admin'),

  // Hobbies: optional, must be an array of strings if provided
  check('hobbies')
    .optional()
    .isArray().withMessage('Hobbies must be an array')
    .custom((arr) => arr.every(item => typeof item === 'string')).withMessage('Each hobby must be a string')
];











