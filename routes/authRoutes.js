const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { validateLogIn, validateSignUp } = require('../middleware/validator')
// const loginLimiter = require('../middleware/rateLimit');


//Sign Up route
router.post('/signup', validateSignUp, registerUser);

// Log in route
router.post('/login', validateLogIn, loginUser)

module.exports = router;
