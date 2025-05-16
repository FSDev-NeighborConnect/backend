const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logUserOut } = require('../controllers/authController');
const { validateLogIn, validateSignUp } = require('../middleware/validator')
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
// const loginLimiter = require('../middleware/rateLimit');


//Sign Up route
router.post('/signup', validateSignUp, registerUser);

// Log in route
router.post('/login', validateLogIn, loginUser)

router.post('/logout', authenticate, csrfProtection, logUserOut);

module.exports = router;
