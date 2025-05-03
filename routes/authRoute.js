const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/registerUserController');


//Sign Up route
router.post('/signup', registerUser);

// Log in route
router.post('/login', loginUser)

module.exports = router;
