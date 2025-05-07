// To Validate and sanitize input

const { check, param } = require("express-validator");

exports.validateUserId =[
  param('id')
  .isMongoId().withMessage('Invalid user ID')
]

