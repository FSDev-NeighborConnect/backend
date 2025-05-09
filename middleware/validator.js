// To Validate and sanitize input

const { check, param } = require("express-validator");

exports.validatePostCreation = [];

exports.validateUserId = [
  param('id')
    .isMongoId().withMessage('Invalid user ID')
]

