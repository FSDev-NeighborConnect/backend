// To Validate and sanitize input

const { check, param } = require("express-validator");

const validatePostID = [];

const validatePostCreation = [];

const validateSignUp = [];

const validateLogIn = [];

const validateUserId = [
  param('id')
    .isMongoId().withMessage('Invalid user ID')
]

module.exports = { validateSignUp, validateUserId, validateLogIn, validatePostCreation, validatePostID };